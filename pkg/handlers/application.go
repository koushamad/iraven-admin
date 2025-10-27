package handlers

import (
	"context"
	"fmt"
	"net/http"
	"strconv"

	"github.com/iraven/iraven-admin/pkg/database"
	"github.com/iraven/iraven-admin/pkg/models"
	"github.com/labstack/echo/v4"
)

type ApplicationHandler struct {
	db *database.Database
}

func NewApplicationHandler(db *database.Database) *ApplicationHandler {
	return &ApplicationHandler{db: db}
}

func (h *ApplicationHandler) List(c echo.Context) error {
	rows, err := h.db.Pool.Query(context.Background(),
		"SELECT id, name, description, domain, created_at, updated_at FROM iraven.applications ORDER BY name")
	if err != nil {
		return err
	}
	defer rows.Close()

	var apps []models.Application
	for rows.Next() {
		var app models.Application
		if err := rows.Scan(&app.ID, &app.Name, &app.Description, &app.Domain, &app.CreatedAt, &app.UpdatedAt); err != nil {
			continue
		}
		apps = append(apps, app)
	}

	data := map[string]interface{}{
		"Title":        "Applications",
		"Applications": apps,
	}

	return c.Render(http.StatusOK, "applications/list", data)
}

func (h *ApplicationHandler) Show(c echo.Context) error {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)

	var app models.Application
	err := h.db.Pool.QueryRow(context.Background(),
		"SELECT id, name, description, domain, created_at, updated_at FROM iraven.applications WHERE id = $1", id).
		Scan(&app.ID, &app.Name, &app.Description, &app.Domain, &app.CreatedAt, &app.UpdatedAt)

	if err != nil {
		return echo.NewHTTPError(http.StatusNotFound, "Application not found")
	}

	// Get clients for this application
	rows, err := h.db.Pool.Query(context.Background(),
		`SELECT id, name, description, client_id, is_active, rate_limit, webhook_url, created_at, updated_at, last_used_at
		FROM iraven.clients WHERE application_id = $1 ORDER BY name`, id)
	if err != nil {
		return err
	}
	defer rows.Close()

	var clients []models.Client
	for rows.Next() {
		var client models.Client
		if err := rows.Scan(&client.ID, &client.Name, &client.Description, &client.ClientID, &client.IsActive,
			&client.RateLimit, &client.WebhookURL, &client.CreatedAt, &client.UpdatedAt, &client.LastUsedAt); err != nil {
			continue
		}
		clients = append(clients, client)
	}

	data := map[string]interface{}{
		"Title":       "Application Details",
		"Application": app,
		"Clients":     clients,
	}

	return c.Render(http.StatusOK, "applications/show", data)
}

func (h *ApplicationHandler) New(c echo.Context) error {
	data := map[string]interface{}{
		"Title": "New Application",
	}
	return c.Render(http.StatusOK, "applications/new", data)
}

func (h *ApplicationHandler) Create(c echo.Context) error {
	name := c.FormValue("name")
	description := c.FormValue("description")
	domain := c.FormValue("domain")

	if name == "" || domain == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "Name and domain are required")
	}

	var appID int64
	err := h.db.Pool.QueryRow(context.Background(),
		"INSERT INTO iraven.applications (name, description, domain) VALUES ($1, $2, $3) RETURNING id",
		name, description, domain).Scan(&appID)

	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Failed to create application: "+err.Error())
	}

	return c.Redirect(http.StatusFound, fmt.Sprintf("/applications/%d", appID))
}

func (h *ApplicationHandler) Edit(c echo.Context) error {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)

	var app models.Application
	err := h.db.Pool.QueryRow(context.Background(),
		"SELECT id, name, description, domain FROM iraven.applications WHERE id = $1", id).
		Scan(&app.ID, &app.Name, &app.Description, &app.Domain)

	if err != nil {
		return echo.NewHTTPError(http.StatusNotFound, "Application not found")
	}

	data := map[string]interface{}{
		"Title":       "Edit Application",
		"Application": app,
	}

	return c.Render(http.StatusOK, "applications/edit", data)
}

func (h *ApplicationHandler) Update(c echo.Context) error {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	name := c.FormValue("name")
	description := c.FormValue("description")
	domain := c.FormValue("domain")

	if name == "" || domain == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "Name and domain are required")
	}

	_, err := h.db.Pool.Exec(context.Background(),
		"UPDATE iraven.applications SET name = $1, description = $2, domain = $3, updated_at = NOW() WHERE id = $4",
		name, description, domain, id)

	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Failed to update application: "+err.Error())
	}

	return c.Redirect(http.StatusFound, fmt.Sprintf("/applications/%d", id))
}

func (h *ApplicationHandler) Delete(c echo.Context) error {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)

	// Check if there are clients using this application
	var count int
	h.db.Pool.QueryRow(context.Background(),
		"SELECT COUNT(*) FROM iraven.clients WHERE application_id = $1", id).Scan(&count)

	if count > 0 {
		return echo.NewHTTPError(http.StatusBadRequest,
			fmt.Sprintf("Cannot delete application: %d clients depend on it", count))
	}

	_, err := h.db.Pool.Exec(context.Background(), "DELETE FROM iraven.applications WHERE id = $1", id)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Failed to delete application: "+err.Error())
	}

	return c.Redirect(http.StatusFound, "/applications")
}
