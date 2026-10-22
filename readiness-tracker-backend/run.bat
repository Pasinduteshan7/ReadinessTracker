@echo off
cd /d "%~dp0"
set JAVA_TOOL_OPTIONS=-Djava.net.preferIPv4Stack=true
echo Loading environment from .env...
for /f "usebackq eol=# tokens=1* delims==" %%A in (".env") do (
    if not "%%A"=="" set "%%A=%%B"
)
echo Starting Spring Boot Backend with Supabase...
call gradlew.bat bootRun
