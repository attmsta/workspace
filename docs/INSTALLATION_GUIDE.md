# 📦 Eruda AI Assistant Chrome Extension - Installation Guide

## 🚀 Quick Installation

### Method 1: Download from GitHub Releases (Recommended)

1. **Download the Extension**
   - Go to [GitHub Releases](https://github.com/attmsta/workspace/releases/tag/v1.0.0)
   - Download `eruda-ai-assistant-v1.0.0.zip` (87KB)

2. **Extract the Package**
   ```bash
   # Extract the zip file
   unzip eruda-ai-assistant-v1.0.0.zip
   cd eruda-ai-extension-release/
   ```

3. **Install in Chrome**
   - Open Chrome browser
   - Navigate to `chrome://extensions/`
   - Enable **"Developer mode"** (toggle in top right)
   - Click **"Load unpacked"**
   - Select the extracted `eruda-ai-extension-release` folder
   - Extension installed! 🎉

### Method 2: Clone from Repository

1. **Clone the Repository**
   ```bash
   git clone https://github.com/attmsta/workspace.git
   cd workspace/eruda-ai-extension
   ```

2. **Install in Chrome**
   - Open Chrome browser
   - Navigate to `chrome://extensions/`
   - Enable **"Developer mode"** (toggle in top right)
   - Click **"Load unpacked"**
   - Select the `eruda-ai-extension` folder
   - Extension installed! 🎉

## ✅ Verification Steps

### 1. Check Extension Installation
- Look for **"Eruda AI Assistant"** in your Chrome extensions list
- The extension icon should appear in your browser toolbar
- Status should show **"Enabled"**

### 2. Test Basic Functionality
1. **Open any webpage** (e.g., https://example.com)
2. **Click the extension icon** in the toolbar
3. **Verify popup opens** with AI chat interface
4. **Check model selection** dropdown shows available AI models
5. **Test quick actions** - you should see cybersecurity options

### 3. Test Cybersecurity Features
1. **Click "🔒 Security Scan"** quick action
2. **Verify analysis runs** and shows results
3. **Check other security actions**:
   - 🦠 Malware Check
   - 🔐 Privacy Audit
   - 🎯 Pentest Plan

### 4. Test AI Chat
1. **Type a message** in the chat input
2. **Select an AI model** from the dropdown
3. **Send the message** and verify AI response
4. **Check conversation history** persists

## 🔧 Troubleshooting

### Common Issues

#### Extension Not Loading
- **Check Chrome version**: Requires Chrome 88+ for Manifest V3
- **Enable Developer mode**: Must be enabled to load unpacked extensions
- **Check folder structure**: Ensure `manifest.json` is in the root folder

#### Popup Not Opening
- **Check permissions**: Extension needs `activeTab` permission
- **Reload extension**: Try disabling and re-enabling the extension
- **Check console**: Open DevTools and check for JavaScript errors

#### AI Features Not Working
- **API Keys**: Some AI models require API keys (configure in popup)
- **Network connectivity**: Ensure internet connection for AI services
- **CORS issues**: Some websites may block extension scripts

#### Cybersecurity Analysis Failing
- **Context capture**: Ensure the webpage has loaded completely
- **JavaScript enabled**: Extension requires JavaScript to be enabled
- **Content Security Policy**: Some sites may block extension execution

### Debug Mode

1. **Open Chrome DevTools** (F12)
2. **Go to Console tab**
3. **Look for extension logs** prefixed with `[Eruda AI]`
4. **Check for error messages** and report issues

### Reset Extension

1. **Go to** `chrome://extensions/`
2. **Find "Eruda AI Assistant"**
3. **Click "Remove"** to uninstall
4. **Reinstall** following the installation steps above

## 🛡️ Security & Privacy

### Data Handling
- **Local Storage**: Extension data stored locally in Chrome
- **API Communications**: Encrypted HTTPS connections only
- **No Data Collection**: Extension doesn't collect personal data
- **Secure Analysis**: Security scans performed locally

### Permissions Explained
- **`activeTab`**: Access current webpage for analysis
- **`storage`**: Store extension settings and chat history
- **`scripting`**: Inject analysis scripts into webpages
- **`webRequest`**: Monitor network requests for security analysis
- **`webNavigation`**: Track page navigation for context

### Privacy Features
- **GDPR Compliance**: Built-in privacy compliance auditing
- **Cookie Analysis**: Secure cookie usage assessment
- **Data Minimization**: Only necessary data processing
- **Consent Management**: User permission handling

## 📊 Features Overview

### 🤖 AI Capabilities
- **30+ AI Models**: OpenAI, Anthropic, Google AI, Cohere, Mistral AI, Perplexity, Together AI, Groq
- **8 Prompt Templates**: Debug, performance, security, accessibility, code review, explain, refactor, testing
- **Conversation Memory**: Persistent chat history with context awareness
- **Smart Suggestions**: Context-aware code and security recommendations

### 🛡️ Cybersecurity Features
- **6 Security Modules**: Web app scanner, network analyzer, CSP analyzer, malware detector, privacy auditor, pentest assistant
- **OWASP Top 10 2021**: Complete vulnerability coverage
- **Malware Detection**: Cryptojacking, phishing, data exfiltration patterns
- **Privacy Compliance**: GDPR, CCPA, and other regulation auditing
- **Penetration Testing**: Automated test case generation and security planning

### 🎯 Quick Actions
- **🔒 Security Scan**: Comprehensive cybersecurity analysis
- **🦠 Malware Check**: Malicious code and threat detection
- **🔐 Privacy Audit**: GDPR/CCPA compliance verification
- **🎯 Pentest Plan**: Penetration testing strategy generation
- **🐛 Debug Issues**: JavaScript error analysis and solutions
- **⚡ Performance**: Page performance optimization recommendations

## 🔄 Updates & Maintenance

### Automatic Updates
- **Chrome Web Store**: Automatic updates when published
- **Manual Updates**: Download new releases from GitHub

### Version Checking
- **Current Version**: Check in `chrome://extensions/`
- **Latest Release**: Visit [GitHub Releases](https://github.com/attmsta/workspace/releases)
- **Changelog**: Review release notes for new features

### Backup & Restore
- **Export Settings**: Use Chrome sync or manual backup
- **Chat History**: Stored in Chrome local storage
- **Custom Configurations**: Export/import through extension popup

## 📞 Support & Community

### Getting Help
- **GitHub Issues**: [Report bugs and request features](https://github.com/attmsta/workspace/issues)
- **Documentation**: Comprehensive guides in repository
- **Community**: Join discussions and share experiences

### Contributing
- **Bug Reports**: Detailed issue reports with reproduction steps
- **Feature Requests**: Suggestions for new capabilities
- **Code Contributions**: Pull requests welcome
- **Security Reports**: Responsible disclosure for security issues

### Resources
- **Repository**: https://github.com/attmsta/workspace
- **Releases**: https://github.com/attmsta/workspace/releases
- **Documentation**: Complete guides and API references
- **Examples**: Usage examples and best practices

---

**Version**: 1.0.0  
**Last Updated**: June 12, 2025  
**Compatibility**: Chrome 88+ (Manifest V3)  
**License**: MIT  

For additional support, please visit our [GitHub repository](https://github.com/attmsta/workspace) or open an issue.