@echo off
REM ============================================================
REM  Jiaranest catalog API — first-time setup (PostgreSQL).
REM  Run this ONCE from the server\ folder:  setup.cmd
REM  Then start the API with:  npm run start:dev
REM  Requires Docker Desktop running (for local Postgres).
REM ============================================================
setlocal

cd /d "%~dp0"
echo(
echo === Jiaranest API setup (PostgreSQL) ===
echo Working dir: %CD%
echo(

REM --- 1. Postgres via Docker ------------------------------------------------
echo [1/5] Starting Postgres (docker compose up -d)...
docker compose up -d
if errorlevel 1 (
  echo(
  echo ERROR: docker compose failed. Is Docker Desktop running?
  goto :fail
)

REM --- 2. .env ---------------------------------------------------------------
echo [2/5] Ensuring .env exists...
if not exist ".env" (
  copy ".env.example" ".env" >nul
  echo   created .env from .env.example
) else (
  echo   .env already present, leaving it
)

REM --- 3. Dependencies -------------------------------------------------------
echo [3/5] Installing dependencies (npm install)...
call npm install
if errorlevel 1 (
  echo ERROR: npm install failed. See output above.
  goto :fail
)

REM --- 4. Database schema ----------------------------------------------------
echo [4/5] Creating database tables (prisma migrate dev)...
call npx prisma migrate dev --name init
if errorlevel 1 (
  echo ERROR: prisma migrate failed. Is Postgres healthy? Try: docker compose ps
  goto :fail
)

REM --- 5. Seed ---------------------------------------------------------------
echo [5/5] Seeding the catalog (npm run seed)...
call npm run seed
if errorlevel 1 (
  echo ERROR: seed failed. See output above.
  goto :fail
)

echo(
echo ============================================================
echo  Setup complete. Start the API with:
echo      npm run start:dev
echo  Then open http://localhost:3000/api/categories to verify.
echo ============================================================
goto :eof

:fail
echo(
echo Setup stopped. Fix the error above and re-run setup.cmd
exit /b 1
