# IRaven Admin Dashboard

A comprehensive administrative dashboard for the IRaven API built with Go, Echo framework, and Bootstrap 5.

## Features

### Core Features
- **User Management**: Full CRUD operations for users with role assignments
- **Role Management**: Create and manage roles with user assignments
- **Application Management**: Multi-tenant application management
- **OAuth Client Management**: Manage OAuth clients per application
- **Content Management**: CMS for dynamic content with JSON data storage
- **File Management**: Browse and manage uploaded files
- **Localization**: Language and country management
- **Notifications**: View notification history and device registrations
- **Payment Management**: View payment transactions and history

### System Features
- **System Monitoring**: Real-time server, database, memory, and CPU metrics
- **Database Statistics**: View table sizes and database performance
- **Backup & Restore**: Database backup and restore functionality
- **Cache Management**: Clear application cache
- **Supabase Table Browser**: Browse and view all Supabase (public schema) tables

### Security Features
- **Session-based Authentication**: Secure login with session management
- **Role-based Access Control**: Admin-only access
- **Password Hashing**: BCrypt password hashing
- **CSRF Protection**: Built-in CSRF protection

## Technology Stack

- **Backend**: Go 1.23+
- **Web Framework**: Echo v4
- **Database**: PostgreSQL 14+ (via pgx/v5)
- **Sessions**: Gorilla Sessions
- **Frontend**: Bootstrap 5 + Bootstrap Icons
- **Templates**: Go HTML Templates

## Prerequisites

- Go 1.23 or higher
- PostgreSQL 14+ (with iraven database)
- Running iraven-api instance

## Installation

1. **Clone and navigate to the admin directory**:
   ```bash
   cd iraven-admin
   ```

2. **Install dependencies**:
   ```bash
   go mod download
   ```

3. **Configure the application**:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and `config.yaml` with your database credentials and settings.

4. **Required configuration**:
   - Database host, port, user, password, and database name
   - JWT secret (same as iraven-api for compatibility)
   - Server host and port (default: 0.0.0.0:8081)

## Configuration

### config.yaml
```yaml
server:
  host: "0.0.0.0"
  port: 8081
  debug: true

database:
  host: "localhost"
  port: 5432
  user: "postgres"
  password: "postgres"
  dbname: "iraven"
  sslmode: "disable"
  max_connections: 25
  max_idle_connections: 5

api:
  base_url: "http://localhost:8080"
  timeout: 30

auth:
  jwt_secret: "your-jwt-secret-here"
  session_duration: 86400  # 24 hours

admin:
  default_page_size: 20
  max_page_size: 100
```

### Environment Variables (Optional)
Override config.yaml values with environment variables:

- `DB_HOST` - Database host
- `DB_PORT` - Database port
- `DB_USER` - Database user
- `DB_PASSWORD` - Database password
- `DB_NAME` - Database name
- `DB_SSLMODE` - SSL mode
- `API_BASE_URL` - IRaven API base URL
- `JWT_SECRET` - JWT secret key
- `SERVER_HOST` - Server bind address
- `SERVER_PORT` - Server port
- `DEBUG` - Debug mode (true/false)

## Running the Application

### Development Mode
```bash
go run cmd/admin/main.go
```

### Production Build
```bash
# Build binary
go build -o bin/iraven-admin cmd/admin/main.go

# Run binary
./bin/iraven-admin
```

### Using Makefile (optional)
```bash
make run      # Run in development mode
make build    # Build production binary
make clean    # Clean build artifacts
```

## Default Login

After running the iraven-api bootstrap command, use these credentials:

- **Email**: `admin@iraven.io`
- **Password**: `KOKOLI**`

**IMPORTANT**: Change this password immediately after first login!

## Project Structure

```
iraven-admin/
├── cmd/
│   └── admin/
│       └── main.go                 # Application entry point
├── pkg/
│   ├── config/
│   │   └── config.go               # Configuration management
│   ├── database/
│   │   └── database.go             # Database connection pool
│   ├── handlers/
│   │   ├── auth.go                 # Authentication handlers
│   │   ├── dashboard.go            # Dashboard handler
│   │   ├── user.go                 # User CRUD handlers
│   │   ├── role.go                 # Role CRUD handlers
│   │   ├── application.go          # Application handlers
│   │   ├── content.go              # Content handlers
│   │   ├── system.go               # System monitoring handlers
│   │   ├── supabase.go             # Supabase table browser
│   │   └── renderer.go             # Template renderer
│   ├── middleware/
│   │   ├── auth.go                 # Authentication middleware
│   │   └── session.go              # Session middleware
│   └── models/
│       ├── user.go                 # User models
│       ├── application.go          # Application models
│       ├── content.go              # Content models
│       ├── file.go                 # File models
│       ├── localization.go         # Language/Country models
│       ├── notification.go         # Notification models
│       ├── payment.go              # Payment models
│       └── system.go               # System models
├── templates/
│   ├── layouts/
│   │   └── base.html               # Base layout template
│   ├── dashboard/
│   │   └── dashboard.html          # Dashboard page
│   ├── users/                      # User management templates
│   ├── roles/                      # Role management templates
│   ├── applications/               # Application templates
│   ├── content/                    # Content management templates
│   ├── system/                     # System monitoring templates
│   └── supabase/                   # Supabase browser templates
├── static/
│   ├── css/                        # Custom stylesheets
│   ├── js/                         # Custom JavaScript
│   └── img/                        # Images
├── config.yaml                     # Main configuration file
├── .env.example                    # Example environment file
└── README.md                       # This file
```

## Available Routes

### Authentication
- `GET /login` - Login page
- `POST /login` - Login form submission
- `GET /logout` - Logout

### Dashboard
- `GET /` - Main dashboard
- `GET /dashboard` - Dashboard (alias)

### User Management
- `GET /users` - List all users
- `GET /users/new` - New user form
- `POST /users` - Create user
- `GET /users/:id` - View user details
- `GET /users/:id/edit` - Edit user form
- `POST /users/:id` - Update user
- `POST /users/:id/delete` - Delete user

### Role Management
- `GET /roles` - List all roles
- `GET /roles/new` - New role form
- `POST /roles` - Create role
- `GET /roles/:id` - View role details
- `GET /roles/:id/edit` - Edit role form
- `POST /roles/:id` - Update role
- `POST /roles/:id/delete` - Delete role

### Application Management
- `GET /applications` - List applications
- `GET /applications/new` - New application form
- `POST /applications` - Create application
- `GET /applications/:id` - View application details
- `GET /applications/:id/edit` - Edit application form
- `POST /applications/:id` - Update application
- `POST /applications/:id/delete` - Delete application

### Content Management
- `GET /content` - List content
- `GET /content/new` - New content form
- `POST /content` - Create content
- `GET /content/:id` - View content details
- `GET /content/:id/edit` - Edit content form
- `POST /content/:id` - Update content
- `POST /content/:id/delete` - Delete content

### System Monitoring
- `GET /system` - System dashboard
- `GET /system/database` - Database statistics
- `GET /system/backups` - List backups
- `POST /system/backups/create` - Create backup
- `POST /system/cache/clear` - Clear cache

### Supabase Browser
- `GET /supabase` - List all Supabase tables
- `GET /supabase/:table` - Browse table data
- `GET /supabase/:table/:id` - View specific row

## Features in Detail

### User Management
- Create, read, update, and delete users
- Assign multiple roles to users
- Email verification status management
- View last login timestamps
- Password creation and updates

### Role Management
- Create custom roles
- View users assigned to each role
- Role-based access control
- Built-in roles: admin, user, chance

### Application Management
- Multi-tenant application support
- Domain-based application routing
- OAuth client management per application
- Application-role assignments

### Content Management
- Flexible JSON-based content storage
- Slug-based URL routing
- Content versioning via timestamps
- Creator attribution

### Supabase Table Browser
- Automatic discovery of public schema tables
- Paginated table browsing (50 rows per page)
- View individual row details
- Column type information
- Row count statistics

### System Monitoring
- Real-time server status and uptime
- Database connection status and latency
- Memory usage (used, total, available, percentage)
- CPU information (core count, goroutines)
- Database table sizes and statistics
- Backup management
- Cache clearing

## Development

### Adding New Features

1. **Create Model** (pkg/models/):
   ```go
   type YourModel struct {
       ID        int64     `json:"id" db:"id"`
       Name      string    `json:"name" db:"name"`
       CreatedAt time.Time `json:"created_at" db:"created_at"`
   }
   ```

2. **Create Handler** (pkg/handlers/):
   ```go
   type YourHandler struct {
       db *database.Database
   }

   func NewYourHandler(db *database.Database) *YourHandler {
       return &YourHandler{db: db}
   }

   func (h *YourHandler) List(c echo.Context) error {
       // Implementation
   }
   ```

3. **Create Templates** (templates/your-feature/):
   - list.html
   - show.html
   - new.html
   - edit.html

4. **Register Routes** (cmd/admin/main.go):
   ```go
   yourHandler := handlers.NewYourHandler(db)
   protected.GET("/your-feature", yourHandler.List)
   ```

### Custom Styling

Add custom CSS to `static/css/custom.css` and link it in the base template.

### Custom JavaScript

Add custom JS to `static/js/custom.js` and link it in the base template.

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check database credentials in config.yaml or .env
- Ensure the iraven database exists
- Verify the iraven schema exists with proper tables

### Authentication Issues
- Ensure you have an admin user in the database
- Verify the user has the "admin" role assigned
- Check JWT secret matches between API and admin dashboard

### Template Errors
- Ensure all template files are in the templates directory
- Check template syntax in .html files
- Verify template names match handler calls

### Port Already in Use
- Change the port in config.yaml or SERVER_PORT env variable
- Kill existing process: `lsof -ti:8081 | xargs kill -9`

## Security Considerations

1. **Change Default Password**: Change the default admin password immediately
2. **Use Strong JWT Secret**: Use a long, random JWT secret in production
3. **Enable HTTPS**: Use HTTPS in production with proper SSL certificates
4. **Secure Sessions**: Set secure cookie options in production
5. **Database Access**: Limit database user permissions to required operations
6. **Environment Variables**: Never commit .env files with real credentials

## Contributing

When adding new features:
1. Follow the existing code structure
2. Add proper error handling
3. Include appropriate templates
4. Update this README
5. Test thoroughly before deploying

## License

Copyright (c) 2024 IRaven. All rights reserved.

## Support

For issues or questions:
- Check the iraven-api documentation
- Review existing code examples
- Contact the development team

---

**Built with ❤️ for IRaven**
