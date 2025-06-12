# Installation Guide

## Quick Start

### 1. Load the Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked"
4. Select the `eruda-ai-extension` folder
5. The extension should now appear in your extensions list

### 2. Configure API Settings

1. Click the Eruda AI Assistant icon in your Chrome toolbar
2. Choose your preferred AI provider:
   - **OpenAI**: Requires OpenAI API key
   - **Anthropic**: Requires Anthropic API key  
   - **OpenRouter**: Requires OpenRouter API key
3. Enter your API key
4. Select a model (or leave default)
5. Click "Save Settings"

### 3. Test the Extension

1. Start the demo server: `python3 server.py`
2. Visit `http://localhost:12000/demo.html`
3. Open Chrome DevTools (F12)
4. Look for the "AI Assistant" tab in the Eruda panel
5. Try asking questions about the page!

## API Key Setup

### OpenAI
1. Visit https://platform.openai.com/api-keys
2. Create a new API key
3. Copy and paste into the extension settings

### Anthropic
1. Visit https://console.anthropic.com/
2. Go to API Keys section
3. Create a new API key
4. Copy and paste into the extension settings

### OpenRouter
1. Visit https://openrouter.ai/keys
2. Create a new API key
3. Copy and paste into the extension settings

## Troubleshooting

### Extension Not Loading
- Make sure you're in Developer mode
- Check the Chrome console for errors
- Verify all files are present in the extension folder

### Eruda Not Appearing
- Refresh the page after installing the extension
- Check if the page allows content scripts
- Look for any console errors

### AI Assistant Not Responding
- Verify your API key is correct
- Check your internet connection
- Test the connection using the "Test Connection" button
- Make sure you have sufficient API credits

### RAG System Issues
- Clear browser data if IndexedDB is corrupted
- Check browser console for vector store errors
- Try disabling and re-enabling RAG in settings

## Development

### File Structure
```
eruda-ai-extension/
├── manifest.json          # Extension configuration
├── background.js          # Service worker for API calls
├── content.js            # Main content script
├── injected.js           # Deep page monitoring
├── vector-store.js       # RAG implementation
├── popup.html/css/js     # Settings interface
├── demo.html             # Test page
└── server.py            # Development server
```

### Testing Changes
1. Make your changes to the extension files
2. Go to `chrome://extensions/`
3. Click the refresh button on the Eruda AI Assistant extension
4. Reload any test pages

### Adding New Features
1. For UI changes: Edit `content.js` and related CSS
2. For AI functionality: Edit `background.js`
3. For page monitoring: Edit `injected.js`
4. For RAG features: Edit `vector-store.js`

## Security Notes

- API keys are stored locally in Chrome's secure storage
- No data is sent to external servers except AI API calls
- RAG system operates entirely in-browser
- Extension only accesses pages you visit

## Support

For issues or questions:
1. Check the browser console for errors
2. Review this installation guide
3. Open an issue on GitHub
4. Check the extension's popup for status information