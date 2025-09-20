# NestJS MongoDB Boilerplate

A production-ready NestJS boilerplate with MongoDB, authentication, and essential modules pre-configured. Perfect starting point for building scalable REST APIs.

## What's Included

- **🔐 Authentication System**: Complete JWT-based auth with registration, login, logout, and password management
- **📊 Database Integration**: MongoDB with Mongoose, connection management, and base repository patterns
- **👥 User Management**: User CRUD operations, profile management, and role-based access control
- **📁 AWS S3 Integration**: Complete file upload system with public and protected presigned URLs
- **📚 API Documentation**: Auto-generated Swagger/OpenAPI documentation
- **🛡️ Security**: CORS, helmet, rate limiting, and input validation
- **📋 Validation**: Comprehensive request/response validation with class-validator
- **🚀 Performance**: Request compression, response caching, and optimized queries

## Tech Stack

- **Framework**: NestJS with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with Passport strategies
- **Validation**: class-validator and class-transformer
- **Documentation**: Swagger/OpenAPI with decorators
- **Logging**: Pino logger with request tracing
- **File Storage**: AWS S3 with presigned URLs
- **Testing**: Jest with supertest for E2E
- **Code Quality**: ESLint, Prettier, and Git hooks
- **Compiler**: SWC for faster builds

## Prerequisites

- Node.js (>= 20.11.0)
- Yarn (>= 1.22.22)
- MongoDB (>= 4.4)

## Getting Started

### 1. Use This Template

Click "Use this template" on GitHub or clone the repository:

```bash
git clone <repository-url>
cd my-nestjs-app
```

### 2. Install Dependencies

```bash
yarn install
```

### 3. Environment Configuration

Create your environment file:

```bash
cp .env.example .env
```

Update the `.env` file with your configuration:

```env
# Application Configuration
NODE_ENV=development
APP_TZ=UTC
APP_HOST=localhost
APP_PORT=8000
APP_GLOBAL_PREFIX=api

# API Versioning
APP_URL_VERSION_ENABLE=true
APP_URL_VERSION_PREFIX=v
APP_URL_VERSION=1

# Database
DATABASE_URL=mongodb://localhost:27017/your-app-name
DATABASE_DEBUG=false

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=15m

# CORS Configuration
MIDDLEWARE_CORS_ORIGIN=http://localhost:3000,http://localhost:3001

# AWS S3 Configuration (Required for file uploads)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-bucket-name
```

> **Note**: The S3 module provides both public and protected file upload endpoints:
>
> - **Public uploads**: Files accessible to everyone (e.g., profile pictures, public assets)
> - **Protected uploads**: Files with access control (e.g., user documents, private content)
>
> All uploads use presigned URLs for direct client-to-S3 upload, reducing server load and improving performance.

### 4. Start MongoDB

Make sure MongoDB is running locally or update `DATABASE_URL` with your MongoDB connection string.

### 5. Run the Application

```bash
# Development with hot reload (uses .env.local)
yarn start:local

# QA environment (uses .env.qa)
yarn start:qa

# Production build and start
yarn build
yarn start:prod
```

## API Documentation

Once the server is running, you can access the comprehensive API documentation at:

- **Swagger UI**: `http://localhost:3000/api/docs`

The documentation includes all endpoints, request/response schemas, and authentication requirements.

## Available Scripts

```bash
# Development
yarn start:local        # Start with hot reload using SWC (copies .env.local)
yarn start:qa           # Start with QA environment (copies .env.qa)
yarn start              # Start in production mode

# Production
yarn build              # Build the application
yarn start:prod         # Start production server
yarn prebuild           # Clean dist folder before build

# Environment Management
yarn env:copy:local     # Copy .env.local to .env
yarn env:copy:qa        # Copy .env.qa to .env
yarn env:copy:production # Copy .env.production to .env

# Testing
yarn test               # Run unit tests with Jest
yarn migrate:fresh      # Reset and seed database
yarn migrate:seed       # Seed database with sample data
yarn migrate:remove     # Remove all users from database

# Code Quality
yarn lint               # Run ESLint
yarn lint:fix           # Fix ESLint issues automatically
yarn lint:staged        # Run linting on staged files
yarn format             # Format code with Prettier
yarn spell              # Check spelling with cspell
yarn deadcode           # Find unused code with ts-prune

# Utilities
yarn clean              # Clean dist, cache, and node_modules
yarn swagger            # Open Swagger documentation in browser
yarn package:check      # Check for outdated packages
yarn package:upgrade    # Upgrade packages to latest versions
```

## Project Structure

```
src/
├── app/                    # Application layer
│   ├── constants/          # App constants
│   ├── dtos/              # Environment validation DTOs
│   ├── enums/             # Application enums
│   ├── filters/           # Global exception filters
│   └── middlewares/       # Application middlewares
├── common/                 # Shared modules
│   ├── database/          # Database connection & base classes
│   ├── decorators/        # Custom decorators
│   ├── message/           # Message/localization service
│   ├── request/           # Request utilities
│   └── response/          # Response interceptors
├── configs/               # Configuration files
├── modules/               # Feature modules
│   ├── auth/              # Authentication & authorization
│   ├── user/              # User management
│   ├── s3/                # File upload service
│   ├── session/           # Session management
│   └── health/            # Health check endpoints
├── router/                # Route configuration
└── main.ts               # Application bootstrap
```

## Using This Template

### 1. Customize for Your Project

- Update `package.json` with your project details
- Modify the database name in your environment variables
- Add/remove modules based on your requirements
- Update API documentation with your specific endpoints

### 2. Pre-built Modules You Can Use

- **Authentication**: Registration, login, logout, password reset
- **User Management**: CRUD operations with role-based access
- **File Upload**: AWS S3 integration with public/protected presigned URLs
    - `POST /api/s3/public-upload` - Generate presigned URL for public uploads
    - `POST /api/s3/protected-upload` - Generate presigned URL for protected uploads
    - `DELETE /api/s3/files` - Delete files from S3
    - `GET /api/s3/file-url/:key` - Get file URL

### 3. Adding New Modules

Use NestJS CLI to generate new modules:

```bash
# Generate a new module
nest g module new-feature

# Generate controller and service
nest g controller new-feature
nest g service new-feature

# Generate complete CRUD resource
nest g resource new-feature
```

## Key Features Explained

### Environment Validation

- Comprehensive environment variable validation using class-validator
- Fails fast on startup if required configurations are missing
- Type-safe configuration management

### Database Architecture

- MongoDB with Mongoose ODM
- Base repository pattern for consistent data access
- Automatic connection management and error handling

### Authentication Flow

- JWT-based authentication with refresh tokens
- Secure password hashing with bcrypt
- Session management with cookie-based refresh tokens
- Role-based access control ready to use

### File Upload & Storage

- **AWS S3 Integration**: Ready-to-use S3 service with proper configuration
- **Public Uploads**: Generate presigned URLs for public file uploads (avatars, public images)
- **Protected Uploads**: Generate presigned URLs for protected file uploads (private documents, user content)
- **File Management**: Delete files, get file URLs, and handle file metadata
- **Security**: Presigned URLs with expiration times and proper access controls
- **Scalable**: Direct client-to-S3 uploads to reduce server load

### API Design

- RESTful endpoints with proper HTTP status codes
- Consistent response format across all endpoints
- Comprehensive input validation and sanitization
- API versioning support

## Contributing

We welcome contributions to improve this boilerplate:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting (`yarn test && yarn lint`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you have questions or need help getting started:

1. Check the [API Documentation](http://localhost:3000/api/docs) when running locally
2. Review the code examples in the modules
3. Open an issue for bugs or feature requests

---

**Happy coding! 🚀**
