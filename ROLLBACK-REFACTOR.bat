@echo off
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\rollback-frontend-refactor.ps1"
pause
