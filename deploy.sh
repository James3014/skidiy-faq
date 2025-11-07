#!/bin/bash
# Deployment script for SKIDIY backend to Zeabur

echo "🚀 Deploying SKIDIY Backend to Zeabur..."

# Check if git repo exists
if [ ! -d ".git" ]; then
    echo "❌ Not a git repository. Initialize git first."
    exit 1
fi

# Check for uncommitted changes
if [[ -n $(git status -s) ]]; then
    echo "📝 Found uncommitted changes. Committing..."

    git add .
    git status -s

    read -p "Enter commit message (or press Enter for default): " commit_msg
    if [ -z "$commit_msg" ]; then
        commit_msg="Update: Backend authentication and admin panel fixes

✅ Implemented PHP session-based login system
✅ Added authentication middleware to all admin pages
✅ Disabled HTTP Basic Auth (.htaccess)
✅ Fixed PARKS::update() method for proper column mapping
✅ Added logout functionality to admin menu

🤖 Generated with Claude Code"
    fi

    git commit -m "$commit_msg"
    echo "✅ Changes committed"
else
    echo "✅ No uncommitted changes"
fi

# Push to remote
echo "📤 Pushing to remote repository..."
git push origin main

if [ $? -eq 0 ]; then
    echo "
✅ Deployment successful!

📋 Next Steps:
1. Zeabur will auto-deploy from git push
2. Wait 1-2 minutes for build to complete
3. Test admin login at: https://skidiyog.zeabur.app/bkAdmin/login.php

🔐 Default Credentials:
   Username: admin
   Password: skidiy2024

⚠️  IMPORTANT: Change default password in production!
   Set environment variables in Zeabur dashboard:
   - ADMIN_USERNAME
   - ADMIN_PASSWORD_HASH

📝 Test Checklist:
   □ Login to admin panel
   □ Edit a park (e.g., NOZAWA)
   □ Edit an article
   □ Logout successfully
"
else
    echo "❌ Push failed. Check git configuration and try again."
    exit 1
fi
