package models

import "time"

type Application struct {
	ID          int64     `json:"id" db:"id"`
	Name        string    `json:"name" db:"name"`
	Description *string   `json:"description,omitempty" db:"description"`
	Domain      string    `json:"domain" db:"domain"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
}

type Client struct {
	ID          int64      `json:"id" db:"id"`
	Name        string     `json:"name" db:"name"`
	Description *string    `json:"description,omitempty" db:"description"`
	ClientID    string     `json:"client_id" db:"client_id"`
	IsActive    bool       `json:"is_active" db:"is_active"`
	RateLimit   int        `json:"rate_limit" db:"rate_limit"`
	WebhookURL  *string    `json:"webhook_url,omitempty" db:"webhook_url"`
	ApplicationID int64    `json:"application_id" db:"application_id"`
	CreatedAt   time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at" db:"updated_at"`
	LastUsedAt  *time.Time `json:"last_used_at,omitempty" db:"last_used_at"`
}

type ApplicationRole struct {
	ApplicationID int64     `json:"application_id" db:"application_id"`
	RoleID        int64     `json:"role_id" db:"role_id"`
	CreatedAt     time.Time `json:"created_at" db:"created_at"`
}
