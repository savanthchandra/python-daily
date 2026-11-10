#!/usr/bin/env bash
# Python Daily Deployment Script
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

echo "=========================================="
echo "  Deploy Python Daily to Public Web       "
echo "=========================================="
echo ""
echo "Select deployment target:"
echo "1) Surge.sh (Fastest CLI deploy -> https://savanth-python-daily.surge.sh)"
echo "2) Netlify Drop (Open drag-and-drop web UI in browser - zero install)"
echo "3) Vercel (CLI deploy -> https://python-daily.vercel.app)"
echo "4) GitHub Pages (Push to GitHub repo)"
echo ""
read -p "Enter choice (1-4, default 1): " choice
choice=${choice:-1}

case "$choice" in
  1)
    echo "Publishing to Surge.sh..."
    DOMAIN="savanth-python-daily-$RANDOM.surge.sh"
    echo "Target domain: https://$DOMAIN"
    npx surge . "$DOMAIN"
    echo ""
    echo "✓ Published successfully to: https://$DOMAIN"
    ;;
  2)
    echo "Opening Netlify Drop in your browser..."
    open "https://app.netlify.com/drop"
    open -R index.html
    echo "Drop the highlighted folder into Netlify Drop in your browser to get an instant live HTTPS link!"
    ;;
  3)
    echo "Deploying via Vercel..."
    npx vercel --prod
    ;;
  4)
    read -p "Enter your GitHub repository URL (e.g. https://github.com/username/python-daily.git): " repo
    if [ -n "$repo" ]; then
      git remote remove origin 2>/dev/null || true
      git remote add origin "$repo"
      git branch -M main
      git push -u origin main --force
      echo ""
      echo "✓ Pushed to GitHub! Go to Settings -> Pages in your GitHub repository and enable GitHub Pages on branch 'main'."
    fi
    ;;
  *)
    echo "Invalid option."
    exit 1
    ;;
esac
