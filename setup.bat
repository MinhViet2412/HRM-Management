@echo off
REM HRM System Setup Script for Windows
REM This script sets up the HRM system for development on Windows

echo 🚀 HRM System Setup
echo ==================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

echo [SUCCESS] Node.js is installed
node --version

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed
    pause
    exit /b 1
)

echo [SUCCESS] npm is installed
npm --version

echo.
echo [INFO] Installing root dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install root dependencies
    pause
    exit /b 1
)

echo.
echo [INFO] Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install backend dependencies
    pause
    exit /b 1
)
cd ..

echo.
echo [INFO] Installing frontend dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install frontend dependencies
    pause
    exit /b 1
)
cd ..

echo.
echo [INFO] Setting up environment files...

REM Backend environment
if not exist backend\.env (
    copy backend\env.example backend\.env
    echo [SUCCESS] Created backend\.env from template
) else (
    echo [WARNING] backend\.env already exists
)

REM Frontend environment
if not exist frontend\.env (
    copy frontend\env.example frontend\.env
    echo [SUCCESS] Created frontend\.env from template
) else (
    echo [WARNING] frontend\.env already exists
)

echo.
echo [INFO] Building applications...

REM Build backend
cd backend
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Failed to build backend
    pause
    exit /b 1
)
cd ..

REM Build frontend
cd frontend
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Failed to build frontend
    pause
    exit /b 1
)
cd ..

echo.
echo [INFO] Setting up database data...
cd backend
call npm run seed
if %errorlevel% neq 0 (
    echo [WARNING] Failed to seed database. Please ensure PostgreSQL is running and accessible.
)
cd ..

echo.
echo [SUCCESS] 🎉 HRM System setup complete!
echo.
echo Next steps:
echo 1. Start the backend: cd backend ^&^& npm run start:dev
echo 2. Start the frontend: cd frontend ^&^& npm run dev
echo 3. Access the application: http://localhost:5173
echo 4. Login with: admin@company.com / admin123
echo.
echo Or use Docker: docker-compose up -d
echo.
pause
