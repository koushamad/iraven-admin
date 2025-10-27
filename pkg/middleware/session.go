package middleware

import (
	"net/http"

	"github.com/gorilla/sessions"
	"github.com/labstack/echo/v4"
)

var store *sessions.CookieStore

func InitSessionStore(secret string) {
	store = sessions.NewCookieStore([]byte(secret))
	store.Options = &sessions.Options{
		Path:     "/",
		MaxAge:   86400, // 24 hours
		HttpOnly: true,
		Secure:   false, // Set to true in production with HTTPS
		SameSite: http.SameSiteLaxMode,
	}
}

func SessionMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		session, _ := store.Get(c.Request(), "admin-session")
		c.Set("session", session)
		return next(c)
	}
}

func GetSession(c echo.Context) (*sessions.Session, error) {
	return store.Get(c.Request(), "admin-session")
}

func SaveSession(c echo.Context, session *sessions.Session) error {
	return session.Save(c.Request(), c.Response())
}
