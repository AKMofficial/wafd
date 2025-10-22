# Wafd Backend

Hajj pilgrim accommodation management system backend built with Spring Boot.

## Quick Start

1. **Database Setup:**

   ```bash
   # Create MySQL database
   mysql -u root -p
   CREATE DATABASE wafd;
   exit;
   ```

2. **Environment Configuration:**

   ```bash
   # Copy the example environment file
   cp .env.example .env

   # Edit .env with your values
   # Update JWT_SECRET_KEY, DB_USERNAME, DB_PASSWORD
   ```

3. **Generate JWT Secret:**

   ```bash
   # Using OpenSSL
   openssl rand -hex 32

   # Or using Node.js
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

4. **Run the application:**
   ```bash
   ./mvnw spring-boot:run
   ```

The backend will start on `http://localhost:8080`

## Environment Variables

### Environment Variables Reference

| Variable                 | Description                           | Default                          |
| ------------------------ | ------------------------------------- | -------------------------------- |
| `JWT_SECRET_KEY`         | Secret key for JWT signing (required) | -                                |
| `JWT_EXPIRATION`         | Access token expiration in ms         | 3600000 (1 hour)                 |
| `JWT_REFRESH_EXPIRATION` | Refresh token expiration in ms        | 604800000 (7 days)               |
| `DB_URL`                 | Database connection URL               | jdbc:mysql://localhost:3306/wafd |
| `DB_USERNAME`            | Database username                     | root                             |
| `DB_PASSWORD`            | Database password                     | (empty)                          |

## Data Initialization

The application automatically creates default users on first run via `DataInitializer.java`:

### Default Admin User

- **Email:** `admin@wafd.com`
- **Password:** `Admin123!`
- **Role:** Admin
- **Phone:** +966500000001

### Default Supervisor User

- **Email:** `supervisor@wafd.com`
- **Password:** `Super123!`
- **Role:** Supervisor
- **Phone:** +966500000002

**⚠️ Security Warning:** Change these default passwords immediately after first login, especially in production environments!

### How It Works

The `DataInitializer` component implements `CommandLineRunner` and runs automatically when the application starts. It:

1. Checks if default users already exist in the database
2. Creates them only if they don't exist (idempotent operation)
3. Hashes passwords using BCrypt before storing
4. Prints credentials to console on first creation

This ensures you can always log in to a fresh installation without manual database setup.

## Database Schema

The application uses JPA with Hibernate to auto-generate the database schema:

- **Mode:** `spring.jpa.hibernate.ddl-auto=update` (development)
- **Dialect:** MySQL 8
- **Auto-generation:** Enabled (`spring.jpa.generate-ddl=true`)

## Development Commands

```bash
# Build the project
./mvnw clean install

# Run tests
./mvnw test

# Run application
./mvnw spring-boot:run

# Build JAR (skip tests)
./mvnw clean package -DskipTests
```
