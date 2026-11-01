@echo off
rem Starts the Job Tracker: the Express API and the React app, each in its own window.
start "Job Tracker API" /d "%~dp0server" cmd /k npm run dev
start "Job Tracker UI" /d "%~dp0client" cmd /k npm run dev -- --open
