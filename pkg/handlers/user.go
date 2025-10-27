package handlers

import (
	"context"
	"fmt"
	"net/http"
	"strconv"

	"github.com/iraven/iraven-admin/pkg/database"
	"github.com/iraven/iraven-admin/pkg/models"
	"github.com/labstack/echo/v4"
	"golang.org/x/crypto/bcrypt"
)

type UserHandler struct {
	db *database.Database
}

func NewUserHandler(db *database.Database) *UserHandler {
	return &UserHandler{db: db}
}

func (h *UserHandler) List(c echo.Context) error {
	page, _ := strconv.Atoi(c.QueryParam("page"))
	if page < 1 {
		page = 1
	}
	pageSize := 20
	offset := (page - 1) * pageSize

	rows, err := h.db.Pool.Query(context.Background(),
		`SELECT id, email, name, picture, google_id, email_verified, last_login, created_at, updated_at
		FROM iraven.users ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
		pageSize, offset)
	if err != nil {
		return err
	}
	defer rows.Close()

	var users []models.User
	for rows.Next() {
		var u models.User
		if err := rows.Scan(&u.ID, &u.Email, &u.Name, &u.Picture, &u.GoogleID, &u.EmailVerified,
			&u.LastLogin, &u.CreatedAt, &u.UpdatedAt); err != nil {
			continue
		}
		users = append(users, u)
	}

	var totalUsers int64
	h.db.Pool.QueryRow(context.Background(), "SELECT COUNT(*) FROM iraven.users").Scan(&totalUsers)

	data := map[string]interface{}{
		"Title":      "Users",
		"Users":      users,
		"Page":       page,
		"TotalPages": (totalUsers + int64(pageSize) - 1) / int64(pageSize),
	}

	return c.Render(http.StatusOK, "users/list", data)
}

func (h *UserHandler) Show(c echo.Context) error {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)

	var u models.User
	err := h.db.Pool.QueryRow(context.Background(),
		`SELECT id, email, name, picture, google_id, email_verified, last_login, created_at, updated_at
		FROM iraven.users WHERE id = $1`, id).
		Scan(&u.ID, &u.Email, &u.Name, &u.Picture, &u.GoogleID, &u.EmailVerified, &u.LastLogin, &u.CreatedAt, &u.UpdatedAt)

	if err != nil {
		return echo.NewHTTPError(http.StatusNotFound, "User not found")
	}

	// Get user roles
	rows, err := h.db.Pool.Query(context.Background(),
		`SELECT r.id, r.name, r.description, r.created_at, r.updated_at
		FROM iraven.roles r
		INNER JOIN iraven.user_roles ur ON r.id = ur.role_id
		WHERE ur.user_id = $1`, id)
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
		"Title": "User Details",
		"User":  u,
		"Roles": roles,
	}

	return c.Render(http.StatusOK, "users/show", data)
}

func (h *UserHandler) New(c echo.Context) error {
	// Get all roles for selection
	rows, err := h.db.Pool.Query(context.Background(), "SELECT id, name FROM iraven.roles ORDER BY name")
	if err != nil {
		return err
	}
	defer rows.Close()

	var roles []models.Role
	for rows.Next() {
		var r models.Role
		if err := rows.Scan(&r.ID, &r.Name); err != nil {
			continue
		}
		roles = append(roles, r)
	}

	data := map[string]interface{}{
		"Title": "New User",
		"Roles": roles,
	}

	return c.Render(http.StatusOK, "users/new", data)
}

func (h *UserHandler) Create(c echo.Context) error {
	email := c.FormValue("email")
	name := c.FormValue("name")
	password := c.FormValue("password")

	if email == "" || name == "" || password == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "Missing required fields")
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	// Insert user
	var userID int64
	err = h.db.Pool.QueryRow(context.Background(),
		`INSERT INTO iraven.users (email, name, password, email_verified)
		VALUES ($1, $2, $3, false) RETURNING id`,
		email, name, string(hashedPassword)).Scan(&userID)

	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Failed to create user: "+err.Error())
	}

	// Assign roles if provided
	if err := c.Request().ParseForm(); err == nil {
		roleIDs := c.Request().Form["role_ids"]
		for _, roleIDStr := range roleIDs {
			roleID, _ := strconv.ParseInt(roleIDStr, 10, 64)
			h.db.Pool.Exec(context.Background(),
				"INSERT INTO iraven.user_roles (user_id, role_id) VALUES ($1, $2)",
				userID, roleID)
		}
	}

	return c.Redirect(http.StatusFound, fmt.Sprintf("/users/%d", userID))
}

func (h *UserHandler) Edit(c echo.Context) error {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)

	var u models.User
	err := h.db.Pool.QueryRow(context.Background(),
		`SELECT id, email, name, picture, email_verified FROM iraven.users WHERE id = $1`, id).
		Scan(&u.ID, &u.Email, &u.Name, &u.Picture, &u.EmailVerified)

	if err != nil {
		return echo.NewHTTPError(http.StatusNotFound, "User not found")
	}

	// Get all roles
	rows, err := h.db.Pool.Query(context.Background(), "SELECT id, name FROM iraven.roles ORDER BY name")
	if err != nil {
		return err
	}
	defer rows.Close()

	var allRoles []models.Role
	for rows.Next() {
		var r models.Role
		if err := rows.Scan(&r.ID, &r.Name); err != nil {
			continue
		}
		allRoles = append(allRoles, r)
	}

	// Get user's current roles
	rows, err = h.db.Pool.Query(context.Background(),
		"SELECT role_id FROM iraven.user_roles WHERE user_id = $1", id)
	if err != nil {
		return err
	}
	defer rows.Close()

	userRoleIDs := make(map[int64]bool)
	for rows.Next() {
		var roleID int64
		if err := rows.Scan(&roleID); err != nil {
			continue
		}
		userRoleIDs[roleID] = true
	}

	data := map[string]interface{}{
		"Title":       "Edit User",
		"User":        u,
		"Roles":       allRoles,
		"UserRoleIDs": userRoleIDs,
	}

	return c.Render(http.StatusOK, "users/edit", data)
}

func (h *UserHandler) Update(c echo.Context) error {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	name := c.FormValue("name")
	emailVerified := c.FormValue("email_verified") == "on"

	if name == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "Name is required")
	}

	// Update user
	_, err := h.db.Pool.Exec(context.Background(),
		"UPDATE iraven.users SET name = $1, email_verified = $2, updated_at = NOW() WHERE id = $3",
		name, emailVerified, id)

	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Failed to update user: "+err.Error())
	}

	// Update roles
	// First, delete all existing roles
	h.db.Pool.Exec(context.Background(), "DELETE FROM iraven.user_roles WHERE user_id = $1", id)

	// Then add new roles
	if err := c.Request().ParseForm(); err == nil {
		roleIDs := c.Request().Form["role_ids"]
		for _, roleIDStr := range roleIDs {
			roleID, _ := strconv.ParseInt(roleIDStr, 10, 64)
			h.db.Pool.Exec(context.Background(),
				"INSERT INTO iraven.user_roles (user_id, role_id) VALUES ($1, $2)",
				id, roleID)
		}
	}

	return c.Redirect(http.StatusFound, fmt.Sprintf("/users/%d", id))
}

func (h *UserHandler) Delete(c echo.Context) error {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)

	// Delete user roles first
	h.db.Pool.Exec(context.Background(), "DELETE FROM iraven.user_roles WHERE user_id = $1", id)

	// Delete user
	_, err := h.db.Pool.Exec(context.Background(), "DELETE FROM iraven.users WHERE id = $1", id)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Failed to delete user: "+err.Error())
	}

	return c.Redirect(http.StatusFound, "/users")
}
