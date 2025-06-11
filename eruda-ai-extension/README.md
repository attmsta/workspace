# Eruda AI Assistant

A powerful Chrome extension that integrates Eruda with an intelligent AI assistant for web development and debugging tasks. The assistant provides contextual understanding of your current page and supports natural-language discussions grounded in actual code and runtime state.

## Features

### 🔧 Eruda Integration
- Seamlessly integrates with Eruda developer tools
- Enhanced console, network, and DOM inspection
- Real-time monitoring of page changes and interactions

### 🤖 AI Assistant
- **Contextual Understanding**: Deep analysis of current page state
- **Multi-Provider Support**: OpenAI, Anthropic, and OpenRouter
- **Natural Language Interface**: Ask questions about code, DOM, network requests
- **Real-time Debugging**: Get help with errors and performance issues

### 📚 RAG (Retrieval-Augmented Generation)
- **Intelligent Context Capture**: Automatically captures and chunks page content
- **Vector-based Retrieval**: Finds relevant context for your questions
- **Privacy-First**: All processing happens in-browser using IndexedDB
- **Continuous Learning**: Maintains context across debugging sessions

### 🔍 Comprehensive Page Analysis
- **JavaScript Code**: Inline and external scripts
- **DOM Structure**: Real-time HTML and element analysis
- **Network Monitoring**: HTTP requests, responses, and errors
- **Event Listeners**: Track user interactions and behaviors
- **Performance Metrics**: Page load times and resource usage
- **Framework Detection**: Automatic detection of React, Vue, Angular, etc.

## Installation

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory
5. The Eruda AI Assistant icon should appear in your toolbar

## Configuration

1. Click the extension icon to open settings
2. Choose your AI provider (OpenAI, Anthropic, or OpenRouter)
3. Enter your API key
4. Select your preferred model
5. Configure RAG settings (optional)

### Supported Providers

#### OpenAI
- GPT-4, GPT-4 Turbo, GPT-3.5 Turbo
- Requires OpenAI API key

#### Anthropic
- Claude 3 Opus, Sonnet, Haiku
- Requires Anthropic API key

#### OpenRouter
- Access to multiple models including Claude, GPT-4, Llama 2
- Requires OpenRouter API key

## Usage

1. **Open Eruda**: Navigate to any webpage and the extension will automatically inject Eruda
2. **Access AI Assistant**: Look for the "AI Assistant" tab in the Eruda panel
3. **Ask Questions**: Type natural language questions about the current page
4. **Get Contextual Answers**: The AI will analyze the page and provide relevant responses

### Example Questions

- "What JavaScript frameworks are being used on this page?"
- "Why is this form not submitting?"
- "What network requests are failing and why?"
- "How can I optimize the performance of this page?"
- "What event listeners are attached to this button?"
- "Explain the structure of this React component"

## Privacy & Security

- **Local Processing**: RAG system runs entirely in your browser
- **API Keys**: Stored locally using Chrome's secure storage
- **No Data Collection**: Extension doesn't collect or transmit personal data
- **Secure Communication**: All AI requests use HTTPS

## Development

### Project Structure
```
eruda-ai-extension/
├── manifest.json          # Extension manifest
├── background.js          # Service worker for API calls
├── content.js            # Main content script
├── injected.js           # Page context extraction
├── vector-store.js       # RAG implementation
├── popup.html/css/js     # Settings interface
└── icons/               # Extension icons
```

### Key Components

- **Background Service**: Handles AI API requests and settings
- **Content Script**: Manages Eruda integration and UI
- **Injected Script**: Deep page monitoring and context extraction
- **Vector Store**: In-browser RAG system using IndexedDB
- **Popup Interface**: User-friendly settings and configuration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues, questions, or feature requests, please open an issue on GitHub.

---

**Note**: This extension requires an API key from one of the supported AI providers. API usage is subject to the respective provider's terms and pricing.