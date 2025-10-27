package handlers

import (
	"context"
	"fmt"
	"net/http"
	"strconv"

	"github.com/iraven/iraven-admin/pkg/database"
	"github.com/iraven/iraven-admin/pkg/middleware"
	"github.com/iraven/iraven-admin/pkg/models"
	"github.com/labstack/echo/v4"
)

type ContentHandler struct {
	db *database.Database
}

func NewContentHandler(db *database.Database) *ContentHandler {
	return &ContentHandler{db: db}
}

func (h *ContentHandler) List(c echo.Context) error {
	page, _ := strconv.Atoi(c.QueryParam("page"))
	if page < 1 {
		page = 1
	}
	pageSize := 20
	offset := (page - 1) * pageSize

	rows, err := h.db.Pool.Query(context.Background(),
		`SELECT id, slug, title, created_by, created_at, updated_at
		FROM iraven.content ORDER BY updated_at DESC LIMIT $1 OFFSET $2`,
		pageSize, offset)
	if err != nil {
		return err
	}
	defer rows.Close()

	var contents []models.Content
	for rows.Next() {
		var content models.Content
		if err := rows.Scan(&content.ID, &content.Slug, &content.Title, &content.CreatedBy,
			&content.CreatedAt, &content.UpdatedAt); err != nil {
			continue
		}
		contents = append(contents, content)
	}

	var totalContent int64
	h.db.Pool.QueryRow(context.Background(), "SELECT COUNT(*) FROM iraven.content").Scan(&totalContent)

	data := map[string]interface{}{
		"Title":      "Content",
		"Contents":   contents,
		"Page":       page,
		"TotalPages": (totalContent + int64(pageSize) - 1) / int64(pageSize),
	}

	return c.Render(http.StatusOK, "content/list", data)
}

func (h *ContentHandler) Show(c echo.Context) error {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)

	var content models.Content
	err := h.db.Pool.QueryRow(context.Background(),
		"SELECT id, slug, title, data, created_by, created_at, updated_at FROM iraven.content WHERE id = $1", id).
		Scan(&content.ID, &content.Slug, &content.Title, &content.Data, &content.CreatedBy, &content.CreatedAt, &content.UpdatedAt)

	if err != nil {
		return echo.NewHTTPError(http.StatusNotFound, "Content not found")
	}

	data := map[string]interface{}{
		"Title":   "Content Details",
		"Content": content,
	}

	return c.Render(http.StatusOK, "content/show", data)
}

func (h *ContentHandler) New(c echo.Context) error {
	data := map[string]interface{}{
		"Title": "New Content",
	}
	return c.Render(http.StatusOK, "content/new", data)
}

func (h *ContentHandler) Create(c echo.Context) error {
	slug := c.FormValue("slug")
	title := c.FormValue("title")
	data := c.FormValue("data")

	if slug == "" || title == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "Slug and title are required")
	}

	session, _ := middleware.GetSession(c)
	userID := session.Values[middleware.UserIDKey].(int64)

	var contentID int64
	err := h.db.Pool.QueryRow(context.Background(),
		"INSERT INTO iraven.content (slug, title, data, created_by) VALUES ($1, $2, $3, $4) RETURNING id",
		slug, title, data, userID).Scan(&contentID)

	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Failed to create content: "+err.Error())
	}

	return c.Redirect(http.StatusFound, fmt.Sprintf("/content/%d", contentID))
}

func (h *ContentHandler) Edit(c echo.Context) error {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)

	var content models.Content
	err := h.db.Pool.QueryRow(context.Background(),
		"SELECT id, slug, title, data FROM iraven.content WHERE id = $1", id).
		Scan(&content.ID, &content.Slug, &content.Title, &content.Data)

	if err != nil {
		return echo.NewHTTPError(http.StatusNotFound, "Content not found")
	}

	data := map[string]interface{}{
		"Title":   "Edit Content",
		"Content": content,
	}

	return c.Render(http.StatusOK, "content/edit", data)
}

func (h *ContentHandler) Update(c echo.Context) error {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	slug := c.FormValue("slug")
	title := c.FormValue("title")
	data := c.FormValue("data")

	if slug == "" || title == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "Slug and title are required")
	}

	_, err := h.db.Pool.Exec(context.Background(),
		"UPDATE iraven.content SET slug = $1, title = $2, data = $3, updated_at = NOW() WHERE id = $4",
		slug, title, data, id)

	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Failed to update content: "+err.Error())
	}

	return c.Redirect(http.StatusFound, fmt.Sprintf("/content/%d", id))
}

func (h *ContentHandler) Delete(c echo.Context) error {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)

	_, err := h.db.Pool.Exec(context.Background(), "DELETE FROM iraven.content WHERE id = $1", id)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Failed to delete content: "+err.Error())
	}

	return c.Redirect(http.StatusFound, "/content")
}
