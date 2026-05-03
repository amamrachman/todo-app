// Package config
package config

import (
	"fmt"
	"log"
	"os"
	"time"

	"backend/models"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func ConnectDatabase() {

	if err := godotenv.Load(); err != nil {
		log.Println("Info: .env file not found, using system environment variables")
	}

	host := getEnv("DB_HOST", "localhost")
	port := getEnv("DB_PORT", "5432")
	user := getEnv("DB_USER", "postgres")
	pass := getEnv("DB_PASSWORD", "password")
	name := getEnv("DB_NAME", "todo_db")

	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable TimeZone=Asia/Jakarta",
		host, port, user, pass, name,
	)

	var db *gorm.DB
	var err error

	gormConfig := &gorm.Config{
		Logger:      logger.Default.LogMode(logger.Silent),
		PrepareStmt: true,
	}

	db, err = gorm.Open(postgres.New(postgres.Config{
		DSN:                  dsn,
		PreferSimpleProtocol: true,
	}), gormConfig)

	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	sqlDB, _ := db.DB()
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)

	if err := db.AutoMigrate(&models.Todo{}); err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	DB = db
	log.Printf("Database connected successfully to host: %s", host)
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
