package models

import "time"

type Content struct {
	ID        int64     `json:"id" db:"id"`
	Slug      string    `json:"slug" db:"slug"`
	Title     string    `json:"title" db:"title"`
	Data      *string   `json:"data,omitempty" db:"data"` // JSON
	CreatedBy int64     `json:"created_by" db:"created_by"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}
