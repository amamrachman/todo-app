// Package handlers
package handlers

import (
	"strconv"
	"time"

	"backend/config"
	"backend/models"

	"github.com/gofiber/fiber/v3"
	"gorm.io/gorm"
)

func GetTodos(c fiber.Ctx) error {

	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "10"))

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	offset := (page - 1) * limit

	var todos []models.Todo
	var total int64

	err := config.DB.Transaction(func(tx *gorm.DB) error {

		if err := tx.Model(&models.Todo{}).Count(&total).Error; err != nil {
			return err
		}

		if err := tx.Select("id", "title", "completed", "created_at").
			Order("created_at DESC").
			Limit(limit).
			Offset(offset).
			Find(&todos).Error; err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to fetch todos",
		})
	}

	return c.JSON(fiber.Map{
		"data": todos,
		"meta": fiber.Map{
			"page":       page,
			"limit":      limit,
			"total":      total,
			"totalPages": (total + int64(limit) - 1) / int64(limit),
		},
	})
}

func GetTodo(c fiber.Ctx) error {
	id := c.Params("id")

	cacheKey := "todo_" + id

	if cached, found := getFromCache(cacheKey); found {
		return c.JSON(cached)
	}

	var todo models.Todo

	result := config.DB.Select("id", "title", "completed", "created_at").
		Where("id = ?", id).
		First(&todo)

	if result.Error != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "Todo not found",
		})
	}

	setToCache(cacheKey, todo, 5*time.Minute)

	return c.JSON(todo)
}

func CreateTodo(c fiber.Ctx) error {

	var requestData interface{}

	if err := c.Bind().Body(&requestData); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	switch data := requestData.(type) {
	case []interface{}:

		var todos []models.Todo
		for _, item := range data {
			if itemMap, ok := item.(map[string]interface{}); ok {
				if title, ok := itemMap["title"].(string); ok && title != "" {
					todos = append(todos, models.Todo{Title: title})
				}
			}
		}

		if len(todos) == 0 {
			return c.Status(400).JSON(fiber.Map{
				"error": "No valid todos to create",
			})
		}

		result := config.DB.CreateInBatches(todos, 100)
		if result.Error != nil {
			return c.Status(500).JSON(fiber.Map{
				"error": "Failed to create todos",
			})
		}

		return c.Status(201).JSON(fiber.Map{
			"message": "Todos created successfully",
			"count":   len(todos),
		})

	default:

		todo := new(models.Todo)

		if err := c.Bind().Body(todo); err != nil {
			return c.Status(400).JSON(fiber.Map{
				"error": "Invalid request body",
			})
		}

		if todo.Title == "" {
			return c.Status(400).JSON(fiber.Map{
				"error": "Title is required",
			})
		}

		result := config.DB.Select("Title", "Completed").Create(&todo)
		if result.Error != nil {
			return c.Status(500).JSON(fiber.Map{
				"error": "Failed to create todo",
			})
		}

		return c.Status(201).JSON(todo)
	}
}

func UpdateTodo(c fiber.Ctx) error {
	id := c.Params("id")

	updates := make(map[string]interface{})

	if err := c.Bind().Body(&updates); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	allowedUpdates := map[string]bool{
		"title":     true,
		"completed": true,
	}

	updateData := make(map[string]interface{})
	for key, value := range updates {
		if allowedUpdates[key] {
			updateData[key] = value
		}
	}

	if len(updateData) == 0 {
		return c.Status(400).JSON(fiber.Map{
			"error": "No valid fields to update",
		})
	}

	result := config.DB.Model(&models.Todo{}).
		Where("id = ?", id).
		Updates(updateData)

	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to update todo",
		})
	}

	if result.RowsAffected == 0 {
		return c.Status(404).JSON(fiber.Map{
			"error": "Todo not found",
		})
	}

	deleteFromCache("todo_" + id)

	return c.JSON(fiber.Map{
		"message": "Todo updated successfully",
	})
}

func DeleteTodo(c fiber.Ctx) error {
	id := c.Params("id")

	permanent := c.Query("permanent", "false") == "true"

	var result *gorm.DB

	if permanent {

		result = config.DB.Unscoped().Delete(&models.Todo{}, id)
	} else {

		result = config.DB.Delete(&models.Todo{}, id)
	}

	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to delete todo",
		})
	}

	if result.RowsAffected == 0 {
		return c.Status(404).JSON(fiber.Map{
			"error": "Todo not found",
		})
	}

	deleteFromCache("todo_" + id)

	return c.JSON(fiber.Map{
		"message": "Todo deleted successfully",
	})
}

var cache = make(map[string]cacheItem)

type cacheItem struct {
	data      interface{}
	expiresAt time.Time
}

func getFromCache(key string) (interface{}, bool) {
	if item, found := cache[key]; found {
		if time.Now().Before(item.expiresAt) {
			return item.data, true
		}
		delete(cache, key)
	}
	return nil, false
}

func setToCache(key string, data interface{}, ttl time.Duration) {
	cache[key] = cacheItem{
		data:      data,
		expiresAt: time.Now().Add(ttl),
	}
}

func deleteFromCache(key string) {
	delete(cache, key)
}
