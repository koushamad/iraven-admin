package models

import "time"

type Payment struct {
	ID              int64     `json:"id" db:"id"`
	UserID          int64     `json:"user_id" db:"user_id"`
	Amount          int64     `json:"amount" db:"amount"`
	Currency        string    `json:"currency" db:"currency"`
	Status          string    `json:"status" db:"status"`
	StripePaymentID string    `json:"stripe_payment_id" db:"stripe_payment_id"`
	Description     *string   `json:"description,omitempty" db:"description"`
	CreatedAt       time.Time `json:"created_at" db:"created_at"`
	UpdatedAt       time.Time `json:"updated_at" db:"updated_at"`
}
