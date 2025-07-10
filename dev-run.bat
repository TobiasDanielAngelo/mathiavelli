@echo off
start cmd /k "cd server && poetry run python manage.py runserver"
start cmd /k "cd web && yarn dev"