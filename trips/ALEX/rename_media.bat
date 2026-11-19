@echo off
setlocal enabledelayedexpansion
echo Renaming photos to 1.jpg, 2.jpg ... and videos to 1.mp4, 2.mp4 ...
echo.

set np=0
set nv=0

rem ---- Pass 1: give everything a temporary name (avoids name clashes) ----
for /f "delims=" %%f in ('dir /b /a-d /on *.jpg *.jpeg *.png 2^>nul') do (
  set /a np+=1
  ren "%%f" "tmpp_!np!%%~xf"
)

for /f "delims=" %%f in ('dir /b /a-d /on *.mp4 *.mov *.avi *.mkv *.wmv *.m4v *.3gp 2^>nul') do (
  set /a nv+=1
  ren "%%f" "tmpv_!nv!%%~xf"
)

if %np%==0 if %nv%==0 (
  echo No photos or videos found.
  pause
  exit /b
)

rem ---- Pass 2: final names ----
for /l %%i in (1,1,%np%) do (
  for %%g in (tmpp_%%i.*) do ren "%%g" "%%i.jpg"
)

for /l %%i in (1,1,%nv%) do (
  for %%g in (tmpv_%%i.*) do ren "%%g" "%%i.mp4"
)

echo Done!
echo Photos renamed: %np%
echo Videos renamed: %nv%
pause
