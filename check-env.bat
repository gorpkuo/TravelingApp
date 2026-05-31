@echo off
setlocal

echo [CHECK] git
git --version
echo.

echo [CHECK] node
node --version
echo.

echo [CHECK] npm
npm --version
echo.

echo [CHECK] python launcher (py)
py --version
echo.

echo [DONE] Environment check finished.
pause

endlocal
