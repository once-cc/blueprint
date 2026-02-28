#!/bin/bash

echo "=========================================="
echo "🤖 Gemini CLI Agent Setup (Powered by Aider)"
echo "=========================================="
echo ""

# Check if python3 is installed
if ! command -v python3 &> /dev/null
then
    echo "❌ Error: python3 is not installed. Please install it first."
    exit 1
fi

echo "📦 Installing Aider (The premiere terminal coding agent)..."

# Use the official Aider curl install script which handles python virtual environments flawlessly
curl -LsSf https://aider.chat/install.sh | sh

echo ""
echo "✅ Aider CLI Agent installed perfectly!"
echo ""
echo "=========================================="
echo "🚀 HOW TO GET STARTED:"
echo "=========================================="
echo "1. Grab your Gemini API Key from: https://aistudio.google.com/app/apikey"
echo "2. Open your terminal and export the key:"
echo '   export GEMINI_API_KEY="your-api-key-here"'
echo ""
echo "3. Launch your new Parallel Agent!"
echo "   npm run agent"
echo ""
echo "💡 (This will run: aider --model gemini/gemini-1.5-pro-latest)"
echo "You can also specify a markdown plan like: 'aider --model gemini/gemini-1.5-pro-latest --message-file docs/plans/your-plan.md'"
