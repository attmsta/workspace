// Content script for Eruda AI Assistant
class ErudaAIContent {
  constructor() {
    this.isErudaLoaded = false;
    this.aiAssistantPanel = null;
    this.ragSystem = null;
    this.contextManager = null;
    this.pageObserver = null;
    this.contextVisualization = null;
    this.onboardingSystem = null;
    this.performanceAnalytics = null;
    this.advancedAIFeatures = null;
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
      // Initialize floating Eruda button first (independent of Eruda loading)
      await this.initializeFloatingButton();
      
      // Load Eruda
      await this.loadEruda();
      
      // Inject page monitoring script
      await this.injectPageMonitoring();
      
      // Initialize RAG system
      await this.initializeRAG();
      
      // Setup page monitoring
      this.setupPageMonitoring();
      
      // Setup message listeners for popup communication
      this.setupMessageListeners();
      
      // Add AI assistant panel to Eruda
      this.addAIAssistantPanel();
      
      console.log('Eruda AI Assistant initialized');
    } catch (error) {
      console.error('Failed to initialize Eruda AI Assistant:', error);
    }
  }

  async initializeFloatingButton() {
    try {
      // Load floating button script
      const script = document.createElement('script');
      script.src = chrome.runtime.getURL('eruda-floating-button.js');
      script.onload = () => {
        console.log('✅ Eruda floating button script loaded successfully');
      };
      script.onerror = (error) => {
        console.error('❌ Failed to load floating button script:', error);
      };
      document.head.appendChild(script);
      
      console.log('[Eruda AI] Floating button initialization started');
    } catch (error) {
      console.error('[Eruda AI] Failed to initialize floating button:', error);
    }
  }

  setupMessageListeners() {
    // Listen for messages from popup
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      switch (message.type) {
        case 'OPEN_ERUDA_PANEL':
          this.openErudaPanel();
          sendResponse({ success: true });
          break;
        case 'TOGGLE_ERUDA':
          this.toggleEruda();
          sendResponse({ success: true });
          break;
        case 'GET_PAGE_INFO':
          sendResponse({
            url: window.location.href,
            title: document.title,
            erudaLoaded: this.isErudaLoaded
          });
          break;
        default:
          sendResponse({ error: 'Unknown message type' });
      }
      return true; // Keep message channel open for async response
    });
  }

  openErudaPanel() {
    if (window.floatingErudaButton) {
      window.floatingErudaButton.toggleEruda();
    } else if (window.eruda) {
      window.eruda.show();
    }
  }

  toggleEruda() {
    if (window.floatingErudaButton) {
      window.floatingErudaButton.toggleEruda();
    } else if (window.eruda) {
      if (window.eruda._devTools && window.eruda._devTools.get('container').style.display === 'none') {
        window.eruda.show();
      } else {
        window.eruda.hide();
      }
    }
  }

  async loadEruda() {
    return new Promise((resolve, reject) => {
      if (window.eruda) {
        this.isErudaLoaded = true;
        resolve();
        return;
      }

      // Load Eruda from local file
      const script = document.createElement('script');
      script.src = chrome.runtime.getURL('eruda.js');
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

    // Load context manager implementation
    const contextScript = document.createElement('script');
    contextScript.src = chrome.runtime.getURL('context-manager.js');
    document.head.appendChild(contextScript);

    // Load onboarding system
    const onboardingScript = document.createElement('script');
    onboardingScript.src = chrome.runtime.getURL('onboarding.js');
    document.head.appendChild(onboardingScript);

    // Load performance analytics
    const performanceScript = document.createElement('script');
    performanceScript.src = chrome.runtime.getURL('performance-analytics.js');
    document.head.appendChild(performanceScript);

    // Load advanced AI features
    const aiFeatureScript = document.createElement('script');
    aiFeatureScript.src = chrome.runtime.getURL('ai-features.js');
    document.head.appendChild(aiFeatureScript);

    // Load model selector
    const modelSelectorScript = document.createElement('script');
    modelSelectorScript.src = chrome.runtime.getURL('model-selector.js');
    document.head.appendChild(modelSelectorScript);

    // Load cybersecurity AI
    const cybersecurityScript = document.createElement('script');
    cybersecurityScript.src = chrome.runtime.getURL('cybersecurity-ai.js');
    document.head.appendChild(cybersecurityScript);

    // Wait for scripts to load
    await Promise.all([
      new Promise(resolve => { ragScript.onload = resolve; }),
      new Promise(resolve => { contextScript.onload = resolve; }),
      new Promise(resolve => { onboardingScript.onload = resolve; }),
      new Promise(resolve => { performanceScript.onload = resolve; }),
      new Promise(resolve => { aiFeatureScript.onload = resolve; }),
      new Promise(resolve => { modelSelectorScript.onload = resolve; }),
      new Promise(resolve => { cybersecurityScript.onload = resolve; })
    ]);

    this.ragSystem = new window.VectorStore();
    this.contextManager = new window.ContextManager();
    this.onboardingSystem = new window.OnboardingSystem();
    this.performanceAnalytics = new window.PerformanceAnalytics();
    this.advancedAIFeatures = new window.AdvancedAIFeatures();
    
    // Connect the systems
    this.ragSystem.setContextManager(this.contextManager);
    
    await this.ragSystem.initialize();
    
    // Make systems globally accessible
    window.onboardingSystem = this.onboardingSystem;
    window.performanceAnalytics = this.performanceAnalytics;
    window.advancedAIFeatures = this.advancedAIFeatures;
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
    // Track context capture performance
    const startTime = performance.now();
    
    // Use the new context manager for comprehensive context capture
    if (this.contextManager) {
      this.currentContext = await this.contextManager.captureContext();
      
      // Track context capture metrics
      if (this.performanceAnalytics) {
        const contextSize = JSON.stringify(this.currentContext).length;
        this.performanceAnalytics.trackContextCapture('comprehensive', contextSize);
      }
      
      // Also add to RAG system for backward compatibility
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
      
      // Add categorized context to vector store
      for (const [category, data] of Object.entries(this.currentContext.categories)) {
        if (data && Object.keys(data).length > 0) {
          await this.ragSystem.addCategorizedDocument(
            JSON.stringify(data),
            {
              category: category,
              relevanceScore: this.currentContext.relevanceScore,
              url: window.location.href,
              title: document.title
            }
          );
        }
      }
    } else {
      // Fallback to old method
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
          <div class="ai-controls">
            <button class="refresh-context-btn" title="Refresh page context">
              🔄 Context (<span id="context-count">0</span>)
            </button>
            <button class="context-viz-btn" title="View context breakdown">
              📊 Analysis
            </button>
            <button class="help-btn" title="Help & Documentation">
              📚 Help
            </button>
            <button class="performance-btn" title="Performance Analytics">
              📈 Performance
            </button>
            <button class="ai-settings-btn" title="Settings">⚙️</button>
          </div>
        </div>
        
        <div class="ai-chat-messages" id="ai-chat-messages">
          <div class="ai-message system">
            <div class="message-content">
              Hello! I'm your AI assistant for web development and debugging. 
              I can help you analyze this page's code, debug issues, and answer questions about the current state.
              <div class="quick-actions" id="quick-actions">
                <!-- Quick actions will be dynamically generated -->
              </div>
            </div>
          </div>
        </div>
        
        <div class="ai-chat-input-container">
          <div class="ai-context-info">
            <span class="context-count">Context: <span id="context-count">0</span> chunks</span>
            <button class="refresh-context-btn" title="Refresh page context">🔄</button>
          </div>
          <div class="ai-input-wrapper">
            <div class="input-controls">
              <button class="input-control" id="clear-chat" title="Clear conversation">🗑️</button>
              <button class="input-control" id="export-chat" title="Export conversation">💾</button>
              <button class="input-control" id="copy-last" title="Copy last response">📋</button>
            </div>
            <textarea 
              id="ai-chat-input" 
              placeholder="Ask me about this page's code, DOM, network requests, or any debugging questions..."
              rows="3"
            ></textarea>
            <div class="send-controls">
              <span class="char-count" id="char-count">0/4000</span>
              <button id="ai-send-btn" class="ai-send-btn">Send</button>
            </div>
          </div>
        </div>
      </div>
    `;

    $container.html(html);
    this.setupAIEventListeners($container);
    this.loadAIStyles();
    this.updateContextCount();
    this.generateSmartQuickActions();
    
    // Check if this is the first time using the extension
    this.checkFirstTimeUser();
  }

  setupAIEventListeners($container) {
    const $input = $container.find('#ai-chat-input');
    const $sendBtn = $container.find('#ai-send-btn');
    const $settingsBtn = $container.find('.ai-settings-btn');
    const $refreshBtn = $container.find('.refresh-context-btn');
    const $contextVizBtn = $container.find('.context-viz-btn');
    const $helpBtn = $container.find('.help-btn');
    const $performanceBtn = $container.find('.performance-btn');

    $sendBtn.on('click', () => this.sendMessage());
    $input.on('keydown', (e) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        this.sendMessage();
      }
    });

    // Character counter
    $input.on('input', () => this.updateCharCount());

    // Quick action buttons
    $container.find('.quick-action').on('click', (e) => {
      const query = $(e.target).data('query');
      $input.val(query);
      this.updateCharCount();
      this.sendMessage();
    });

    // Input control buttons
    $container.find('#clear-chat').on('click', () => this.clearChat());
    $container.find('#export-chat').on('click', () => this.exportChat());
    $container.find('#copy-last').on('click', () => this.copyLastResponse());

    $settingsBtn.on('click', () => this.showSettings());
    $refreshBtn.on('click', () => this.refreshContext());
    $contextVizBtn.on('click', () => this.showContextVisualization());
    $helpBtn.on('click', () => this.showHelp());
    $performanceBtn.on('click', () => this.showPerformanceDashboard());
  }

  async sendMessage() {
    const $input = $('#ai-chat-input');
    const message = $input.val().trim();
    
    if (!message) {
      this.showInputError('Please enter a message');
      return;
    }

    if (message.length > 4000) {
      this.showInputError('Message is too long (max 4000 characters)');
      return;
    }

    // Add user message to chat
    this.addMessageToChat('user', message);
    $input.val('');
    this.clearInputError();

    // Show typing indicator
    const typingId = this.addMessageToChat('assistant', 'Thinking...', true);

    // Track AI request performance
    const performanceTracker = this.performanceAnalytics ? 
      this.performanceAnalytics.trackAIRequest('chat-request', performance.now()) : null;

    try {
      // Check if RAG system is available
      if (!this.ragSystem) {
        throw new Error('Context system not initialized');
      }

      // Get relevant context using enhanced search
      let relevantContext;
      if (this.ragSystem.searchWithCategories) {
        // Use new enhanced search with category filtering
        relevantContext = await this.ragSystem.searchWithCategories(message, {
          categories: ['JAVASCRIPT', 'HTML', 'CONSOLE', 'PERFORMANCE', 'SECURITY'],
          maxResults: 5,
          minRelevance: 0.3,
          boostRecent: true
        });
      } else {
        // Fallback to old search
        relevantContext = await this.ragSystem.search(message, 5);
      }
      
      // Build conversation context with enhanced context summary
      const messages = this.buildConversationContext(message, relevantContext);
      
      // Send to AI
      const response = await chrome.runtime.sendMessage({
        type: 'MAKE_AI_REQUEST',
        payload: { messages }
      });

      if (response && response.success) {
        const content = response.data?.content || 'No response received';
        this.updateMessage(typingId, this.formatAIResponse(content));
      } else {
        const errorMsg = response?.error || 'Unknown error occurred';
        this.updateMessage(typingId, `❌ Error: ${errorMsg}`);
      }

      // End performance tracking
      if (performanceTracker) {
        performanceTracker.end();
      }
    } catch (error) {
      console.error('AI request failed:', error);
      let errorMessage = 'Failed to get AI response';
      
      if (error.message.includes('API key')) {
        errorMessage = 'Please configure your API key in the extension settings';
      } else if (error.message.includes('network')) {
        errorMessage = 'Network error - please check your connection';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      this.updateMessage(typingId, `❌ ${errorMessage}`);
      
      // End performance tracking even on error
      if (performanceTracker) {
        performanceTracker.end();
      }
    }
  }

  showInputError(message) {
    const $input = $('#ai-chat-input');
    $input.css('border-color', '#dc3545');
    
    // Remove existing error message
    $('.input-error').remove();
    
    // Add error message
    const errorHtml = `<div class="input-error" style="color: #dc3545; font-size: 12px; margin-top: 5px;">${message}</div>`;
    $input.parent().append(errorHtml);
  }

  clearInputError() {
    const $input = $('#ai-chat-input');
    $input.css('border-color', '#ddd');
    $('.input-error').remove();
  }

  formatAIResponse(content) {
    // Basic formatting for AI responses
    if (!content) return 'No response received';
    
    // Convert markdown-style code blocks to HTML
    content = content.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');
    content = content.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Convert line breaks
    content = content.replace(/\n/g, '<br>');
    
    return content;
  }

  buildConversationContext(userMessage, relevantContext) {
    let contextSummary = '';
    
    // Handle new enhanced context format
    if (relevantContext && relevantContext.length > 0 && relevantContext[0].document) {
      // New format with categorized context
      const categoryGroups = {};
      
      for (const result of relevantContext) {
        const category = result.category;
        if (!categoryGroups[category]) {
          categoryGroups[category] = [];
        }
        categoryGroups[category].push(result);
      }
      
      for (const [category, results] of Object.entries(categoryGroups)) {
        const icon = this.ragSystem.getCategoryIcon ? this.ragSystem.getCategoryIcon(category) : '📄';
        contextSummary += `\n${icon} ${category}:\n`;
        
        for (const result of results.slice(0, 2)) { // Max 2 per category
          const content = result.document.content.substring(0, 300);
          contextSummary += `- ${content}...\n`;
        }
      }
    } else if (relevantContext && relevantContext.length > 0) {
      // Old format - fallback
      contextSummary = relevantContext.map(ctx => 
        `- ${ctx.type || 'Context'}: ${ctx.content.substring(0, 500)}...`
      ).join('\n');
    } else {
      contextSummary = 'No specific context found for this query.';
    }

    const systemPrompt = `You are an expert web development and debugging assistant integrated with Eruda DevTools. You have access to comprehensive page context including:

🏗️ HTML structure and DOM elements
🎨 CSS styles and selectors  
⚡ JavaScript code and runtime state
🌐 Network requests and responses
🐛 Console logs and error messages
📊 Performance metrics
♿ Accessibility information
🔒 Security considerations

Use this context to provide accurate, helpful responses. Be specific and reference actual code/elements when possible.

Current page: ${window.location.href}
Title: ${document.title}

Relevant context:
${contextSummary}`;

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
    
    // Scroll to bottom after updating message
    const $messages = $('#ai-chat-messages');
    $messages.scrollTop($messages[0].scrollHeight);
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
    let count = 0;
    
    if (this.contextManager) {
      const stats = this.contextManager.getStats();
      count = stats.total;
    } else if (this.ragSystem) {
      count = await this.ragSystem.getDocumentCount();
    }
    
    $('#context-count').text(count);
  }

  updateCharCount() {
    const $input = $('#ai-chat-input');
    const $charCount = $('#char-count');
    const length = $input.val().length;
    
    $charCount.text(`${length}/4000`);
    
    // Update styling based on length
    $charCount.removeClass('warning error');
    if (length > 3500) {
      $charCount.addClass('error');
    } else if (length > 3000) {
      $charCount.addClass('warning');
    }
  }

  clearChat() {
    const $messages = $('#ai-chat-messages');
    $messages.empty();
    
    // Add welcome message back
    const welcomeHtml = `
      <div class="ai-message system">
        <div class="message-content">
          Hello! I'm your AI assistant for web development and debugging. 
          I can help you analyze this page's code, debug issues, and answer questions about the current state.
          <div class="quick-actions">
            <button class="quick-action" data-query="What JavaScript frameworks are used on this page?">🔍 Detect Frameworks</button>
            <button class="quick-action" data-query="Are there any JavaScript errors on this page?">🐛 Check Errors</button>
            <button class="quick-action" data-query="How can I optimize this page's performance?">⚡ Performance Tips</button>
            <button class="quick-action" data-query="What network requests are being made?">🌐 Network Analysis</button>
          </div>
        </div>
      </div>
    `;
    $messages.append(welcomeHtml);
    
    // Re-attach quick action listeners
    $('.quick-action').on('click', (e) => {
      const query = $(e.target).data('query');
      const $input = $('#ai-chat-input');
      $input.val(query);
      this.updateCharCount();
      this.sendMessage();
    });
  }

  exportChat() {
    const $messages = $('#ai-chat-messages');
    const messages = [];
    
    $messages.find('.ai-message').each((i, el) => {
      const $el = $(el);
      const role = $el.hasClass('user') ? 'user' : 'assistant';
      const content = $el.find('.message-content').text().trim();
      
      if (content && !$el.hasClass('system')) {
        messages.push({ role, content, timestamp: new Date().toISOString() });
      }
    });
    
    const exportData = {
      url: window.location.href,
      title: document.title,
      timestamp: new Date().toISOString(),
      messages: messages
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eruda-ai-chat-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  copyLastResponse() {
    const $messages = $('#ai-chat-messages');
    const $lastAssistant = $messages.find('.ai-message:not(.user):not(.system)').last();
    
    if ($lastAssistant.length) {
      const content = $lastAssistant.find('.message-content').text().trim();
      navigator.clipboard.writeText(content).then(() => {
        // Show brief feedback
        const $feedback = $('<div class="copy-feedback">Copied!</div>');
        $feedback.css({
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: '#28a745',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '4px',
          zIndex: 10000,
          fontSize: '14px'
        });
        $('body').append($feedback);
        setTimeout(() => $feedback.remove(), 2000);
      }).catch(() => {
        console.error('Failed to copy to clipboard');
      });
    }
  }

  async showContextVisualization() {
    if (!this.contextManager) {
      this.showNotification('Context manager not available', 'error');
      return;
    }

    // Get context statistics
    const stats = this.contextManager.getStats();
    const patterns = await this.ragSystem.analyzeContextPatterns();

    // Create visualization modal
    const modalHtml = `
      <div class="context-viz-modal" id="context-viz-modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>📊 Context Analysis</h3>
            <button class="modal-close" onclick="this.closest('.context-viz-modal').remove()">×</button>
          </div>
          
          <div class="modal-body">
            <div class="context-stats">
              <div class="stat-card">
                <div class="stat-value">${stats.total}</div>
                <div class="stat-label">Total Contexts</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${stats.bookmarked}</div>
                <div class="stat-label">Bookmarked</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${stats.lastHour}</div>
                <div class="stat-label">Last Hour</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${(stats.averageRelevance * 100).toFixed(1)}%</div>
                <div class="stat-label">Avg Relevance</div>
              </div>
            </div>

            <div class="context-categories">
              <h4>📂 Categories</h4>
              <div class="category-grid">
                ${stats.categories.map(cat => `
                  <div class="category-item">
                    <div class="category-icon">${cat.icon}</div>
                    <div class="category-info">
                      <div class="category-name">${cat.name}</div>
                      <div class="category-count">${cat.count} items</div>
                    </div>
                    <div class="category-bar">
                      <div class="category-fill" style="width: ${(cat.count / stats.total * 100)}%; background-color: ${cat.color}"></div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <div class="context-patterns">
              <h4>🔍 Common Issues</h4>
              <div class="issue-list">
                ${Object.entries(patterns.commonIssues).map(([issue, count]) => `
                  <div class="issue-item">
                    <span class="issue-name">${issue}</span>
                    <span class="issue-count">${count}</span>
                  </div>
                `).join('')}
              </div>
            </div>

            <div class="context-recommendations">
              <h4>💡 Recommendations</h4>
              <div class="recommendation-list">
                ${patterns.recommendations.map(rec => `
                  <div class="recommendation-item">
                    <span class="rec-icon">💡</span>
                    <span class="rec-text">${rec}</span>
                  </div>
                `).join('')}
              </div>
            </div>

            <div class="context-actions">
              <button class="btn-secondary" onclick="window.erudaAI.exportContextData()">
                📥 Export Data
              </button>
              <button class="btn-secondary" onclick="window.erudaAI.cleanupOldContext()">
                🧹 Cleanup Old
              </button>
              <button class="btn-primary" onclick="window.erudaAI.refreshContext()">
                🔄 Refresh Context
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Add modal to page
    $('body').append(modalHtml);

    // Add modal styles
    this.addContextVizStyles();
  }

  addContextVizStyles() {
    if ($('#context-viz-styles').length) return;

    const styles = `
      <style id="context-viz-styles">
        .context-viz-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.7);
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .context-viz-modal .modal-content {
          background: white;
          border-radius: 8px;
          width: 90%;
          max-width: 800px;
          max-height: 90%;
          overflow-y: auto;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }

        .context-viz-modal .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #eee;
        }

        .context-viz-modal .modal-header h3 {
          margin: 0;
          color: #333;
        }

        .context-viz-modal .modal-close {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #999;
        }

        .context-viz-modal .modal-body {
          padding: 20px;
        }

        .context-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
          margin-bottom: 25px;
        }

        .stat-card {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 6px;
          text-align: center;
          border: 1px solid #e9ecef;
        }

        .stat-value {
          font-size: 24px;
          font-weight: bold;
          color: #007bff;
          margin-bottom: 5px;
        }

        .stat-label {
          font-size: 12px;
          color: #6c757d;
          text-transform: uppercase;
        }

        .context-categories h4,
        .context-patterns h4,
        .context-recommendations h4 {
          margin: 0 0 15px 0;
          color: #333;
          font-size: 16px;
        }

        .category-grid {
          display: grid;
          gap: 10px;
          margin-bottom: 25px;
        }

        .category-item {
          display: grid;
          grid-template-columns: 40px 1fr 100px;
          align-items: center;
          gap: 10px;
          padding: 10px;
          background: #f8f9fa;
          border-radius: 6px;
        }

        .category-icon {
          font-size: 20px;
          text-align: center;
        }

        .category-name {
          font-weight: 500;
          color: #333;
        }

        .category-count {
          font-size: 12px;
          color: #6c757d;
        }

        .category-bar {
          background: #e9ecef;
          height: 6px;
          border-radius: 3px;
          overflow: hidden;
        }

        .category-fill {
          height: 100%;
          transition: width 0.3s ease;
        }

        .issue-list,
        .recommendation-list {
          margin-bottom: 25px;
        }

        .issue-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 12px;
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 4px;
          margin-bottom: 5px;
        }

        .issue-count {
          background: #fd7e14;
          color: white;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
        }

        .recommendation-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px;
          background: #d1ecf1;
          border: 1px solid #bee5eb;
          border-radius: 4px;
          margin-bottom: 5px;
        }

        .rec-icon {
          font-size: 16px;
        }

        .context-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #eee;
        }

        .btn-primary,
        .btn-secondary {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s ease;
        }

        .btn-primary {
          background: #007bff;
          color: white;
        }

        .btn-primary:hover {
          background: #0056b3;
        }

        .btn-secondary {
          background: #6c757d;
          color: white;
        }

        .btn-secondary:hover {
          background: #545b62;
        }
      </style>
    `;

    $('head').append(styles);
  }

  addPerformanceDashboardStyles() {
    if ($('#performance-dashboard-styles').length) return;

    const styles = `
      <style id="performance-dashboard-styles">
        .performance-dashboard-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.7);
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .performance-dashboard-modal .modal-content {
          background: white;
          border-radius: 8px;
          width: 95%;
          max-width: 1000px;
          height: 85%;
          max-height: 700px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }

        .performance-dashboard-modal .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #eee;
        }

        .performance-dashboard-modal .modal-body {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
        }

        .performance-summary {
          margin-bottom: 25px;
        }

        .summary-card {
          background: #f8f9fa;
          border-radius: 6px;
          padding: 20px;
          border: 1px solid #e9ecef;
        }

        .card-title {
          font-size: 16px;
          font-weight: 600;
          color: #333;
          margin-bottom: 15px;
        }

        .summary-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
        }

        .stat-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .stat-label {
          color: #666;
          font-size: 14px;
        }

        .stat-value {
          font-weight: 600;
          color: #333;
        }

        .stat-value.error {
          color: #dc3545;
        }

        .performance-tabs {
          margin-bottom: 25px;
        }

        .tab-nav {
          display: flex;
          border-bottom: 2px solid #e9ecef;
          margin-bottom: 20px;
        }

        .tab-btn {
          padding: 12px 20px;
          border: none;
          background: none;
          cursor: pointer;
          color: #666;
          font-size: 14px;
          border-bottom: 2px solid transparent;
          transition: all 0.2s ease;
        }

        .tab-btn:hover {
          color: #007bff;
        }

        .tab-btn.active {
          color: #007bff;
          border-bottom-color: #007bff;
        }

        .tab-panel {
          display: none;
        }

        .tab-panel.active {
          display: block;
        }

        .performance-metrics,
        .ai-metrics {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }

        .metric-card {
          background: #f8f9fa;
          border-radius: 6px;
          padding: 15px;
          text-align: center;
          border: 1px solid #e9ecef;
        }

        .metric-title {
          font-size: 12px;
          color: #666;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .metric-value {
          font-size: 20px;
          font-weight: bold;
          color: #333;
        }

        .metric-value.score-excellent {
          color: #28a745;
        }

        .metric-value.score-good {
          color: #17a2b8;
        }

        .metric-value.score-fair {
          color: #ffc107;
        }

        .metric-value.score-poor {
          color: #dc3545;
        }

        .metric-value.warning {
          color: #fd7e14;
        }

        .issues-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .issue-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: 6px;
          border-left: 4px solid;
        }

        .issue-item.severity-high {
          background: #f8d7da;
          border-left-color: #dc3545;
        }

        .issue-item.severity-medium {
          background: #fff3cd;
          border-left-color: #ffc107;
        }

        .issue-item.severity-low {
          background: #d1ecf1;
          border-left-color: #17a2b8;
        }

        .issue-icon {
          font-size: 20px;
        }

        .issue-content {
          flex: 1;
        }

        .issue-message {
          font-weight: 500;
          color: #333;
          margin-bottom: 4px;
        }

        .issue-value {
          font-size: 12px;
          color: #666;
        }

        .no-issues,
        .no-recommendations,
        .no-data {
          text-align: center;
          padding: 40px;
          color: #666;
          font-style: italic;
        }

        .recommendations-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .recommendation-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px;
          background: #d1ecf1;
          border: 1px solid #bee5eb;
          border-radius: 6px;
        }

        .rec-icon {
          font-size: 16px;
        }

        .performance-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #eee;
        }
      </style>
    `;

    $('head').append(styles);
  }

  async exportContextData() {
    if (!this.ragSystem) return;

    const data = await this.ragSystem.exportContextData({
      includeEmbeddings: false,
      categories: ['JAVASCRIPT', 'HTML', 'CONSOLE', 'PERFORMANCE', 'SECURITY']
    });

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eruda-context-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    this.showNotification('Context data exported successfully', 'success');
  }

  async cleanupOldContext() {
    if (!this.ragSystem) return;

    const cleaned = await this.ragSystem.cleanupOldContext();
    this.showNotification(`Cleaned up ${cleaned} old context items`, 'success');
    
    // Update context count
    this.updateContextCount();
  }

  showNotification(message, type = 'info') {
    const $notification = $(`
      <div class="eruda-notification ${type}">
        ${message}
      </div>
    `);

    $notification.css({
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007bff',
      color: 'white',
      padding: '12px 20px',
      borderRadius: '4px',
      zIndex: 10001,
      fontSize: '14px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
    });

    $('body').append($notification);
    setTimeout(() => $notification.remove(), 3000);
  }

  async checkFirstTimeUser() {
    if (this.onboardingSystem) {
      const isFirstTime = await this.onboardingSystem.checkFirstTime();
      if (isFirstTime) {
        // Wait a bit for the interface to be fully loaded
        setTimeout(() => {
          this.onboardingSystem.startOnboarding();
        }, 1000);
      }
    }
  }

  showHelp() {
    if (this.onboardingSystem) {
      this.onboardingSystem.showHelp();
    } else {
      this.showNotification('Help system not available', 'error');
    }
  }

  async showPerformanceDashboard() {
    if (!this.performanceAnalytics) {
      this.showNotification('Performance analytics not available', 'error');
      return;
    }

    const report = this.performanceAnalytics.generateReport();
    const analytics = await this.performanceAnalytics.getAnalytics();

    // Create performance dashboard modal
    const modalHtml = `
      <div class="performance-dashboard-modal" id="performance-dashboard-modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>📈 Performance Analytics</h3>
            <button class="modal-close" onclick="this.closest('.performance-dashboard-modal').remove()">×</button>
          </div>
          
          <div class="modal-body">
            <div class="performance-summary">
              <div class="summary-card">
                <div class="card-title">Session Overview</div>
                <div class="summary-stats">
                  <div class="stat-item">
                    <span class="stat-label">Duration:</span>
                    <span class="stat-value">${Math.round(report.summary.sessionDuration)}s</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">AI Requests:</span>
                    <span class="stat-value">${report.summary.totalAIRequests}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Context Captures:</span>
                    <span class="stat-value">${report.summary.totalContextCaptures}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Errors:</span>
                    <span class="stat-value ${report.summary.totalErrors > 0 ? 'error' : ''}">${report.summary.totalErrors}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="performance-tabs">
              <div class="tab-nav">
                <button class="tab-btn active" data-tab="page">Page Performance</button>
                <button class="tab-btn" data-tab="ai">AI Performance</button>
                <button class="tab-btn" data-tab="issues">Issues</button>
                <button class="tab-btn" data-tab="recommendations">Recommendations</button>
              </div>

              <div class="tab-content">
                <div class="tab-panel active" id="tab-page">
                  <div class="performance-metrics">
                    <div class="metric-card">
                      <div class="metric-title">Performance Score</div>
                      <div class="metric-value score-${this.getScoreClass(report.pagePerformance.performanceScore)}">
                        ${report.pagePerformance.performanceScore}/100
                      </div>
                    </div>
                    <div class="metric-card">
                      <div class="metric-title">Load Time</div>
                      <div class="metric-value">${Math.round(report.pagePerformance.loadTime || 0)}ms</div>
                    </div>
                    <div class="metric-card">
                      <div class="metric-title">First Contentful Paint</div>
                      <div class="metric-value">${Math.round(report.pagePerformance.firstContentfulPaint || 0)}ms</div>
                    </div>
                    <div class="metric-card">
                      <div class="metric-title">Memory Usage</div>
                      <div class="metric-value">${this.formatMemory(report.pagePerformance.memoryUsage)}</div>
                    </div>
                  </div>
                </div>

                <div class="tab-panel" id="tab-ai">
                  ${this.renderAIPerformanceTab(report.aiPerformance)}
                </div>

                <div class="tab-panel" id="tab-issues">
                  <div class="issues-list">
                    ${report.issues.length > 0 ? report.issues.map(issue => `
                      <div class="issue-item severity-${issue.severity}">
                        <div class="issue-icon">${this.getIssueIcon(issue.type)}</div>
                        <div class="issue-content">
                          <div class="issue-message">${issue.message}</div>
                          <div class="issue-value">Value: ${issue.value}</div>
                        </div>
                      </div>
                    `).join('') : '<div class="no-issues">🎉 No performance issues detected!</div>'}
                  </div>
                </div>

                <div class="tab-panel" id="tab-recommendations">
                  <div class="recommendations-list">
                    ${report.recommendations.length > 0 ? report.recommendations.map(rec => `
                      <div class="recommendation-item">
                        <span class="rec-icon">💡</span>
                        <span class="rec-text">${rec}</span>
                      </div>
                    `).join('') : '<div class="no-recommendations">✅ No specific recommendations at this time.</div>'}
                  </div>
                </div>
              </div>
            </div>

            <div class="performance-actions">
              <button class="btn-secondary" onclick="window.erudaAI.exportPerformanceData()">
                📥 Export Data
              </button>
              <button class="btn-secondary" onclick="window.erudaAI.clearPerformanceData()">
                🧹 Clear Data
              </button>
              <button class="btn-primary" onclick="window.erudaAI.refreshPerformanceData()">
                🔄 Refresh
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Add modal to page
    $('body').append(modalHtml);

    // Add modal styles and setup tabs
    this.addPerformanceDashboardStyles();
    this.setupPerformanceTabs();
  }

  renderAIPerformanceTab(aiPerformance) {
    if (aiPerformance.message) {
      return `<div class="no-data">${aiPerformance.message}</div>`;
    }

    return `
      <div class="ai-metrics">
        <div class="metric-card">
          <div class="metric-title">Total Requests</div>
          <div class="metric-value">${aiPerformance.totalRequests}</div>
        </div>
        <div class="metric-card">
          <div class="metric-title">Average Response Time</div>
          <div class="metric-value">${Math.round(aiPerformance.averageResponseTime)}ms</div>
        </div>
        <div class="metric-card">
          <div class="metric-title">Requests/Minute</div>
          <div class="metric-value">${aiPerformance.requestsPerMinute}</div>
        </div>
        <div class="metric-card">
          <div class="metric-title">Slow Requests</div>
          <div class="metric-value ${aiPerformance.slowRequests > 0 ? 'warning' : ''}">${aiPerformance.slowRequests}</div>
        </div>
      </div>
    `;
  }

  getScoreClass(score) {
    if (score >= 90) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 50) return 'fair';
    return 'poor';
  }

  formatMemory(memoryUsage) {
    if (!memoryUsage) return 'N/A';
    const mb = Math.round(memoryUsage.used / 1024 / 1024);
    return `${mb}MB (${Math.round(memoryUsage.percentage)}%)`;
  }

  getIssueIcon(type) {
    const icons = {
      performance: '⚡',
      memory: '🧠',
      errors: '🐛',
      'ai-performance': '🤖'
    };
    return icons[type] || '⚠️';
  }

  setupPerformanceTabs() {
    const tabBtns = document.querySelectorAll('.performance-dashboard-modal .tab-btn');
    const tabPanels = document.querySelectorAll('.performance-dashboard-modal .tab-panel');

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tabId = btn.dataset.tab;
        
        // Update active states
        tabBtns.forEach(b => b.classList.remove('active'));
        tabPanels.forEach(p => p.classList.remove('active'));
        
        btn.classList.add('active');
        document.getElementById(`tab-${tabId}`).classList.add('active');
      });
    });
  }

  async exportPerformanceData() {
    if (!this.performanceAnalytics) return;

    const data = await this.performanceAnalytics.exportAnalytics();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eruda-performance-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    this.showNotification('Performance data exported successfully', 'success');
  }

  async clearPerformanceData() {
    if (!this.performanceAnalytics) return;

    await this.performanceAnalytics.clearAnalytics();
    this.showNotification('Performance data cleared', 'success');
    
    // Close and reopen dashboard to show updated data
    document.getElementById('performance-dashboard-modal')?.remove();
    setTimeout(() => this.showPerformanceDashboard(), 100);
  }

  async refreshPerformanceData() {
    // Close and reopen dashboard to show updated data
    document.getElementById('performance-dashboard-modal')?.remove();
    setTimeout(() => this.showPerformanceDashboard(), 100);
  }

  async generateSmartQuickActions() {
    const quickActionsContainer = document.getElementById('quick-actions');
    if (!quickActionsContainer) return;

    let actions = [];

    // Get context-based suggestions if available
    if (this.advancedAIFeatures && this.currentContext) {
      try {
        const suggestions = await this.advancedAIFeatures.generateSuggestions(this.currentContext);
        actions = suggestions.slice(0, 4); // Limit to 4 suggestions
      } catch (error) {
        console.warn('Could not generate smart suggestions:', error);
      }
    }

    // Fallback to default actions if no smart suggestions
    if (actions.length === 0) {
      actions = [
        {
          type: 'debug',
          title: '🐛 Debug Issues',
          description: 'Find and fix JavaScript errors',
          action: 'debug',
          priority: 'medium'
        },
        {
          type: 'performance',
          title: '⚡ Performance',
          description: 'Analyze page performance',
          action: 'performance',
          priority: 'medium'
        },
        {
          type: 'security',
          title: '🔒 Security Scan',
          description: 'Comprehensive cybersecurity analysis',
          action: 'cybersecurity-scan',
          priority: 'high'
        },
        {
          type: 'malware',
          title: '🦠 Malware Check',
          description: 'Detect malicious code and threats',
          action: 'malware-detection',
          priority: 'high'
        },
        {
          type: 'privacy',
          title: '🔐 Privacy Audit',
          description: 'GDPR/CCPA compliance check',
          action: 'privacy-compliance',
          priority: 'medium'
        },
        {
          type: 'pentest',
          title: '🎯 Pentest Plan',
          description: 'Generate penetration testing strategy',
          action: 'pentest-planning',
          priority: 'medium'
        }
      ];
    }

    // Generate HTML for quick actions
    const actionsHtml = actions.map(action => `
      <button class="quick-action" data-template="${action.action}" data-type="${action.type}" title="${action.description}">
        ${action.title}
      </button>
    `).join('');

    quickActionsContainer.innerHTML = actionsHtml;

    // Add event listeners for quick actions
    quickActionsContainer.querySelectorAll('.quick-action').forEach(button => {
      button.addEventListener('click', (e) => {
        const template = e.target.dataset.template;
        const type = e.target.dataset.type;
        this.executeQuickAction(template, type);
      });
    });
  }

  async executeQuickAction(templateId, type) {
    // Handle cybersecurity-specific actions
    if (templateId.includes('cybersecurity') || templateId.includes('malware') || 
        templateId.includes('privacy') || templateId.includes('pentest')) {
      await this.executeCybersecurityAction(templateId, type);
      return;
    }

    if (!this.advancedAIFeatures) {
      // Fallback to simple queries
      const queries = {
        debug: 'Are there any JavaScript errors on this page? Please analyze and provide solutions.',
        performance: 'How can I optimize this page\'s performance? Please analyze load times and suggest improvements.',
        accessibility: 'Please check this page for accessibility issues and suggest improvements.',
        security: 'Please review this page for security vulnerabilities and provide recommendations.'
      };

      const query = queries[templateId] || queries.debug;
      $('#ai-chat-input').val(query);
      this.sendMessage();
      return;
    }

    try {
      // Get the prompt template
      const template = this.advancedAIFeatures.getPromptTemplate(templateId);
      if (!template) {
        throw new Error(`Template ${templateId} not found`);
      }

      // Prepare context variables
      const variables = {
        context: this.currentContext ? JSON.stringify(this.currentContext, null, 2) : 'No context available',
        userInput: `Please perform a ${type} analysis of this page`,
        performanceData: this.performanceAnalytics ? 
          JSON.stringify(await this.performanceAnalytics.getAnalytics(), null, 2) : 
          'No performance data available'
      };

      // Process the template
      const processedPrompt = this.advancedAIFeatures.processTemplate(templateId, variables);

      // Set the processed prompt in the input and send
      $('#ai-chat-input').val(processedPrompt);
      this.sendMessage();

    } catch (error) {
      console.error('Failed to execute quick action:', error);
      this.showNotification('Failed to execute quick action', 'error');
    }
  }

  async executeCybersecurityAction(templateId, type) {
    try {
      // Show loading indicator
      this.showNotification('Running cybersecurity analysis...', 'info');

      // Get current context
      const context = this.currentContext || await this.captureContext();

      let result;
      let analysisType;

      // Execute the appropriate cybersecurity analysis
      switch (templateId) {
        case 'cybersecurity-scan':
          if (window.SpecializedAITools) {
            const tools = new window.SpecializedAITools();
            result = await tools.runTool('security-analyzer', 'runCybersecurityScan', context);
            analysisType = 'Comprehensive Security Scan';
          }
          break;

        case 'malware-detection':
          if (window.SpecializedAITools) {
            const tools = new window.SpecializedAITools();
            result = await tools.runTool('security-analyzer', 'detectMalware', context);
            analysisType = 'Malware Detection';
          }
          break;

        case 'privacy-compliance':
          if (window.SpecializedAITools) {
            const tools = new window.SpecializedAITools();
            result = await tools.runTool('security-analyzer', 'auditPrivacyCompliance', context);
            analysisType = 'Privacy Compliance Audit';
          }
          break;

        case 'pentest-planning':
          if (window.SpecializedAITools) {
            const tools = new window.SpecializedAITools();
            result = await tools.runTool('security-analyzer', 'generatePentestPlan', context);
            analysisType = 'Penetration Testing Plan';
          }
          break;

        default:
          throw new Error(`Unknown cybersecurity action: ${templateId}`);
      }

      if (result) {
        // Format and display the results
        const formattedResult = this.formatCybersecurityResult(result, analysisType);
        this.displayCybersecurityResults(formattedResult, analysisType);
      } else {
        throw new Error('No result from cybersecurity analysis');
      }

    } catch (error) {
      console.error('Cybersecurity action failed:', error);
      this.showNotification(`Cybersecurity analysis failed: ${error.message}`, 'error');
      
      // Fallback to AI chat with security prompt
      const fallbackPrompt = this.getCybersecurityFallbackPrompt(templateId, type);
      $('#ai-chat-input').val(fallbackPrompt);
      this.sendMessage();
    }
  }

  formatCybersecurityResult(result, analysisType) {
    let formatted = `## ${analysisType} Results\n\n`;

    // Add status
    formatted += `**Status:** ${result.status}\n\n`;

    // Add risk score if available
    if (result.overallRiskScore !== undefined) {
      const riskLevel = result.overallRiskScore > 70 ? 'HIGH' : 
                       result.overallRiskScore > 40 ? 'MEDIUM' : 'LOW';
      formatted += `**Risk Score:** ${result.overallRiskScore}/100 (${riskLevel})\n\n`;
    }

    // Add critical issues
    if (result.criticalIssues && result.criticalIssues.length > 0) {
      formatted += `### 🚨 Critical Issues (${result.criticalIssues.length})\n`;
      result.criticalIssues.forEach((issue, index) => {
        formatted += `${index + 1}. **${issue.name}**: ${issue.description}\n`;
      });
      formatted += '\n';
    }

    // Add vulnerabilities
    if (result.vulnerabilities && result.vulnerabilities.length > 0) {
      formatted += `### 🛡️ Vulnerabilities Found (${result.vulnerabilities.length})\n`;
      result.vulnerabilities.forEach((vuln, index) => {
        formatted += `${index + 1}. **${vuln.name}** (${vuln.severity})\n`;
        formatted += `   - ${vuln.description}\n`;
      });
      formatted += '\n';
    }

    // Add malware findings
    if (result.malwareFindings && result.malwareFindings.length > 0) {
      formatted += `### 🦠 Malware Detected (${result.malwareFindings.length})\n`;
      result.malwareFindings.forEach((finding, index) => {
        formatted += `${index + 1}. **${finding.type}** (${finding.severity})\n`;
        formatted += `   - ${finding.description}\n`;
      });
      formatted += '\n';
    }

    // Add privacy compliance issues
    if (result.gdprCompliance && result.gdprCompliance.issues) {
      formatted += `### 🔐 Privacy Compliance Issues (${result.gdprCompliance.issues.length})\n`;
      result.gdprCompliance.issues.forEach((issue, index) => {
        formatted += `${index + 1}. **${issue.type}** (${issue.severity})\n`;
        formatted += `   - ${issue.description}\n`;
      });
      formatted += '\n';
    }

    // Add test cases for pentest planning
    if (result.testCases && result.testCases.length > 0) {
      formatted += `### 🎯 Recommended Test Cases\n`;
      result.testCases.forEach((category, index) => {
        formatted += `**${category.category}** (Priority: ${category.priority})\n`;
        category.tests.forEach(test => {
          formatted += `- ${test}\n`;
        });
        formatted += '\n';
      });
    }

    // Add recommendations
    if (result.recommendations && result.recommendations.length > 0) {
      formatted += `### 💡 Recommendations\n`;
      result.recommendations.forEach((rec, index) => {
        formatted += `${index + 1}. ${rec}\n`;
      });
      formatted += '\n';
    }

    return formatted;
  }

  displayCybersecurityResults(formattedResult, analysisType) {
    // Add the results as an AI message in the chat
    const $chatMessages = $('#ai-chat-messages');
    const messageHtml = `
      <div class="message ai-message">
        <div class="message-header">
          <span class="message-sender">🔒 Cybersecurity AI</span>
          <span class="message-time">${new Date().toLocaleTimeString()}</span>
        </div>
        <div class="message-content">
          <div class="cybersecurity-results">
            ${this.markdownToHtml(formattedResult)}
          </div>
        </div>
      </div>
    `;

    $chatMessages.append(messageHtml);
    $chatMessages.scrollTop($chatMessages[0].scrollHeight);

    // Show success notification
    this.showNotification(`${analysisType} completed successfully`, 'success');
  }

  getCybersecurityFallbackPrompt(templateId, type) {
    const prompts = {
      'cybersecurity-scan': 'Please perform a comprehensive cybersecurity analysis of this webpage. Check for OWASP Top 10 vulnerabilities, malware, network security issues, and privacy compliance. Provide detailed findings and recommendations.',
      'malware-detection': 'Please scan this webpage for malicious code, cryptojacking scripts, phishing attempts, and data exfiltration patterns. Analyze JavaScript behavior and identify potential threats.',
      'privacy-compliance': 'Please audit this webpage for GDPR and CCPA compliance. Check cookie usage, data collection practices, consent mechanisms, and privacy policy compliance. Provide improvement recommendations.',
      'pentest-planning': 'Please generate a penetration testing plan for this webpage. Identify attack vectors, suggest test cases, analyze security controls, and provide a prioritized testing strategy.'
    };

    return prompts[templateId] || 'Please perform a security analysis of this webpage and provide recommendations.';
  }

  markdownToHtml(markdown) {
    // Simple markdown to HTML conversion
    return markdown
      .replace(/### (.*)/g, '<h3>$1</h3>')
      .replace(/## (.*)/g, '<h2>$1</h2>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>')
      .replace(/- (.*?)(<br>|$)/g, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>');
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
          flex-direction: column;
          padding: 10px;
          gap: 8px;
        }

        .input-controls {
          display: flex;
          gap: 5px;
          justify-content: flex-start;
        }

        .input-control {
          background: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 4px;
          padding: 6px 8px;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.2s ease;
        }

        .input-control:hover {
          background: #e9ecef;
          border-color: #adb5bd;
        }

        .send-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
        }

        .char-count {
          font-size: 11px;
          color: #6c757d;
          min-width: 60px;
        }

        .char-count.warning {
          color: #fd7e14;
        }

        .char-count.error {
          color: #dc3545;
        }

        .quick-actions {
          margin-top: 15px;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .quick-action {
          background: #e3f2fd;
          border: 1px solid #90caf9;
          border-radius: 16px;
          padding: 6px 12px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #1565c0;
        }

        .quick-action:hover {
          background: #bbdefb;
          border-color: #64b5f6;
          transform: translateY(-1px);
        }

        .cybersecurity-results {
          background: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 6px;
          padding: 15px;
          margin: 10px 0;
        }

        .cybersecurity-results h2 {
          color: #dc3545;
          margin: 0 0 10px 0;
          font-size: 16px;
          font-weight: bold;
        }

        .cybersecurity-results h3 {
          color: #495057;
          margin: 15px 0 8px 0;
          font-size: 14px;
          font-weight: bold;
        }

        .cybersecurity-results strong {
          color: #212529;
          font-weight: 600;
        }

        .cybersecurity-results ul {
          margin: 8px 0;
          padding-left: 20px;
        }

        .cybersecurity-results li {
          margin: 4px 0;
          color: #495057;
        }

        .quick-action[data-type="security"],
        .quick-action[data-type="malware"] {
          background: linear-gradient(135deg, #dc3545, #c82333);
          color: white;
          border: none;
        }

        .quick-action[data-type="security"]:hover,
        .quick-action[data-type="malware"]:hover {
          background: linear-gradient(135deg, #c82333, #bd2130);
          transform: translateY(-2px);
        }

        .quick-action[data-type="privacy"] {
          background: linear-gradient(135deg, #6f42c1, #5a32a3);
          color: white;
          border: none;
        }

        .quick-action[data-type="privacy"]:hover {
          background: linear-gradient(135deg, #5a32a3, #4e2a8e);
          transform: translateY(-2px);
        }

        .quick-action[data-type="pentest"] {
          background: linear-gradient(135deg, #fd7e14, #e8690b);
          color: white;
          border: none;
        }

        .quick-action[data-type="pentest"]:hover {
          background: linear-gradient(135deg, #e8690b, #d35400);
          transform: translateY(-2px);
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
const erudaAI = new ErudaAIContent();

// Make it globally accessible for modal actions
window.erudaAI = erudaAI;