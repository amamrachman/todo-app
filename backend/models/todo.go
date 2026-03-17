// Package models
package models

import (
	"time"
)

type Todo struct {
	ID        uint      `json:"id" gorm:"primaryKey;index"`
	Title     string    `json:"title" gorm:"type:varchar(200);not null;index:idx_todo_title"`
	Completed bool      `json:"completed" gorm:"default:false;index:idx_todo_completed"`
	CreatedAt time.Time `json:"created_at" gorm:"index:idx_todo_created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func (Todo) TableName() string {
	return "todos"
}