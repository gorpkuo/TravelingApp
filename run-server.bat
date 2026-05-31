@echo off
setlocal

set "PORT=5500"
set "URL=http://localhost:%PORT%"

echo [INFO] Starting Python HTTP server on %URL%
start "" "%URL%"
py -m http.server %PORT%

endlocal
