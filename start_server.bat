@echo off
echo Installing dependencies...
pip install Flask flask-cors requests
echo.
echo Starting Dictionary API Server...
echo.
python app.py
pause
