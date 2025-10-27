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

type RoleHandler struct {
	db *database.Database
}

func NewRoleHandler(db *database.Database) *RoleHandler {
	return &RoleHandler{db: db}
}

func (h *RoleHandler) List(c echo.Context) error {
	rows, err := h.db.Pool.Query(context.Background(),
		"SELECT id, name, description, created_at, updated_at FROM iraven.roles ORDER BY name")
	if err != nil {
		return err
	}
	defer rows.Close()

	var roles []models.Role
	for rows.Next() {
		var r models.Role
		if err := rows.Scan(&r.ID, &r.Name, &r.Description, &r.CreatedAt, &r.UpdatedAt); err != nil {
			continue
		}
		roles = append(roles, r)
	}

	data := map[string]interface{}{
		"Title": "Roles",
		"Roles": roles,
	}

	return c.Render(http.StatusOK, "roles/list", data)
}

func (h *RoleHandler) Show(c echo.Context) error {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)

	var r models.Role
	err := h.db.Pool.QueryRow(context.Background(),
		"SELECT id, name, description, created_at, updated_at FROM iraven.roles WHERE id = $1", id).
		Scan(&r.ID, &r.Name, &r.Description, &r.CreatedAt, &r.UpdatedAt)

	if err != nil {
		return echo.NewHTTPError(http.StatusNotFound, "Role not found")
	}

	// Get users with this role
	rows, err := h.db.Pool.Query(context.Background(),
		`SELECT u.id, u.email, u.name FROM iraven.users u
		INNER JOIN iraven.user_roles ur ON u.id = ur.user_id
		WHERE ur.role_id = $1 ORDER BY u.name`, id)
	if err != nil {
		return err
	}
	defer rows.Close()

	var users []models.User
	for rows.Next() {
		var u models.User
		if err := rows.Scan(&u.ID, &u.Email, &u.Name); err != nil {
			continue
		}
		users = append(users, u)
	}

	data := map[string]interface{}{
		"Title": "Role Details",
		"Role":  r,
		"Users": users,
	}

	return c.Render(http.StatusOK, "roles/show", data)
}

func (h *RoleHandler) New(c echo.Context) error {
	data := map[string]interface{}{
		"Title": "New Role",
	}
	return c.Render(http.StatusOK, "roles/new", data)
}

func (h *RoleHandler) Create(c echo.Context) error {
	name := c.FormValue("name")
	description := c.FormValue("description")

	if name == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "Name is required")
	}

	var roleID int64
	err := h.db.Pool.QueryRow(context.Background(),
		"INSERT INTO iraven.roles (name, description) VALUES ($1, $2) RETURNING id",
		name, description).Scan(&roleID)

	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Failed to create role: "+err.Error())
	}

	return c.Redirect(http.StatusFound, fmt.Sprintf("/roles/%d", roleID))
}

func (h *RoleHandler) Edit(c echo.Context) error {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)

	var r models.Role
	err := h.db.Pool.QueryRow(context.Background(),
		"SELECT id, name, description FROM iraven.roles WHERE id = $1", id).
		Scan(&r.ID, &r.Name, &r.Description)

	if err != nil {
		return echo.NewHTTPError(http.StatusNotFound, "Role not found")
	}

	data := map[string]interface{}{
		"Title": "Edit Role",
		"Role":  r,
	}

	return c.Render(http.StatusOK, "roles/edit", data)
}

func (h *RoleHandler) Update(c echo.Context) error {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	name := c.FormValue("name")
	description := c.FormValue("description")

	if name == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "Name is required")
	}

	_, err := h.db.Pool.Exec(context.Background(),
		"UPDATE iraven.roles SET name = $1, description = $2, updated_at = NOW() WHERE id = $3",
		name, description, id)

	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Failed to update role: "+err.Error())
	}

	return c.Redirect(http.StatusFound, fmt.Sprintf("/roles/%d", id))
}

func (h *RoleHandler) Delete(c echo.Context) error {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)

	// Check if role is in use
	var count int
	h.db.Pool.QueryRow(context.Background(),
		"SELECT COUNT(*) FROM iraven.user_roles WHERE role_id = $1", id).Scan(&count)

	if count > 0 {
		return echo.NewHTTPError(http.StatusBadRequest,
			fmt.Sprintf("Cannot delete role: %d users have this role", count))
	}

	_, err := h.db.Pool.Exec(context.Background(), "DELETE FROM iraven.roles WHERE id = $1", id)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Failed to delete role: "+err.Error())
	}

	return c.Redirect(http.StatusFound, "/roles")
}
