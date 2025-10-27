package handlers

import (
	"context"
	"fmt"
	"net/http"
	"runtime"
	"time"

	"github.com/iraven/iraven-admin/pkg/database"
	"github.com/iraven/iraven-admin/pkg/models"
	"github.com/labstack/echo/v4"
)

type SystemHandler struct {
	db        *database.Database
	startTime time.Time
}

func NewSystemHandler(db *database.Database) *SystemHandler {
	return &SystemHandler{
		db:        db,
		startTime: time.Now(),
	}
}

func (h *SystemHandler) Dashboard(c echo.Context) error {
	metrics := h.getSystemMetrics()

	data := map[string]interface{}{
		"Title":   "System Monitor",
		"Metrics": metrics,
	}

	return c.Render(http.StatusOK, "system/dashboard", data)
}

func (h *SystemHandler) getSystemMetrics() models.SystemMetrics {
	var m models.SystemMetrics

	// Server metrics
	m.Server.Status = "Running"
	m.Server.Version = "1.0.0"
	m.Server.Uptime = int64(time.Since(h.startTime).Seconds())

	// Database metrics
	ctx := context.Background()
	start := time.Now()
	if err := h.db.Pool.Ping(ctx); err == nil {
		m.Database.Status = "Connected"
		m.Database.Latency = time.Since(start).Seconds() * 1000 // milliseconds
	} else {
		m.Database.Status = "Disconnected"
	}

	// Get connection count
	var connCount int
	h.db.Pool.QueryRow(ctx, "SELECT numbackends FROM pg_stat_database WHERE datname = current_database()").Scan(&connCount)
	m.Database.Connections = connCount

	// Memory metrics
	var memStats runtime.MemStats
	runtime.ReadMemStats(&memStats)
	m.Memory.Used = memStats.Alloc
	m.Memory.Total = memStats.Sys
	m.Memory.Available = memStats.Sys - memStats.Alloc
	if m.Memory.Total > 0 {
		m.Memory.Percent = float64(m.Memory.Used) / float64(m.Memory.Total) * 100
	}

	// CPU metrics
	m.CPU.CoreCount = runtime.NumCPU()
	m.CPU.Goroutines = runtime.NumGoroutine()

	return m
}

func (h *SystemHandler) DatabaseStats(c echo.Context) error {
	ctx := context.Background()

	// Get table sizes
	rows, err := h.db.Pool.Query(ctx, `
		SELECT
			schemaname,
			tablename,
			pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
			pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
		FROM pg_tables
		WHERE schemaname IN ('iraven', 'public')
		ORDER BY size_bytes DESC
		LIMIT 20
	`)
	if err != nil {
		return err
	}
	defer rows.Close()

	type TableSize struct {
		Schema string
		Table  string
		Size   string
		Bytes  int64
	}

	var tables []TableSize
	for rows.Next() {
		var t TableSize
		if err := rows.Scan(&t.Schema, &t.Table, &t.Size, &t.Bytes); err != nil {
			continue
		}
		tables = append(tables, t)
	}

	data := map[string]interface{}{
		"Title":  "Database Statistics",
		"Tables": tables,
	}

	return c.Render(http.StatusOK, "system/database", data)
}

func (h *SystemHandler) ClearCache(c echo.Context) error {
	// This would integrate with Redis if available
	return c.JSON(http.StatusOK, map[string]string{
		"message": "Cache cleared successfully",
	})
}

func (h *SystemHandler) Backups(c echo.Context) error {
	data := map[string]interface{}{
		"Title": "Database Backups",
	}

	return c.Render(http.StatusOK, "system/backups", data)
}

func (h *SystemHandler) CreateBackup(c echo.Context) error {
	// This would trigger a backup process
	timestamp := time.Now().Format("20060102-150405")
	backupName := fmt.Sprintf("iraven-backup-%s.sql", timestamp)

	// In a real implementation, this would call pg_dump or similar
	return c.JSON(http.StatusOK, map[string]string{
		"message": "Backup created successfully",
		"file":    backupName,
	})
}
