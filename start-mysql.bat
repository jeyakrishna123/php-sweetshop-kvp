@echo off
echo Starting MySQL...
cd C:\xampp\mysql\bin
start mysqld.exe --defaults-file=C:\xampp\mysql\bin\my.ini --standalone --console
echo MySQL started!
timeout /t 5
