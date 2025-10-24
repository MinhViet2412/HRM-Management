# 🚀 HRM System Quick Start Guide

Get your HRM system up and running in minutes!

## 📋 Prerequisites

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Docker & Docker Compose** (optional, for containerized setup)

## 🐳 Option 1: Docker Setup (Recommended)

### Quick Start with Docker

```bash
# Clone the repository
git clone <your-repo-url>
cd hrm

# Make setup script executable (Linux/Mac)
chmod +x setup-docker.sh
./setup-docker.sh

# Or on Windows
setup-docker.bat
```

### Manual Docker Setup

```bash
# Start all services
docker-compose up -d

# Seed the database
docker-compose exec backend npm run seed

# Access the application
# Frontend: http://localhost:5173
# Backend: http://localhost:3000
# API Docs: http://localhost:3000/api/docs
```

## 💻 Option 2: Manual Setup

### Quick Start with Scripts

```bash
# Linux/Mac
chmod +x setup.sh
./setup.sh

# Windows
setup.bat
```

### Manual Setup Steps

1. **Install Dependencies**
   ```bash
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. **Setup Environment**
   ```bash
   cp backend/env.example backend/.env
   cp frontend/env.example frontend/.env
   ```

3. **Setup Database**
   ```bash
   # Option A: Use Docker for database only
   docker run --name hrm-postgres \
     -e POSTGRES_DB=hrm_db \
     -e POSTGRES_USER=postgres \
     -e POSTGRES_PASSWORD=password \
     -p 5432:5432 -d postgres:15-alpine
   
   # Option B: Install PostgreSQL locally
   # Create database: createdb hrm_db
   ```

4. **Build Applications**
   ```bash
   cd backend && npm run build
   cd ../frontend && npm run build
   ```

5. **Seed Database**
   ```bash
   cd backend && npm run seed
   ```

6. **Start Development Servers**
   ```bash
   # Terminal 1 - Backend
   cd backend && npm run start:dev
   
   # Terminal 2 - Frontend
   cd frontend && npm run dev
   ```

## 🔐 Default Login

- **Email**: `admin@company.com`
- **Password**: `admin123`

## 📱 Access URLs

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:5173 | Main application |
| Backend API | http://localhost:3000 | REST API |
| API Documentation | http://localhost:3000/api/docs | Swagger docs |
| Database | localhost:5432 | PostgreSQL |
| PgAdmin | http://localhost:5050 | Database admin |

## 🛠️ Development Commands

### Using Makefile (Linux/Mac)

```bash
make help          # Show all available commands
make install       # Install all dependencies
make dev           # Start development servers
make build         # Build all applications
make test          # Run all tests
make docker-up     # Start Docker services
make seed          # Seed database
```

### Using npm Scripts

```bash
# Root level
npm run dev        # Start both frontend and backend
npm run build      # Build both applications
npm run test       # Run all tests

# Backend
cd backend
npm run start:dev  # Start development server
npm run build      # Build application
npm run test       # Run tests
npm run seed       # Seed database

# Frontend
cd frontend
npm run dev        # Start development server
npm run build      # Build application
npm run test       # Run tests
```

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild and start
docker-compose up -d --build

# Access specific service
docker-compose exec backend bash
docker-compose exec frontend sh
docker-compose exec postgres psql -U postgres -d hrm_db
```

## 🔧 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using the port
   lsof -i :3000  # Mac/Linux
   netstat -ano | findstr :3000  # Windows
   
   # Kill the process or change ports in .env
   ```

2. **Database Connection Issues**
   ```bash
   # Check if PostgreSQL is running
   docker ps  # If using Docker
   pg_isready -h localhost -p 5432  # If using local PostgreSQL
   ```

3. **Permission Issues (Linux/Mac)**
   ```bash
   # Make scripts executable
   chmod +x setup.sh setup-docker.sh
   ```

4. **Node Modules Issues**
   ```bash
   # Clean and reinstall
   rm -rf node_modules backend/node_modules frontend/node_modules
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   ```

### Reset Everything

```bash
# Stop all services
docker-compose down -v

# Clean build artifacts
make clean

# Start fresh
make setup
```

## 📚 Next Steps

1. **Explore the API**: Visit http://localhost:3000/api/docs
2. **Check the Database**: Use PgAdmin at http://localhost:5050
3. **Read the Documentation**: Check the main README.md
4. **Customize**: Modify the code to fit your needs

## 🆘 Need Help?

- Check the main [README.md](./README.md) for detailed documentation
- Review the API documentation at `/api/docs`
- Look at the code comments and inline documentation
- Create an issue in the repository

## 🎉 You're Ready!

Your HRM system is now running! Start by logging in with the default credentials and exploring the features.
