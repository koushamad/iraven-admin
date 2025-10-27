package models

import "time"

type Language struct {
	ID        int64     `json:"id" db:"id"`
	Name      string    `json:"name" db:"name"`
	Code      string    `json:"code" db:"code"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}

type Country struct {
	ID                int64     `json:"id" db:"id"`
	Name              string    `json:"name" db:"name"`
	Code              string    `json:"code" db:"code"`
	DefaultLanguageID *int64    `json:"default_language_id,omitempty" db:"default_language_id"`
	CreatedAt         time.Time `json:"created_at" db:"created_at"`
	UpdatedAt         time.Time `json:"updated_at" db:"updated_at"`
}

type CountryLanguage struct {
	CountryID  int64     `json:"country_id" db:"country_id"`
	LanguageID int64     `json:"language_id" db:"language_id"`
	CreatedAt  time.Time `json:"created_at" db:"created_at"`
}
