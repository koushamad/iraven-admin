package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/iraven/iraven-admin/pkg/config"
	"github.com/iraven/iraven-admin/pkg/database"
	"github.com/iraven/iraven-admin/pkg/handlers"
	"github.com/iraven/iraven-admin/pkg/middleware"
	"github.com/labstack/echo/v4"
	echoMiddleware "github.com/labstack/echo/v4/middleware"
)

func main() {
	// Load configuration
	cfg, err := config.Load("config.yaml")
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// Initialize database
	db, err := database.New(&cfg.Database)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	log.Println("Database connection established")

	// Initialize Echo
	e := echo.New()
	e.Debug = cfg.Server.Debug

	// Initialize session store
	middleware.InitSessionStore(cfg.Auth.JWTSecret)

	// Middleware
	e.Use(echoMiddleware.Logger())
	e.Use(echoMiddleware.Recover())
	e.Use(middleware.SessionMiddleware)

	// Template renderer
	renderer, err := handlers.NewTemplateRenderer("templates")
	if err != nil {
		log.Fatalf("Failed to load templates: %v", err)
	}
	e.Renderer = renderer

	// Static files
	e.Static("/static", "static")

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(db)
	dashboardHandler := handlers.NewDashboardHandler(db)
	userHandler := handlers.NewUserHandler(db)
	roleHandler := handlers.NewRoleHandler(db)
	applicationHandler := handlers.NewApplicationHandler(db)
	contentHandler := handlers.NewContentHandler(db)
	systemHandler := handlers.NewSystemHandler(db)
	supabaseHandler := handlers.NewSupabaseHandler(db)

	// Public routes
	e.GET("/login", authHandler.ShowLogin)
	e.POST("/login", authHandler.Login)
	e.GET("/logout", authHandler.Logout)

	// Protected routes
	protected := e.Group("")
	protected.Use(middleware.RequireAuth)

	// Dashboard
	protected.GET("/", dashboardHandler.Index)
	protected.GET("/dashboard", dashboardHandler.Index)

	// Users
	protected.GET("/users", userHandler.List)
	protected.GET("/users/new", userHandler.New)
	protected.POST("/users", userHandler.Create)
	protected.GET("/users/:id", userHandler.Show)
	protected.GET("/users/:id/edit", userHandler.Edit)
	protected.POST("/users/:id", userHandler.Update)
	protected.POST("/users/:id/delete", userHandler.Delete)

	// Roles
	protected.GET("/roles", roleHandler.List)
	protected.GET("/roles/new", roleHandler.New)
	protected.POST("/roles", roleHandler.Create)
	protected.GET("/roles/:id", roleHandler.Show)
	protected.GET("/roles/:id/edit", roleHandler.Edit)
	protected.POST("/roles/:id", roleHandler.Update)
	protected.POST("/roles/:id/delete", roleHandler.Delete)

	// Applications
	protected.GET("/applications", applicationHandler.List)
	protected.GET("/applications/new", applicationHandler.New)
	protected.POST("/applications", applicationHandler.Create)
	protected.GET("/applications/:id", applicationHandler.Show)
	protected.GET("/applications/:id/edit", applicationHandler.Edit)
	protected.POST("/applications/:id", applicationHandler.Update)
	protected.POST("/applications/:id/delete", applicationHandler.Delete)

	// Content
	protected.GET("/content", contentHandler.List)
	protected.GET("/content/new", contentHandler.New)
	protected.POST("/content", contentHandler.Create)
	protected.GET("/content/:id", contentHandler.Show)
	protected.GET("/content/:id/edit", contentHandler.Edit)
	protected.POST("/content/:id", contentHandler.Update)
	protected.POST("/content/:id/delete", contentHandler.Delete)

	// System
	protected.GET("/system", systemHandler.Dashboard)
	protected.GET("/system/database", systemHandler.DatabaseStats)
	protected.GET("/system/backups", systemHandler.Backups)
	protected.POST("/system/backups/create", systemHandler.CreateBackup)
	protected.POST("/system/cache/clear", systemHandler.ClearCache)

	// Supabase Tables
	protected.GET("/supabase", supabaseHandler.ListTables)
	protected.GET("/supabase/:table", supabaseHandler.BrowseTable)
	protected.GET("/supabase/:table/:id", supabaseHandler.ViewRow)

	// Start server
	addr := fmt.Sprintf("%s:%d", cfg.Server.Host, cfg.Server.Port)
	log.Printf("Starting admin dashboard on %s", addr)
	if err := e.Start(addr); err != nil && err != http.ErrServerClosed {
		log.Fatalf("Failed to start server: %v", err)
	}
}
