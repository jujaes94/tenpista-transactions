# Tenpistas — Transaction Management App

A full-stack transaction management application with role-based access control, built with Spring Boot and Next.js.

## Tech Stack

**Backend**
- Java 17 + Spring Boot 4.0.3
- Spring Security with JWT authentication
- Spring Data JPA + PostgreSQL 15
- Springdoc OpenAPI (Swagger UI)
- Lombok

**Frontend**
- Next.js 16.1.6 + React 19
- TypeScript
- TanStack Query (React Query)
- React Hook Form + Zod validation
- Axios + Tailwind CSS 4

## Prerequisites

- [Docker Desktop](https://www.docker.com/get-started) (includes Docker Compose)

## Quick Start

```bash
docker-compose up --build
```

This starts three services:

| Service | URL |
|---------|-----|
| Frontend UI | http://localhost:3000 |
| Backend API | http://localhost:8080/api |
| Swagger UI | http://localhost:8080/swagger-ui.html |
| PostgreSQL | localhost:5432 |

Open http://localhost:3000 in your browser and register an account to get started.

## Environment Variables

All variables have defaults and work out of the box. Override them with a `.env` file in the project root if needed.

| Variable | Default | Description |
|----------|---------|-------------|
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://db:5432/transactions_db` | Database connection URL |
| `SPRING_DATASOURCE_USERNAME` | `postgres` | Database username |
| `SPRING_DATASOURCE_PASSWORD` | `postgres` | Database password |
| `JWT_SECRET` | *(built-in key)* | Secret for signing JWT tokens |
| `JWT_EXPIRATION` | `86400000` | Token expiry in ms (24 hours) |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000` | Allowed CORS origins |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8080/api` | Backend API URL used by the frontend |

## API Reference

### Authentication — `/api/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | None | Register a new regular user |
| POST | `/api/auth/register/admin` | None | Register a new admin user |
| POST | `/api/auth/login` | None | Login and receive a JWT token |

### Transactions — `/api/transaction`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/transaction` | Required | List transactions (admin: all users; user: own only) |
| GET | `/api/transaction/{id}` | Required | Get a single transaction by ID |
| POST | `/api/transaction` | Required | Create a new transaction |
| PUT | `/api/transaction/{id}` | Required | Update an existing transaction |
| DELETE | `/api/transaction/{id}` | Required | Delete a transaction |

### Transaction Statuses — `/api/status`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/status` | Required | List all available transaction statuses |

### Users — `/api/users`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/users` | Admin only | List all users |

Seeded statuses on startup: `PENDING`, `COMPLETED`, `CANCELLED`, `FAILED`.

## Features

- **JWT Authentication** — stateless login/register with token-based sessions
- **Role-based Access** — admin users see all transactions; regular users see only their own
- **Transaction CRUD** — create, read, update, and delete transactions with status tracking
- **Input Validation** — validated on both frontend (Zod) and backend (Spring)
- **Transaction Limit** — maximum 100 transactions per user
- **Dark UI** — modern dark-themed dashboard

## Project Structure

```
transactions-app/
├── backend/
│   ├── src/main/java/com/tenpistas/transactions/
│   │   ├── config/          # Security config, CORS, data seeder
│   │   ├── controller/      # REST controllers (Auth, Transaction, Status, User)
│   │   ├── dto/             # Request/response DTOs
│   │   ├── entity/          # JPA entities (User, Transaction, TransactionStatus, Role)
│   │   ├── exception/       # Global exception handling
│   │   ├── repository/      # Spring Data JPA repositories
│   │   ├── security/        # JWT filter, token utilities
│   │   └── service/         # Business logic
│   ├── Dockerfile
│   └── pom.xml
│
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js App Router pages (/, /login, /admin)
│   │   ├── features/
│   │   │   ├── auth/        # Auth context and login page
│   │   │   ├── transactions/ # Transaction form, list, and hooks
│   │   │   └── admin/       # Admin hooks and page
│   │   └── shared/
│   │       └── services/    # Axios API client
│   ├── Dockerfile
│   ├── next.config.ts
│   └── package.json
│
└── docker-compose.yml
```

## Stopping the App

```bash
# Stop containers
docker-compose down

# Stop and remove the database volume (resets all data)
docker-compose down -v
```

## License

This project is for demonstration purposes.
