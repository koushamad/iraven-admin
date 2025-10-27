package handlers

import (
	"context"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/iraven/iraven-admin/pkg/database"
	"github.com/labstack/echo/v4"
)

type SupabaseHandler struct {
	db *database.Database
}

func NewSupabaseHandler(db *database.Database) *SupabaseHandler {
	return &SupabaseHandler{db: db}
}

type TableInfo struct {
	Schema      string
	TableName   string
	RowCount    int64
	Description string
}

type ColumnInfo struct {
	Name       string
	Type       string
	IsNullable string
	Default    *string
}

func (h *SupabaseHandler) ListTables(c echo.Context) error {
	ctx := context.Background()

	// Get all tables from public schema (Supabase tables)
	rows, err := h.db.Pool.Query(ctx, `
		SELECT
			schemaname,
			tablename,
			obj_description((schemaname || '.' || tablename)::regclass, 'pg_class') as description
		FROM pg_tables
		WHERE schemaname = 'public'
		ORDER BY tablename
	`)
	if err != nil {
		return err
	}
	defer rows.Close()

	var tables []TableInfo
	for rows.Next() {
		var t TableInfo
		var desc *string
		if err := rows.Scan(&t.Schema, &t.TableName, &desc); err != nil {
			continue
		}
		if desc != nil {
			t.Description = *desc
		}

		// Get row count for each table
		var count int64
		h.db.Pool.QueryRow(ctx, fmt.Sprintf("SELECT COUNT(*) FROM public.%s", t.TableName)).Scan(&count)
		t.RowCount = count

		tables = append(tables, t)
	}

	data := map[string]interface{}{
		"Title":  "Supabase Tables",
		"Tables": tables,
	}

	return c.Render(http.StatusOK, "supabase/list", data)
}

func (h *SupabaseHandler) BrowseTable(c echo.Context) error {
	tableName := c.Param("table")
	page, _ := strconv.Atoi(c.QueryParam("page"))
	if page < 1 {
		page = 1
	}
	pageSize := 50
	offset := (page - 1) * pageSize

	ctx := context.Background()

	// Get table columns
	colRows, err := h.db.Pool.Query(ctx, `
		SELECT column_name, data_type, is_nullable, column_default
		FROM information_schema.columns
		WHERE table_schema = 'public' AND table_name = $1
		ORDER BY ordinal_position
	`, tableName)
	if err != nil {
		return err
	}
	defer colRows.Close()

	var columns []ColumnInfo
	var columnNames []string
	for colRows.Next() {
		var col ColumnInfo
		if err := colRows.Scan(&col.Name, &col.Type, &col.IsNullable, &col.Default); err != nil {
			continue
		}
		columns = append(columns, col)
		columnNames = append(columnNames, col.Name)
	}

	if len(columns) == 0 {
		return echo.NewHTTPError(http.StatusNotFound, "Table not found")
	}

	// Get table data
	query := fmt.Sprintf("SELECT %s FROM public.%s ORDER BY 1 DESC LIMIT $1 OFFSET $2",
		strings.Join(columnNames, ", "), tableName)

	dataRows, err := h.db.Pool.Query(ctx, query, pageSize, offset)
	if err != nil {
		return err
	}
	defer dataRows.Close()

	var rows []map[string]interface{}
	for dataRows.Next() {
		values := make([]interface{}, len(columns))
		valuePtrs := make([]interface{}, len(columns))
		for i := range values {
			valuePtrs[i] = &values[i]
		}

		if err := dataRows.Scan(valuePtrs...); err != nil {
			continue
		}

		row := make(map[string]interface{})
		for i, col := range columns {
			row[col.Name] = values[i]
		}
		rows = append(rows, row)
	}

	// Get total count
	var totalRows int64
	h.db.Pool.QueryRow(ctx, fmt.Sprintf("SELECT COUNT(*) FROM public.%s", tableName)).Scan(&totalRows)

	data := map[string]interface{}{
		"Title":      fmt.Sprintf("Browse Table: %s", tableName),
		"TableName":  tableName,
		"Columns":    columns,
		"Rows":       rows,
		"Page":       page,
		"TotalPages": (totalRows + int64(pageSize) - 1) / int64(pageSize),
		"TotalRows":  totalRows,
	}

	return c.Render(http.StatusOK, "supabase/browse", data)
}

func (h *SupabaseHandler) ViewRow(c echo.Context) error {
	tableName := c.Param("table")
	id := c.Param("id")

	ctx := context.Background()

	// Get table columns
	colRows, err := h.db.Pool.Query(ctx, `
		SELECT column_name, data_type, is_nullable, column_default
		FROM information_schema.columns
		WHERE table_schema = 'public' AND table_name = $1
		ORDER BY ordinal_position
	`, tableName)
	if err != nil {
		return err
	}
	defer colRows.Close()

	var columns []ColumnInfo
	var columnNames []string
	for colRows.Next() {
		var col ColumnInfo
		if err := colRows.Scan(&col.Name, &col.Type, &col.IsNullable, &col.Default); err != nil {
			continue
		}
		columns = append(columns, col)
		columnNames = append(columnNames, col.Name)
	}

	// Get row data (assuming 'id' column exists)
	query := fmt.Sprintf("SELECT %s FROM public.%s WHERE id = $1",
		strings.Join(columnNames, ", "), tableName)

	row := h.db.Pool.QueryRow(ctx, query, id)

	values := make([]interface{}, len(columns))
	valuePtrs := make([]interface{}, len(columns))
	for i := range values {
		valuePtrs[i] = &values[i]
	}

	if err := row.Scan(valuePtrs...); err != nil {
		return echo.NewHTTPError(http.StatusNotFound, "Row not found")
	}

	rowData := make(map[string]interface{})
	for i, col := range columns {
		rowData[col.Name] = values[i]
	}

	data := map[string]interface{}{
		"Title":     fmt.Sprintf("View Row: %s #%s", tableName, id),
		"TableName": tableName,
		"Columns":   columns,
		"Row":       rowData,
	}

	return c.Render(http.StatusOK, "supabase/view", data)
}
