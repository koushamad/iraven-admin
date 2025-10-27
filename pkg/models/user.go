package models

import (
	"time"
)

type User struct {
	ID            int64      `json:"id" db:"id"`
	Email         string     `json:"email" db:"email"`
	Name          string     `json:"name" db:"name"`
	Picture       *string    `json:"picture,omitempty" db:"picture"`
	GoogleID      *string    `json:"google_id,omitempty" db:"google_id"`
	EmailVerified bool       `json:"email_verified" db:"email_verified"`
	LastLogin     *time.Time `json:"last_login,omitempty" db:"last_login"`
	CreatedAt     time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt     time.Time  `json:"updated_at" db:"updated_at"`
}

type Profile struct {
	UserID     int64     `json:"user_id" db:"user_id"`
	LanguageID *int64    `json:"language_id,omitempty" db:"language_id"`
	CountryID  *int64    `json:"country_id,omitempty" db:"country_id"`
	Photo      *string   `json:"photo,omitempty" db:"photo"`
	ExtraData  *string   `json:"extra_data,omitempty" db:"extra_data"` // JSON
	CreatedAt  time.Time `json:"created_at" db:"created_at"`
	UpdatedAt  time.Time `json:"updated_at" db:"updated_at"`
}

type Role struct {
	ID          int64     `json:"id" db:"id"`
	Name        string    `json:"name" db:"name"`
	Description *string   `json:"description,omitempty" db:"description"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
}

type UserRole struct {
	UserID    int64     `json:"user_id" db:"user_id"`
	RoleID    int64     `json:"role_id" db:"role_id"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
}

type UserWithRoles struct {
	User
	Roles []Role `json:"roles,omitempty"`
}
