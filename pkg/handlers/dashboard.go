package handlers

import (
	"context"
	"net/http"

	"github.com/iraven/iraven-admin/pkg/database"
	"github.com/iraven/iraven-admin/pkg/middleware"
	"github.com/labstack/echo/v4"
)

type DashboardHandler struct {
	db *database.Database
}

func NewDashboardHandler(db *database.Database) *DashboardHandler {
	return &DashboardHandler{db: db}
}

func (h *DashboardHandler) Index(c echo.Context) error {
	session, _ := middleware.GetSession(c)
	userName := session.Values[middleware.UserNameKey]

	// Get statistics
	var userCount, roleCount, appCount, contentCount int64

	h.db.Pool.QueryRow(context.Background(), "SELECT COUNT(*) FROM iraven.users").Scan(&userCount)
	h.db.Pool.QueryRow(context.Background(), "SELECT COUNT(*) FROM iraven.roles").Scan(&roleCount)
	h.db.Pool.QueryRow(context.Background(), "SELECT COUNT(*) FROM iraven.applications").Scan(&appCount)
	h.db.Pool.QueryRow(context.Background(), "SELECT COUNT(*) FROM iraven.content").Scan(&contentCount)

	data := map[string]interface{}{
		"UserName":     userName,
		"UserCount":    userCount,
		"RoleCount":    roleCount,
		"AppCount":     appCount,
		"ContentCount": contentCount,
		"Title":        "Dashboard",
	}

	return c.Render(http.StatusOK, "dashboard", data)
}
