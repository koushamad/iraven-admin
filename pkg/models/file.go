package models

import "time"

type File struct {
	ID           int64     `json:"id" db:"id"`
	Name         string    `json:"name" db:"name"`
	OriginalName string    `json:"original_name" db:"original_name"`
	MimeType     string    `json:"mime_type" db:"mime_type"`
	Size         int64     `json:"size" db:"size"`
	Path         string    `json:"path" db:"path"`
	Bucket       string    `json:"bucket" db:"bucket"`
	URL          string    `json:"url" db:"url"`
	UploadedBy   int64     `json:"uploaded_by" db:"uploaded_by"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
	UpdatedAt    time.Time `json:"updated_at" db:"updated_at"`
}

type FileAttachment struct {
	ID         int64     `json:"id" db:"id"`
	FileID     int64     `json:"file_id" db:"file_id"`
	EntityType string    `json:"entity_type" db:"entity_type"`
	EntityID   int64     `json:"entity_id" db:"entity_id"`
	CreatedAt  time.Time `json:"created_at" db:"created_at"`
}
