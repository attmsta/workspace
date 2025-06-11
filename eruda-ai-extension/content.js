// Content script for Eruda AI Assistant
class ErudaAIContent {
  constructor() {
    this.isErudaLoaded = false;
    this.aiAssistantPanel = null;
    this.ragSystem = null;
    this.pageObserver = null;
    this.init();
  }

  async init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  async setup() {
    try {
      // Load Eruda
      await this.loadEruda();
      
      // Inject page monitoring script
      await this.injectPageMonitoring();
      
      // Initialize RAG system
      await this.initializeRAG();
      
      // Setup page monitoring
      this.setupPageMonitoring();
      
      // Add AI assistant panel to Eruda
      this.addAIAssistantPanel();
      
      console.log('Eruda AI Assistant initialized');
    } catch (error) {
      console.error('Failed to initialize Eruda AI Assistant:', error);
    }
  }

  async loadEruda() {
    return new Promise((resolve, reject) => {
      if (window.eruda) {
        this.isErudaLoaded = true;
        resolve();
        return;
      }

      // Load Eruda from CDN
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/eruda@3.0.1/eruda.js';
      script.onload = () => {
        window.eruda.init();
        this.isErudaLoaded = true;
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async injectPageMonitoring() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = chrome.runtime.getURL('injected.js');
      script.onload = () => {
        // Listen for messages from injected script
        window.addEventListener('message', (event) => {
          if (event.source === window && event.data.source === 'eruda-ai-injected') {
            this.handleInjectedMessage(event.data);
          }
        });
        resolve();
      };
      script.onerror = reject;
      (document.head || document.documentElement).appendChild(script);
    });
  }

  handleInjectedMessage(message) {
    // Process messages from injected script and add to RAG system
    if (this.ragSystem) {
      this.ragSystem.addDocument({
        type: message.type,
        content: JSON.stringify(message.data),
        timestamp: message.timestamp,
        url: window.location.href
      });
    }
  }

  async initializeRAG() {
    // Load vector store implementation
    const ragScript = document.createElement('script');
    ragScript.src = chrome.runtime.getURL('vector-store.js');
    document.head.appendChild(ragScript);

    // Wait for vector store to load
    await new Promise(resolve => {
      ragScript.onload = resolve;
    });

    this.ragSystem = new window.VectorStore();
    await this.ragSystem.initialize();
  }

  setupPageMonitoring() {
    // Monitor DOM changes
    this.pageObserver = new MutationObserver((mutations) => {
      this.handleDOMChanges(mutations);
    });

    this.pageObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeOldValue: true
    });

    // Monitor network requests via Eruda
    this.monitorNetworkRequests();

    // Capture initial page state
    this.capturePageState();
  }

  handleDOMChanges(mutations) {
    // Debounce DOM change processing
    clearTimeout(this.domChangeTimeout);
    this.domChangeTimeout = setTimeout(() => {
      this.processDOMChanges(mutations);
    }, 500);
  }

  async processDOMChanges(mutations) {
    const changes = mutations.map(mutation => ({
      type: mutation.type,
      target: this.getElementSelector(mutation.target),
      addedNodes: Array.from(mutation.addedNodes).map(node => 
        node.nodeType === 1 ? this.getElementSelector(node) : node.textContent
      ),
      removedNodes: Array.from(mutation.removedNodes).map(node =>
        node.nodeType === 1 ? this.getElementSelector(node) : node.textContent
      ),
      attributeName: mutation.attributeName,
      oldValue: mutation.oldValue
    }));

    // Store changes in RAG system
    await this.ragSystem.addDocument({
      type: 'dom_changes',
      content: JSON.stringify(changes),
      timestamp: Date.now(),
      url: window.location.href
    });
  }

  monitorNetworkRequests() {
    // Hook into Eruda's network monitoring
    if (window.eruda && window.eruda._devTools) {
      const networkTool = window.eruda._devTools.get('network');
      if (networkTool) {
        const originalAdd = networkTool.add.bind(networkTool);
        networkTool.add = (request) => {
          this.captureNetworkRequest(request);
          return originalAdd(request);
        };
      }
    }
  }

  async captureNetworkRequest(request) {
    const requestData = {
      type: 'network_request',
      content: JSON.stringify({
        url: request.url,
        method: request.method,
        status: request.status,
        headers: request.reqHeaders,
        responseHeaders: request.resHeaders,
        requestBody: request.reqData,
        responseBody: request.resData,
        timestamp: request.time
      }),
      timestamp: Date.now(),
      url: window.location.href
    };

    await this.ragSystem.addDocument(requestData);
  }

  async capturePageState() {
    const pageState = {
      type: 'page_state',
      content: JSON.stringify({
        html: document.documentElement.outerHTML,
        scripts: this.extractScripts(),
        styles: this.extractStyles(),
        iframes: this.extractIframes(),
        eventListeners: this.extractEventListeners(),
        url: window.location.href,
        title: document.title,
        meta: this.extractMetadata()
      }),
      timestamp: Date.now(),
      url: window.location.href
    };

    await this.ragSystem.addDocument(pageState);
  }

  extractScripts() {
    const scripts = [];
    document.querySelectorAll('script').forEach(script => {
      scripts.push({
        src: script.src,
        content: script.innerHTML,
        type: script.type,
        async: script.async,
        defer: script.defer
      });
    });
    return scripts;
  }

  extractStyles() {
    const styles = [];
    document.querySelectorAll('style, link[rel="stylesheet"]').forEach(style => {
      if (style.tagName === 'STYLE') {
        styles.push({
          type: 'inline',
          content: style.innerHTML
        });
      } else {
        styles.push({
          type: 'external',
          href: style.href,
          media: style.media
        });
      }
    });
    return styles;
  }

  extractIframes() {
    const iframes = [];
    document.querySelectorAll('iframe').forEach(iframe => {
      try {
        iframes.push({
          src: iframe.src,
          content: iframe.contentDocument ? iframe.contentDocument.documentElement.outerHTML : null,
          sandbox: iframe.sandbox.toString(),
          allowFullscreen: iframe.allowFullscreen
        });
      } catch (error) {
        // Cross-origin iframe, can't access content
        iframes.push({
          src: iframe.src,
          content: null,
          crossOrigin: true
        });
      }
    });
    return iframes;
  }

  extractEventListeners() {
    // This is a simplified approach - in practice, you'd need more sophisticated listener detection
    const listeners = [];
    document.querySelectorAll('*').forEach(element => {
      const events = [];
      for (const prop in element) {
        if (prop.startsWith('on') && typeof element[prop] === 'function') {
          events.push(prop.substring(2));
        }
      }
      if (events.length > 0) {
        listeners.push({
          selector: this.getElementSelector(element),
          events: events
        });
      }
    });
    return listeners;
  }

  extractMetadata() {
    const meta = {};
    document.querySelectorAll('meta').forEach(metaTag => {
      const name = metaTag.name || metaTag.property;
      const content = metaTag.content;
      if (name && content) {
        meta[name] = content;
      }
    });
    return meta;
  }

  getElementSelector(element) {
    if (!element || element.nodeType !== 1) return '';
    
    let selector = element.tagName.toLowerCase();
    
    if (element.id) {
      selector += `#${element.id}`;
    }
    
    if (element.className) {
      const classes = element.className.split(' ').filter(c => c.trim());
      if (classes.length > 0) {
        selector += '.' + classes.join('.');
      }
    }
    
    return selector;
  }

  addAIAssistantPanel() {
    if (!window.eruda) return;

    // Create AI Assistant tool
    const aiTool = {
      name: 'ai-assistant',
      init: ($el) => {
        this.createAIInterface($el);
      },
      show: () => {
        console.log('AI Assistant panel shown');
      },
      hide: () => {
        console.log('AI Assistant panel hidden');
      }
    };

    // Add the tool to Eruda
    window.eruda.add(aiTool);
  }

  createAIInterface($container) {
    const html = `
      <div class="ai-assistant-container">
        <div class="ai-chat-header">
          <h3>AI Assistant</h3>
          <button class="ai-settings-btn" title="Settings">⚙️</button>
        </div>
        
        <div class="ai-chat-messages" id="ai-chat-messages">
          <div class="ai-message system">
            <div class="message-content">
              Hello! I'm your AI assistant for web development and debugging. 
              I can help you analyze this page's code, debug issues, and answer questions about the current state.
            </div>
          </div>
        </div>
        
        <div class="ai-chat-input-container">
          <div class="ai-context-info">
            <span class="context-count">Context: <span id="context-count">0</span> chunks</span>
            <button class="refresh-context-btn" title="Refresh page context">🔄</button>
          </div>
          <div class="ai-input-wrapper">
            <textarea 
              id="ai-chat-input" 
              placeholder="Ask me about this page's code, DOM, network requests, or any debugging questions..."
              rows="3"
            ></textarea>
            <button id="ai-send-btn" class="ai-send-btn">Send</button>
          </div>
        </div>
      </div>
    `;

    $container.html(html);
    this.setupAIEventListeners($container);
    this.loadAIStyles();
    this.updateContextCount();
  }

  setupAIEventListeners($container) {
    const $input = $container.find('#ai-chat-input');
    const $sendBtn = $container.find('#ai-send-btn');
    const $settingsBtn = $container.find('.ai-settings-btn');
    const $refreshBtn = $container.find('.refresh-context-btn');

    $sendBtn.on('click', () => this.sendMessage());
    $input.on('keydown', (e) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        this.sendMessage();
      }
    });

    $settingsBtn.on('click', () => this.showSettings());
    $refreshBtn.on('click', () => this.refreshContext());
  }

  async sendMessage() {
    const $input = $('#ai-chat-input');
    const message = $input.val().trim();
    
    if (!message) return;

    // Add user message to chat
    this.addMessageToChat('user', message);
    $input.val('');

    // Show typing indicator
    const typingId = this.addMessageToChat('assistant', 'Thinking...', true);

    try {
      // Get relevant context from RAG system
      const relevantContext = await this.ragSystem.search(message, 5);
      
      // Build conversation context
      const messages = this.buildConversationContext(message, relevantContext);
      
      // Send to AI
      const response = await chrome.runtime.sendMessage({
        type: 'MAKE_AI_REQUEST',
        payload: { messages }
      });

      if (response.success) {
        this.updateMessage(typingId, response.data.content);
      } else {
        this.updateMessage(typingId, `Error: ${response.error}`);
      }
    } catch (error) {
      console.error('AI request failed:', error);
      this.updateMessage(typingId, `Error: ${error.message}`);
    }
  }

  buildConversationContext(userMessage, relevantContext) {
    const systemPrompt = `You are an expert web development and debugging assistant. You have access to the current page's context including:

- HTML structure and DOM elements
- JavaScript code (inline and external)
- CSS styles and selectors
- Network requests and responses
- Event listeners and behaviors
- Runtime errors and console logs

Use this context to provide accurate, helpful responses about the current page. Be specific and reference actual code/elements when possible.

Current page URL: ${window.location.href}
Page title: ${document.title}

Relevant context from the page:
${relevantContext.map(ctx => `- ${ctx.type}: ${ctx.content.substring(0, 500)}...`).join('\n')}`;

    return [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ];
  }

  addMessageToChat(role, content, isTyping = false) {
    const $messages = $('#ai-chat-messages');
    const messageId = `msg-${Date.now()}`;
    
    const messageHtml = `
      <div class="ai-message ${role}" id="${messageId}">
        <div class="message-role">${role === 'user' ? 'You' : 'Assistant'}</div>
        <div class="message-content ${isTyping ? 'typing' : ''}">${content}</div>
        <div class="message-time">${new Date().toLocaleTimeString()}</div>
      </div>
    `;
    
    $messages.append(messageHtml);
    $messages.scrollTop($messages[0].scrollHeight);
    
    return messageId;
  }

  updateMessage(messageId, content) {
    const $message = $(`#${messageId} .message-content`);
    $message.removeClass('typing').html(content);
  }

  async refreshContext() {
    await this.capturePageState();
    this.updateContextCount();
    
    // Show feedback
    const $refreshBtn = $('.refresh-context-btn');
    const originalText = $refreshBtn.text();
    $refreshBtn.text('✓');
    setTimeout(() => $refreshBtn.text(originalText), 1000);
  }

  async updateContextCount() {
    const count = await this.ragSystem.getDocumentCount();
    $('#context-count').text(count);
  }

  showSettings() {
    // This would open the extension popup or a modal
    chrome.runtime.sendMessage({ type: 'OPEN_SETTINGS' });
  }

  loadAIStyles() {
    const styles = `
      <style>
        .ai-assistant-container {
          height: 100%;
          display: flex;
          flex-direction: column;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .ai-chat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px;
          border-bottom: 1px solid #e0e0e0;
          background: #f5f5f5;
        }
        
        .ai-chat-header h3 {
          margin: 0;
          font-size: 16px;
          color: #333;
        }
        
        .ai-settings-btn {
          background: none;
          border: none;
          font-size: 16px;
          cursor: pointer;
          padding: 5px;
          border-radius: 3px;
        }
        
        .ai-settings-btn:hover {
          background: #e0e0e0;
        }
        
        .ai-chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 10px;
          background: #fff;
        }
        
        .ai-message {
          margin-bottom: 15px;
          padding: 10px;
          border-radius: 8px;
          max-width: 85%;
        }
        
        .ai-message.user {
          background: #007bff;
          color: white;
          margin-left: auto;
        }
        
        .ai-message.assistant {
          background: #f1f3f4;
          color: #333;
        }
        
        .ai-message.system {
          background: #e8f5e8;
          color: #2d5a2d;
          font-style: italic;
        }
        
        .message-role {
          font-size: 12px;
          font-weight: bold;
          margin-bottom: 5px;
          opacity: 0.7;
        }
        
        .message-content {
          line-height: 1.4;
          white-space: pre-wrap;
        }
        
        .message-content.typing::after {
          content: '...';
          animation: typing 1.5s infinite;
        }
        
        .message-time {
          font-size: 11px;
          opacity: 0.5;
          margin-top: 5px;
        }
        
        .ai-chat-input-container {
          border-top: 1px solid #e0e0e0;
          background: #f9f9f9;
        }
        
        .ai-context-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 5px 10px;
          font-size: 12px;
          color: #666;
          border-bottom: 1px solid #e0e0e0;
        }
        
        .refresh-context-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 2px 5px;
          border-radius: 3px;
        }
        
        .refresh-context-btn:hover {
          background: #e0e0e0;
        }
        
        .ai-input-wrapper {
          display: flex;
          padding: 10px;
          gap: 10px;
        }
        
        #ai-chat-input {
          flex: 1;
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 8px;
          font-size: 14px;
          resize: vertical;
          min-height: 60px;
        }
        
        .ai-send-btn {
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 8px 16px;
          cursor: pointer;
          font-size: 14px;
          height: fit-content;
        }
        
        .ai-send-btn:hover {
          background: #0056b3;
        }
        
        @keyframes typing {
          0%, 60%, 100% { opacity: 1; }
          30% { opacity: 0.5; }
        }
      </style>
    `;
    
    if (!document.querySelector('#ai-assistant-styles')) {
      const styleEl = document.createElement('div');
      styleEl.id = 'ai-assistant-styles';
      styleEl.innerHTML = styles;
      document.head.appendChild(styleEl);
    }
  }
}

// Initialize when content script loads
new ErudaAIContent();