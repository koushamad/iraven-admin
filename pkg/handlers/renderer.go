package handlers

import (
	"html/template"
	"io"
	"path/filepath"
	"time"

	"github.com/labstack/echo/v4"
)

type TemplateRenderer struct {
	templates *template.Template
}

func NewTemplateRenderer(templatesDir string) (*TemplateRenderer, error) {
	funcMap := template.FuncMap{
		"formatDate": func(t time.Time) string {
			return t.Format("2006-01-02 15:04:05")
		},
		"formatDateShort": func(t time.Time) string {
			return t.Format("2006-01-02")
		},
		"add": func(a, b int) int {
			return a + b
		},
		"sub": func(a, b int) int {
			return a - b
		},
	}

	tmpl := template.New("").Funcs(funcMap)

	// Parse all templates
	pattern := filepath.Join(templatesDir, "**/*.html")
	tmpl, err := tmpl.ParseGlob(pattern)
	if err != nil {
		// Try parsing with a different pattern
		pattern = filepath.Join(templatesDir, "*.html")
		tmpl, err = tmpl.ParseGlob(pattern)
		if err != nil {
			return nil, err
		}

		// Parse subdirectories
		dirs := []string{"layouts", "users", "roles", "applications", "clients", "content",
			"files", "languages", "countries", "notifications", "payments", "system", "supabase", "dashboard"}

		for _, dir := range dirs {
			pattern := filepath.Join(templatesDir, dir, "*.html")
			tmpl, _ = tmpl.ParseGlob(pattern)
		}
	}

	return &TemplateRenderer{
		templates: tmpl,
	}, nil
}

func (t *TemplateRenderer) Render(w io.Writer, name string, data interface{}, c echo.Context) error {
	return t.templates.ExecuteTemplate(w, name, data)
}
