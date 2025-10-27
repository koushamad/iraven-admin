package handlers

import (
	"context"
	"net/http"

	"github.com/iraven/iraven-admin/pkg/database"
	"github.com/iraven/iraven-admin/pkg/middleware"
	"github.com/labstack/echo/v4"
	"golang.org/x/crypto/bcrypt"
)

type AuthHandler struct {
	db *database.Database
}

func NewAuthHandler(db *database.Database) *AuthHandler {
	return &AuthHandler{db: db}
}

func (h *AuthHandler) ShowLogin(c echo.Context) error {
	return c.Render(http.StatusOK, "login", nil)
}

func (h *AuthHandler) Login(c echo.Context) error {
	email := c.FormValue("email")
	password := c.FormValue("password")

	if email == "" || password == "" {
		return c.Render(http.StatusBadRequest, "login", map[string]interface{}{
			"Error": "Email and password are required",
		})
	}

	// Query user from database
	var userID int64
	var hashedPassword string
	var name string
	err := h.db.Pool.QueryRow(context.Background(),
		"SELECT id, password, name FROM iraven.users WHERE email = $1", email).
		Scan(&userID, &hashedPassword, &name)

	if err != nil {
		return c.Render(http.StatusUnauthorized, "login", map[string]interface{}{
			"Error": "Invalid credentials",
		})
	}

	// Verify password
	if err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password)); err != nil {
		return c.Render(http.StatusUnauthorized, "login", map[string]interface{}{
			"Error": "Invalid credentials",
		})
	}

	// Get user roles
	rows, err := h.db.Pool.Query(context.Background(),
		`SELECT r.name FROM iraven.roles r
		INNER JOIN iraven.user_roles ur ON r.id = ur.role_id
		WHERE ur.user_id = $1`, userID)
	if err != nil {
		return err
	}
	defer rows.Close()

	var roles []string
	for rows.Next() {
		var role string
		if err := rows.Scan(&role); err != nil {
			continue
		}
		roles = append(roles, role)
	}

	// Check if user has admin role
	hasAdmin := false
	for _, role := range roles {
		if role == "admin" {
			hasAdmin = true
			break
		}
	}

	if !hasAdmin {
		return c.Render(http.StatusForbidden, "login", map[string]interface{}{
			"Error": "Admin access required",
		})
	}

	// Create session
	session, _ := middleware.GetSession(c)
	session.Values[middleware.UserIDKey] = userID
	session.Values[middleware.UserNameKey] = name
	session.Values[middleware.UserRolesKey] = roles
	if err := middleware.SaveSession(c, session); err != nil {
		return err
	}

	return c.Redirect(http.StatusFound, "/")
}

func (h *AuthHandler) Logout(c echo.Context) error {
	session, _ := middleware.GetSession(c)
	session.Values = make(map[interface{}]interface{})
	session.Options.MaxAge = -1
	if err := middleware.SaveSession(c, session); err != nil {
		return err
	}
	return c.Redirect(http.StatusFound, "/login")
}
