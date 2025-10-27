package middleware

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

const (
	UserIDKey   = "user_id"
	UserNameKey = "user_name"
	UserRolesKey = "user_roles"
)

func RequireAuth(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		sess, err := getSession(c)
		if err != nil || sess.Values[UserIDKey] == nil {
			return c.Redirect(http.StatusFound, "/login")
		}
		return next(c)
	}
}

func RequireAdmin(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		sess, err := getSession(c)
		if err != nil || sess.Values[UserIDKey] == nil {
			return c.Redirect(http.StatusFound, "/login")
		}

		// Check if user has admin role
		roles, ok := sess.Values[UserRolesKey].([]string)
		if !ok {
			return echo.NewHTTPError(http.StatusForbidden, "Access denied")
		}

		hasAdmin := false
		for _, role := range roles {
			if role == "admin" {
				hasAdmin = true
				break
			}
		}

		if !hasAdmin {
			return echo.NewHTTPError(http.StatusForbidden, "Admin access required")
		}

		return next(c)
	}
}

func getSession(c echo.Context) (*Session, error) {
	// Get session from context or cookie
	sess := c.Get("session")
	if sess != nil {
		return sess.(*Session), nil
	}
	return nil, echo.NewHTTPError(http.StatusUnauthorized, "Session not found")
}

// Simple session struct - in production, use a proper session library
type Session struct {
	Values map[string]interface{}
}
