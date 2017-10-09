@echo off
setlocal
set ELECTRON_RUN_AS_NODE=1
call "%~dp0..\@@NAME@@.exe" "%~dp0..\resources\bin\cli.js" %*
endlocal