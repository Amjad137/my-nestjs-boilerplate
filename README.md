# Blogora API

A modern blog platform API built with NestJS, featuring user management, content management, and interactive features.

## Features

- **User Authentication**: JWT-based authentication with registration, login, and logout
- **Blog Management**: Create, edit, delete, and publish blog posts
- **User Interactions**: Like/unlike posts, comment system with replies
- **User Profiles**: Author profiles with bio and post history
- **Search & Filter**: Search posts by title/content, filter by author or tags
- **File Upload**: Image upload with validation and storage management
- **API Documentation**: Comprehensive Swagger/OpenAPI documentation

## Tech Stack

- **Framework**: NestJS with TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with Passport
- **Validation**: class-validator and class-transformer
- **Documentation**: Swagger/OpenAPI
- **Logging**: Pino logger
- **Testing**: Jest with supertest
- **Code Quality**: ESLint, Prettier, Husky

## Prerequisites

- Node.js (>= 20.11.0)
- Yarn (>= 1.22.22)
- MongoDB (>= 4.4)

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd blogora-api
```

2. Install dependencies:

```bash
yarn install
```

3. Create environment file:

```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration (reflecting actual variables used by configs):

```env
# Application
NODE_ENV=development
APP_TZ=UTC
APP_HOST=localhost
APP_PORT=8000
APP_GLOBAL_PREFIX=api
APP_URL_VERSION_ENABLE=true
APP_URL_VERSION_PREFIX=v
APP_URL_VERSION=1

# Database
DATABASE_URL=mongodb://localhost:27017/blogora
# Optional: log mongoose debug output
DATABASE_DEBUG=false

# JWT (access token)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=15m

# Middleware / CORS
# Comma-separated list of allowed origins
MIDDLEWARE_CORS_ORIGIN=http://localhost:3000

# AWS (S3 uploads & presigned URLs)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=ap-south-1
S3_BUCKET_NAME=your-bucket
```

5. Start the development server:

```bash
yarn start:local
```

## API Documentation

Once the server is running, you can access the API documentation at:

- Swagger UI: `http://localhost:8000/api/docs`

## Available Scripts

- `yarn start:dev` - Start development server with hot reload
- `yarn build` - Build the application
- `yarn start:prod` - Start production server
- `yarn test` - Run unit tests
- `yarn test:e2e` - Run end-to-end tests
- `yarn lint` - Run ESLint
- `yarn format` - Format code with Prettier

## Project Structure

```
src/
├── app/                    # Application configuration
├── common/                 # Shared modules and utilities
├── configs/               # Configuration files
├── modules/               # Feature modules
├── router/                # Route definitions
└── main.ts               # Application entry point
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT License
