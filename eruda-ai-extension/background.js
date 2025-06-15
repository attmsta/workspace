// Background service worker for Eruda AI Assistant
class BackgroundService {
  constructor() {
    this.setupEventListeners();
    this.networkRequests = new Map();
    this.ragWorker = null;
    this.ragWorkerRequests = {}; // To store promises for pending RAG worker requests
    this.ragWorkerRequestId = 0; // Simple ID generator
  }

  initializeRAGWorkerIfNotReady() {
    if (!this.ragWorker) {
      console.log('Initializing RAG Worker...');
      this.ragWorker = new Worker(chrome.runtime.getURL('rag-worker.js'));

      this.ragWorker.onmessage = (event) => {
        const { id, result } = event.data;
        if (this.ragWorkerRequests[id]) {
          this.ragWorkerRequests[id].resolve(result);
          delete this.ragWorkerRequests[id];
        } else {
          console.warn('Received RAG worker message for unknown request ID:', id, result);
        }
      };

      this.ragWorker.onerror = (error) => {
        console.error('RAG Worker error:', error);
        // Potentially reject all pending requests or handle errors more gracefully
        Object.values(this.ragWorkerRequests).forEach(req => {
            req.reject(new Error('RAG Worker global error: ' + error.message));
        });
        this.ragWorkerRequests = {};
        this.ragWorker = null; // Consider re-initializing or marking as errored
      };
      // Initialize the worker itself
      this.postMessageToRAGWorker({ method: 'initialize' })
        .then(response => console.log('RAG Worker initialization response:', response))
        .catch(error => console.error('Failed to send initialize message to RAG worker:', error));
    }
  }

  postMessageToRAGWorker(messagePayload) {
    this.initializeRAGWorkerIfNotReady();

    const uniqueId = `ragReq_${this.ragWorkerRequestId++}`;

    const promise = new Promise((resolve, reject) => {
      this.ragWorkerRequests[uniqueId] = { resolve, reject };
    });

    this.ragWorker.postMessage({ id: uniqueId, ...messagePayload });
    return promise;
  }

  setupEventListeners() {
    // Handle extension installation
    chrome.runtime.onInstalled.addListener(() => {
      console.log('Eruda AI Assistant installed');
    });

    // Handle messages from content scripts
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true; // Keep message channel open for async responses
    });

    // Monitor network requests
    chrome.webRequest.onBeforeRequest.addListener(
      (details) => this.captureNetworkRequest(details),
      { urls: ["<all_urls>"] },
      ["requestBody"]
    );

    chrome.webRequest.onCompleted.addListener(
      (details) => this.captureNetworkResponse(details),
      { urls: ["<all_urls>"] },
      ["responseHeaders"]
    );

    // Handle tab updates
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete' && tab.url) {
        this.onTabComplete(tabId, tab);
      }
    });
  }

  async handleMessage(message, sender, sendResponse) {
    try {
      switch (message.type) {
        case 'GET_NETWORK_DATA':
          sendResponse({ 
            success: true, 
            data: Array.from(this.networkRequests.values()) 
          });
          break;

        case 'MAKE_AI_REQUEST':
          const response = await this.makeAIRequest(message.payload);
          sendResponse({ success: true, data: response });
          break;

        case 'STORE_PAGE_CONTEXT':
          await this.storePageContext(message.payload, sender.tab.id);
          sendResponse({ success: true });
          break;

        case 'GET_SETTINGS':
          const settings = await this.getSettings();
          sendResponse({ success: true, data: settings });
          break;

        case 'SAVE_SETTINGS':
          await this.saveSettings(message.payload);
          sendResponse({ success: true });
          break;

        case 'CLEAR_CONTEXT':
          await this.clearAllContext();
          sendResponse({ success: true });
          break;

        case 'EXPORT_CONTEXT':
          const contextData = await this.exportContext(sender.tab?.id);
          sendResponse({ success: true, data: contextData });
          break;

        case 'GET_CONTEXT_STATS':
          const stats = await this.getContextStats(sender.tab?.id);
          sendResponse({ success: true, data: stats });
          break;

        case 'OPEN_SETTINGS':
          chrome.runtime.openOptionsPage();
          sendResponse({ success: true });
          break;

        case 'CHECK_EMBEDDING_SERVICE_STATUS':
          const status = await this.checkEmbeddingServiceStatus();
          sendResponse({ success: true, data: status });
          break;

        case 'GET_RAG_WORKER_STATISTICS':
          try {
            const stats = await this.postMessageToRAGWorker({ method: 'getStatistics' });
            sendResponse({ success: true, data: stats });
          } catch (e) {
            sendResponse({ success: false, error: e.message });
          }
          break;

        case 'GET_RAG_WORKER_LAST_ERROR':
          try {
            const lastError = await this.postMessageToRAGWorker({ method: 'getLastError' });
            sendResponse({ success: true, data: lastError });
          } catch (e) {
            sendResponse({ success: false, error: e.message });
          }
          break;

        case 'CLEAR_RAG_WORKER_LAST_ERROR':
          try {
            await this.postMessageToRAGWorker({ method: 'clearLastError' });
            sendResponse({ success: true });
          } catch (e) {
            sendResponse({ success: false, error: e.message });
          }
          break;

        default:
          sendResponse({ success: false, error: 'Unknown message type' });
      }
    } catch (error) {
      console.error('Background script error:', error);
      sendResponse({ success: false, error: error.message });
    }
  }

  captureNetworkRequest(details) {
    this.networkRequests.set(details.requestId, {
      id: details.requestId,
      url: details.url,
      method: details.method,
      timestamp: Date.now(),
      requestBody: details.requestBody,
      tabId: details.tabId
    });
  }

  captureNetworkResponse(details) {
    const request = this.networkRequests.get(details.requestId);
    if (request) {
      request.statusCode = details.statusCode;
      request.responseHeaders = details.responseHeaders;
      request.completedAt = Date.now();
    }
  }

  async onTabComplete(tabId, tab) {
    // Inject Eruda and our scripts when tab loads
    try {
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ['content.js']
      });
    } catch (error) {
      console.error('Failed to inject content script:', error);
    }
  }

  async makeAIRequest(payload) {
    const settings = await this.getSettings();
    const { provider, apiKey, model } = settings;

    if (!apiKey) {
      throw new Error('API key is missing. Please configure it in the extension settings.');
    }

    const requestConfig = await this.buildAIRequestConfig(provider, model, payload);
    
    try {
      const response = await fetch(requestConfig.url, {
        method: 'POST',
        headers: requestConfig.headers,
        body: JSON.stringify(requestConfig.body)
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('AI API request failed: Unauthorized. Please check your API key.');
        } else if (response.status === 429) {
          throw new Error('AI API request failed: Rate limit exceeded. Please try again later.');
        } else {
          throw new Error(`AI API request failed: ${response.statusText}`);
        }
      }

      const data = await response.json();
      return this.parseAIResponse(provider, data);
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('AI API request failed: Network error. Please check your internet connection.');
      }
      throw error; // Re-throw other errors
    }
  }

  async buildAIRequestConfig(provider, model, payload) {
    const settings = await this.getSettings();
    
    switch (provider) {
      case 'openai':
        return {
          url: 'https://api.openai.com/v1/chat/completions',
          headers: {
            'Authorization': `Bearer ${settings.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: {
            model: model || 'gpt-4',
            messages: payload.messages,
            temperature: settings.temperature || 0.7,
            max_tokens: settings.maxTokens || 2000
          }
        };

      case 'anthropic':
        return {
          url: 'https://api.anthropic.com/v1/messages',
          headers: {
            'x-api-key': settings.apiKey,
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01'
          },
          body: {
            model: model || 'claude-3-sonnet-20240229',
            messages: payload.messages,
            max_tokens: settings.maxTokens || 2000
          }
        };

      case 'openrouter':
        return {
          url: 'https://openrouter.ai/api/v1/chat/completions',
          headers: {
            'Authorization': `Bearer ${settings.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': chrome.runtime.getURL(''),
            'X-Title': 'Eruda AI Assistant'
          },
          body: {
            model: model || 'anthropic/claude-3-sonnet',
            messages: payload.messages,
            temperature: settings.temperature || 0.7,
            max_tokens: settings.maxTokens || 2000
          }
        };

      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  parseAIResponse(provider, data) {
    switch (provider) {
      case 'openai':
      case 'openrouter':
        return {
          content: data.choices[0]?.message?.content || '',
          usage: data.usage
        };

      case 'anthropic':
        return {
          content: data.content[0]?.text || '',
          usage: data.usage
        };

      default:
        throw new Error(`Unknown provider response format: ${provider}`);
    }
  }

  async getSettings() {
    const result = await chrome.storage.sync.get({
      provider: 'openai',
      apiKey: '',
      model: '',
      ragEnabled: true,
      maxContextChunks: 10,
      temperature: 0.7,
      maxTokens: 2000,
      autoContext: true,
      debugMode: false
    });
    return result;
  }

  async saveSettings(settings) {
    await chrome.storage.sync.set(settings);
  }

  async getProviderSettings(provider) {
    const settings = await this.getSettings();
    return {
      apiKey: settings.apiKey,
      model: settings.model
    };
  }

  async storePageContext(context, tabId) {
    // Store page context for RAG system
    const key = `context_${tabId}_${Date.now()}`;
    await chrome.storage.local.set({
      [key]: {
        ...context,
        timestamp: Date.now(),
        tabId
      }
    });

    // Clean up old contexts (keep last 100 per tab)
    this.cleanupOldContexts(tabId);
  }

  async cleanupOldContexts(tabId) {
    const allData = await chrome.storage.local.get();
    const contextKeys = Object.keys(allData)
      .filter(key => key.startsWith(`context_${tabId}_`))
      .sort()
      .reverse();

    if (contextKeys.length > 100) {
      const keysToRemove = contextKeys.slice(100);
      for (const key of keysToRemove) {
        await chrome.storage.local.remove(key);
      }
    }
  }

  async clearAllContext() {
    try {
      const allData = await chrome.storage.local.get();
      const contextKeys = Object.keys(allData).filter(key => key.startsWith('context_'));
      
      if (contextKeys.length > 0) {
        await chrome.storage.local.remove(contextKeys);
        console.log(`Cleared ${contextKeys.length} context entries`);
      }
      
      return { cleared: contextKeys.length };
    } catch (error) {
      console.error('Failed to clear context:', error);
      throw error;
    }
  }

  async exportContext(tabId = null) {
    try {
      const allData = await chrome.storage.local.get();
      let contextKeys = Object.keys(allData).filter(key => key.startsWith('context_'));
      
      // Filter by tab if specified
      if (tabId) {
        contextKeys = contextKeys.filter(key => key.startsWith(`context_${tabId}_`));
      }
      
      const contextData = {};
      contextKeys.forEach(key => {
        contextData[key] = allData[key];
      });
      
      return {
        exportDate: new Date().toISOString(),
        tabId: tabId,
        totalEntries: contextKeys.length,
        data: contextData
      };
    } catch (error) {
      console.error('Failed to export context:', error);
      throw error;
    }
  }

  async getContextStats(tabId = null) {
    try {
      const allData = await chrome.storage.local.get();
      let contextKeys = Object.keys(allData).filter(key => key.startsWith('context_'));
      
      const stats = {
        total: contextKeys.length,
        byTab: {},
        byType: {},
        totalSize: 0
      };
      
      contextKeys.forEach(key => {
        const data = allData[key];
        const keyParts = key.split('_');
        const keyTabId = keyParts[1];
        
        // Count by tab
        if (!stats.byTab[keyTabId]) {
          stats.byTab[keyTabId] = 0;
        }
        stats.byTab[keyTabId]++;
        
        // Count by type
        if (data && data.type) {
          if (!stats.byType[data.type]) {
            stats.byType[data.type] = 0;
          }
          stats.byType[data.type]++;
        }
        
        // Estimate size
        stats.totalSize += JSON.stringify(data).length;
      });
      
      // Filter for current tab if specified
      if (tabId) {
        stats.currentTab = stats.byTab[tabId] || 0;
      }
      
      return stats;
    } catch (error) {
      console.error('Failed to get context stats:', error);
      throw error;
    }
  }

  async checkEmbeddingServiceStatus() {
    const settings = await this.getSettings();
    const { provider, apiKey, ragEnabled } = settings;

    if (!ragEnabled) {
      return { status: 'info', message: 'RAG Disabled' };
    }

    if (!apiKey) {
      return { status: 'error', message: 'API key missing' };
    }

    if (provider === 'openai') {
      try {
        const response = await fetch('https://api.openai.com/v1/models', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
          },
        });

        if (response.ok) {
          return { status: 'ok', message: 'OpenAI Connected' };
        } else if (response.status === 401) {
          return { status: 'error', message: 'OpenAI Connection Failed: Invalid API Key' };
        } else {
          return { status: 'error', message: `OpenAI Connection Failed: ${response.statusText}` };
        }
      } catch (error) {
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
          return { status: 'error', message: 'OpenAI Connection Failed: Network Error' };
        }
        console.error('OpenAI status check error:', error);
        return { status: 'error', message: 'OpenAI Connection Failed' };
      }
    } else {
      // For other providers, just check API key presence
      return { status: 'ok', message: 'Provider API Key Present' };
    }
  }
}

// Initialize background service
new BackgroundService();