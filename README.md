# Transactions App (Tenpistas)

A full-stack transaction management application built with Spring Boot and Next.js.

## Tech Stack

### Backend
- Java 17
- Spring Boot 4.0.3
- Spring Data JPA
- Spring Security with JWT authentication
- PostgreSQL 15
- Springdoc OpenAPI (Swagger UI)
- Lombok

### Frontend
- Next.js 16.1.6
- React 19.2.3
- TypeScript
- TanStack Query (React Query)
- React Hook Form + Zod validation
- Axios
- Tailwind CSS 4

## Prerequisites

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Running the Application

From the project root directory, run:

```bash
docker-compose up --build
```

This will start:
- **PostgreSQL database** on port `5432`
- **Backend API** on port `8080`
- **Frontend UI** on port `3000`

Once all services are running, open your browser and navigate to:
```
http://localhost:3000
```

## Access Points

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8080/api |
| Swagger UI | http://localhost:8080/swagger-ui.html |

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login with username/password |
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/register/admin` | Register a new admin user |

### Transactions (requires authentication)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/transaction` | Get all transactions (admin: all, user: own) |
| GET | `/api/transaction/{id}` | Get transaction by ID |
| POST | `/api/transaction` | Create a new transaction |
| PUT | `/api/transaction/{id}` | Update a transaction |
| DELETE | `/api/transaction/{id}` | Delete a transaction |

## Project Structure

```
transactions-app/
├── backend/                 # Spring Boot backend
│   ├── src/
│   │   └── main/
│   │       ├── java/com/tenpistas/transactions/
│   │       │   ├── config/          # Configuration classes
│   │       │   ├── controller/      # REST controllers
│   │       │   ├── dto/             # Data transfer objects
│   │       │   ├── entity/          # JPA entities
│   │       │   ├── exception/      # Exception handling
│   │       │   ├── repository/      # JPA repositories
│   │       │   ├── security/       # Security config & JWT
│   │       │   └── service/        # Business logic
│   │       └── resources/
│   │           └── application.properties
│   ├── Dockerfile
│   └── pom.xml
│
├── frontend/               # Next.js frontend
│   ├── src/
│   │   ├── app/            # Next.js App Router pages
│   │   ├── components/      # React components
│   │   ├── context/        # React context providers
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API client setup
│   │   └── types/          # TypeScript type definitions
│   ├── Dockerfile
│   ├── package.json
│   └── next.config.ts
│
└── docker-compose.yml      # Docker Compose orchestration
```

## Features

- **User Authentication**: JWT-based login/register system
- **Role-based Access**: Admin users can view all transactions; regular users see only their own
- **Transaction Management**: Create, read, update, and delete transactions
- **Validation**: Both frontend and backend validation for all inputs
- **Transaction Limits**: Maximum 100 transactions per user
- **Dark Theme UI**: Modern dark-themed dashboard

## Default Credentials

The application includes a data seeder. Check `backend/src/main/java/com/tenpistas/transactions/config/DataSeeder.java` for any seeded users.

## Stopping the Application

To stop all services:

```bash
docker-compose down
```

To also remove the database volume:

```bash
docker-compose down -v
```

## License

This project is for demonstration purposes.