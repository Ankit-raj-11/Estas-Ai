@echo off
echo ========================================
echo   Fixing Git History and Pushing
echo ========================================
echo.

echo Step 1: Resetting to clean state...
git reset --soft 3d32c47
echo Done!
echo.

echo Step 2: Creating new clean commit...
git add .
git commit -m "Complete security scanner implementation

- Backend API with Express
- Kestra workflow orchestration  
- Security scanning (Semgrep, Bandit)
- AI-powered fixes with Gemini
- GitHub integration for PRs
- Docker setup with secrets management"
echo Done!
echo.

echo Step 3: Force pushing to remote...
git push origin debjyoti --force
echo.

echo ========================================
echo   Complete!
echo ========================================
echo.
echo IMPORTANT: Revoke the old GitHub token and create a new one!
echo Visit: https://github.com/settings/tokens
echo.
pause
