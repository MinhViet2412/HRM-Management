@echo off
REM HRM System Docker Setup Script for Windows
REM This script sets up the HRM system using Docker on Windows

echo 🐳 HRM System Docker Setup
echo ==========================

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not installed. Please install Docker Desktop from https://docs.docker.com/desktop/windows/install/
    pause
    exit /b 1
)

echo [SUCCESS] Docker is installed
docker --version

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker Compose is not installed. Please install Docker Compose.
    pause
    exit /b 1
)

echo [SUCCESS] Docker Compose is installed
docker-compose --version

REM Check if Docker daemon is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker daemon is not running. Please start Docker Desktop.
    pause
    exit /b 1
)

echo [SUCCESS] Docker daemon is running

echo.
echo [INFO] Creating necessary directories...
if not exist backend\uploads mkdir backend\uploads
if not exist postgres_data mkdir postgres_data

echo.
echo [INFO] Building and starting services...
docker-compose up -d --build
if %errorlevel% neq 0 (
    echo [ERROR] Failed to start services
    pause
    exit /b 1
)

echo.
echo [INFO] Waiting for services to be ready...
echo [INFO] Waiting for PostgreSQL...
timeout /t 30 /nobreak >nul

echo [INFO] Waiting for backend...
timeout /t 30 /nobreak >nul

echo [INFO] Waiting for frontend...
timeout /t 30 /nobreak >nul

echo.
echo [INFO] Seeding the database...
docker-compose exec backend npm run seed
if %errorlevel% neq 0 (
    echo [WARNING] Failed to seed database. You may need to run this manually.
)

echo.
echo [INFO] Service Status:
docker-compose ps

echo.
echo [SUCCESS] 🎉 HRM System is ready!
echo.
echo Access URLs:
echo   Frontend:     http://localhost:5173
echo   Backend API:  http://localhost:3000
echo   API Docs:     http://localhost:3000/api/docs
echo   Database:     localhost:5432
echo   PgAdmin:      http://localhost:5050
echo.
echo Default Login:
echo   Email:    admin@company.com
echo   Password: admin123
echo.
echo PgAdmin Login:
echo   Email:    admin@admin.com
echo   Password: admin
echo.
echo Useful Commands:
echo   View logs:     docker-compose logs -f
echo   Stop services: docker-compose down
echo   Restart:       docker-compose restart
echo   Rebuild:       docker-compose up -d --build
echo.
pause
