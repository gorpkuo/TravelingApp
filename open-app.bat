@echo off
setlocal

set "PORT=5500"
set "URL=http://localhost:%PORT%"

echo [INFO] Opening %URL%
start "" "%URL%"

endlocal
