@echo off
echo Removing secrets from Git history...
echo.

REM Remove the files with secrets from history
git filter-branch --force --index-filter ^
"git rm --cached --ignore-unmatch backend/KESTRA_SECRET_SETUP.md backend/KESTRA_SETUP_STEPS.txt" ^
--prune-empty --tag-name-filter cat -- --all

echo.
echo Cleaning up...
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo.
echo Done! Now force push:
echo git push origin debjyoti --force
pause
