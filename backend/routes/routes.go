// Package routes
package routes

import (
	"github.com/gofiber/fiber/v3"
	"backend/handlers"
)

func SetupRoutes(app *fiber.App) {
	api := app.Group("/api")

	
	todoRoutes := api.Group("/todos")
	todoRoutes.Get("/", handlers.GetTodos)
	todoRoutes.Get("/:id", handlers.GetTodo)
	todoRoutes.Post("/", handlers.CreateTodo)
	todoRoutes.Put("/:id", handlers.UpdateTodo)
	todoRoutes.Delete("/:id", handlers.DeleteTodo)
}