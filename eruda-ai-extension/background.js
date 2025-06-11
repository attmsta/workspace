// Background service worker for Eruda AI Assistant
class BackgroundService {
  constructor() {
    this.setupEventListeners();
    this.networkRequests = new Map();
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
      throw new Error('API key not configured');
    }

    const requestConfig = this.buildAIRequestConfig(provider, model, payload);
    
    const response = await fetch(requestConfig.url, {
      method: 'POST',
      headers: requestConfig.headers,
      body: JSON.stringify(requestConfig.body)
    });

    if (!response.ok) {
      throw new Error(`AI API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return this.parseAIResponse(provider, data);
  }

  buildAIRequestConfig(provider, model, payload) {
    const settings = this.getProviderSettings(provider);
    
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
            temperature: 0.7,
            max_tokens: 2000
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
            max_tokens: 2000
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
            temperature: 0.7,
            max_tokens: 2000
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
      maxContextChunks: 10
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
}

// Initialize background service
new BackgroundService();