package models

import "time"

type Notification struct {
	ID        int64     `json:"id" db:"id"`
	UserID    int64     `json:"user_id" db:"user_id"`
	Title     string    `json:"title" db:"title"`
	Body      string    `json:"body" db:"body"`
	Data      *string   `json:"data,omitempty" db:"data"` // JSON
	Read      bool      `json:"read" db:"read"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
}

type NotificationPreference struct {
	UserID            int64     `json:"user_id" db:"user_id"`
	EmailNotifications bool     `json:"email_notifications" db:"email_notifications"`
	PushNotifications  bool     `json:"push_notifications" db:"push_notifications"`
	SMSNotifications   bool     `json:"sms_notifications" db:"sms_notifications"`
	CreatedAt         time.Time `json:"created_at" db:"created_at"`
	UpdatedAt         time.Time `json:"updated_at" db:"updated_at"`
}

type NotificationDevice struct {
	ID        int64     `json:"id" db:"id"`
	UserID    int64     `json:"user_id" db:"user_id"`
	DeviceToken string  `json:"device_token" db:"device_token"`
	DeviceType  string  `json:"device_type" db:"device_type"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
}
