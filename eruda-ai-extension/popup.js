// Popup script for Eruda AI Assistant settings
class PopupManager {
  constructor() {
    this.settings = {};
    this.modelSelector = null;
    this.init();
  }

  async init() {
    // Initialize model selector
    await this.initializeModelSelector();
    await this.loadSettings();
    this.setupEventListeners();
    this.updateModelOptions();
    this.updateStatus();
    this.updateStats();
  }

  async initializeModelSelector() {
    // Load model selector script
    if (!window.ModelSelector) {
      const script = document.createElement('script');
      script.src = '../model-selector.js';
      document.head.appendChild(script);
      
      // Wait for script to load
      await new Promise(resolve => {
        script.onload = resolve;
      });
    }
    
    this.modelSelector = new window.ModelSelector();
    await this.modelSelector.loadActiveModel();
  }

  async loadSettings() {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_SETTINGS' });
      if (response.success) {
        this.settings = response.data;
        this.populateForm();
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      this.showNotification('Failed to load settings', 'error');
    }
  }

  populateForm() {
    const form = document.getElementById('settings-form');
    const formData = new FormData(form);
    
    // Populate form fields
    Object.keys(this.settings).forEach(key => {
      const element = form.querySelector(`[name="${key}"]`);
      if (element) {
        if (element.type === 'checkbox') {
          element.checked = this.settings[key];
        } else {
          element.value = this.settings[key];
        }
      }
    });

    this.updateModelOptions();
  }

  setupEventListeners() {
    // Form submission
    document.getElementById('settings-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveSettings();
    });

    // Provider change
    document.getElementById('provider').addEventListener('change', () => {
      this.updateModelOptions();
    });

    // Model change
    document.getElementById('model').addEventListener('change', (e) => {
      this.onModelChange(e.target.value);
    });

    // Test connection
    document.getElementById('test-connection').addEventListener('click', () => {
      this.testConnection();
    });

    // API key visibility toggle
    document.getElementById('toggle-api-key').addEventListener('click', () => {
      this.toggleApiKeyVisibility();
    });

    // Advanced settings toggle
    document.getElementById('toggle-advanced').addEventListener('click', () => {
      this.toggleAdvancedSettings();
    });

    // Temperature slider
    document.getElementById('temperature').addEventListener('input', (e) => {
      document.getElementById('temperature-value').textContent = e.target.value;
    });

    // Action buttons
    document.getElementById('clear-context').addEventListener('click', () => {
      this.clearContext();
    });

    document.getElementById('export-context').addEventListener('click', () => {
      this.exportContext();
    });

    document.getElementById('open-eruda').addEventListener('click', () => {
      this.openErudaPanel();
    });

    // Notification close
    document.querySelector('.notification-close').addEventListener('click', () => {
      this.hideNotification();
    });

    // Help links
    document.getElementById('help-link').addEventListener('click', (e) => {
      e.preventDefault();
      this.openHelp();
    });

    document.getElementById('privacy-link').addEventListener('click', (e) => {
      e.preventDefault();
      this.openPrivacy();
    });

    document.getElementById('github-link').addEventListener('click', (e) => {
      e.preventDefault();
      this.openGitHub();
    });
  }

  updateModelOptions() {
    if (!this.modelSelector) return;

    const provider = document.getElementById('provider').value;
    const modelSelect = document.getElementById('model');
    
    // Clear existing options
    modelSelect.innerHTML = '';
    
    // Add recommended models section
    const recommendedGroup = document.createElement('optgroup');
    recommendedGroup.label = '🌟 Recommended';
    
    const recommendedModels = this.modelSelector.getRecommendedModels()
      .filter(model => !provider || model.provider === provider);
    
    recommendedModels.forEach(model => {
      const option = this.createModelOption(model);
      recommendedGroup.appendChild(option);
    });
    
    if (recommendedModels.length > 0) {
      modelSelect.appendChild(recommendedGroup);
    }

    // Add provider-specific models
    if (provider) {
      const providerModels = this.modelSelector.getModelsByProvider(provider)
        .filter(model => !model.recommended); // Exclude already shown recommended models
      
      if (providerModels.length > 0) {
        const providerGroup = document.createElement('optgroup');
        const providerInfo = this.modelSelector.getProvider(provider);
        providerGroup.label = `${providerInfo?.icon || '🤖'} ${providerInfo?.name || provider}`;
        
        providerModels.forEach(model => {
          const option = this.createModelOption(model);
          providerGroup.appendChild(option);
        });
        
        modelSelect.appendChild(providerGroup);
      }
    } else {
      // Show all models grouped by provider
      const providers = this.modelSelector.getProviders();
      
      providers.forEach(provider => {
        const providerModels = this.modelSelector.getModelsByProvider(provider.id)
          .filter(model => !model.recommended); // Exclude already shown recommended models
        
        if (providerModels.length > 0) {
          const providerGroup = document.createElement('optgroup');
          providerGroup.label = `${provider.icon} ${provider.name}`;
          
          providerModels.forEach(model => {
            const option = this.createModelOption(model);
            providerGroup.appendChild(option);
          });
          
          modelSelect.appendChild(providerGroup);
        }
      });
    }

    // Restore selected value
    const activeModel = this.modelSelector.getActiveModel();
    if (activeModel) {
      modelSelect.value = activeModel.id;
    }
  }

  createModelOption(model) {
    const option = document.createElement('option');
    option.value = model.id;
    
    const displayInfo = this.modelSelector.getModelDisplayInfo(model.id);
    option.textContent = `${displayInfo.displayName} ${displayInfo.costDisplay}`;
    option.title = `${model.description}\nCapabilities: ${displayInfo.capabilityIcons}\nContext: ${model.contextWindow.toLocaleString()} tokens`;
    
    return option;
  }

  async onModelChange(modelId) {
    if (this.modelSelector && modelId) {
      await this.modelSelector.setActiveModel(modelId);
      this.updateModelInfo(modelId);
    }
  }

  updateModelInfo(modelId) {
    const modelInfoDiv = document.getElementById('model-info');
    if (!modelInfoDiv || !this.modelSelector) return;

    const model = this.modelSelector.getModel(modelId);
    if (!model) {
      modelInfoDiv.innerHTML = '';
      return;
    }

    const displayInfo = this.modelSelector.getModelDisplayInfo(modelId);
    modelInfoDiv.innerHTML = `
      <div class="model-info-card">
        <div class="model-header">
          <span class="model-name">${displayInfo.displayName}</span>
          <span class="model-cost">${displayInfo.costDisplay}</span>
        </div>
        <div class="model-description">${model.description}</div>
        <div class="model-details">
          <div class="model-detail">
            <span class="detail-label">Context Window:</span>
            <span class="detail-value">${model.contextWindow.toLocaleString()} tokens</span>
          </div>
          <div class="model-detail">
            <span class="detail-label">Max Output:</span>
            <span class="detail-value">${model.maxTokens.toLocaleString()} tokens</span>
          </div>
          <div class="model-detail">
            <span class="detail-label">Capabilities:</span>
            <span class="detail-value">${displayInfo.capabilityIcons}</span>
          </div>
        </div>
      </div>
    `;
  }

  async saveSettings() {
    try {
      const form = document.getElementById('settings-form');
      const formData = new FormData(form);
      
      const settings = {};
      for (const [key, value] of formData.entries()) {
        if (key === 'ragEnabled') {
          settings[key] = true; // Checkbox is checked if present in FormData
        } else if (key === 'maxContextChunks') {
          const chunks = parseInt(value, 10);
          if (isNaN(chunks) || chunks < 1 || chunks > 50) {
            throw new Error('Max context chunks must be between 1 and 50');
          }
          settings[key] = chunks;
        } else {
          settings[key] = value.trim();
        }
      }

      // Handle unchecked checkbox
      if (!formData.has('ragEnabled')) {
        settings.ragEnabled = false;
      }

      // Validate required fields
      if (!settings.provider) {
        throw new Error('Please select an AI provider');
      }

      if (!settings.apiKey) {
        throw new Error('Please enter an API key');
      }

      // Validate API key format
      if (settings.apiKey.length < 10) {
        throw new Error('API key appears to be too short');
      }

      // Validate temperature range
      if (settings.temperature !== undefined) {
        const temp = parseFloat(settings.temperature);
        if (isNaN(temp) || temp < 0 || temp > 1) {
          throw new Error('Temperature must be between 0 and 1');
        }
        settings.temperature = temp;
      }

      // Validate max tokens
      if (settings.maxTokens !== undefined) {
        const tokens = parseInt(settings.maxTokens, 10);
        if (isNaN(tokens) || tokens < 100 || tokens > 4000) {
          throw new Error('Max tokens must be between 100 and 4000');
        }
        settings.maxTokens = tokens;
      }

      const response = await chrome.runtime.sendMessage({
        type: 'SAVE_SETTINGS',
        payload: settings
      });

      if (response.success) {
        this.settings = settings;
        this.showNotification('Settings saved successfully!');
        this.updateStatus();
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      this.showNotification('Failed to save settings', 'error');
    }
  }

  async testConnection() {
    const testButton = document.getElementById('test-connection');
    const statusDot = document.querySelector('.status-dot');
    const statusText = document.querySelector('.status-text');
    
    // Update UI to show testing state
    testButton.disabled = true;
    testButton.textContent = 'Testing...';
    statusDot.className = 'status-dot testing';
    statusText.textContent = 'Testing connection...';

    try {
      // Create a simple test message
      const testMessages = [
        { role: 'user', content: 'Hello, this is a connection test.' }
      ];

      const response = await chrome.runtime.sendMessage({
        type: 'MAKE_AI_REQUEST',
        payload: { messages: testMessages }
      });

      if (response.success) {
        statusDot.className = 'status-dot connected';
        statusText.textContent = 'Connected';
        this.showNotification('Connection test successful!');
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      statusDot.className = 'status-dot';
      statusText.textContent = 'Connection failed';
      this.showNotification(`Connection test failed: ${error.message}`, 'error');
    } finally {
      testButton.disabled = false;
      testButton.textContent = 'Test Connection';
    }
  }

  updateStatus() {
    const statusDot = document.querySelector('.status-dot');
    const statusText = document.querySelector('.status-text');
    
    if (this.settings.apiKey) {
      statusDot.className = 'status-dot connected';
      statusText.textContent = `Ready (${this.settings.provider})`;
    } else {
      statusDot.className = 'status-dot';
      statusText.textContent = 'API key required';
    }
  }

  async updateStats() {
    try {
      // Get current tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (tab) {
        // Get actual context stats
        const response = await chrome.runtime.sendMessage({ 
          type: 'GET_CONTEXT_STATS',
          tabId: tab.id 
        });
        
        if (response.success) {
          const stats = response.data;
          document.getElementById('context-count').textContent = 
            `${stats.currentTab || 0} chunks`;
          document.getElementById('total-context').textContent = 
            `${stats.total || 0} chunks`;
        } else {
          throw new Error(response.error);
        }
      }
    } catch (error) {
      console.error('Failed to update stats:', error);
      // Show error state
      document.getElementById('context-count').textContent = 'Error';
      document.getElementById('total-context').textContent = 'Error';
    }
  }

  async clearContext() {
    if (confirm('Are you sure you want to clear all stored context? This action cannot be undone.')) {
      try {
        // This would need to be implemented in the background script
        await chrome.runtime.sendMessage({ type: 'CLEAR_CONTEXT' });
        this.showNotification('Context cleared successfully!');
        this.updateStats();
      } catch (error) {
        console.error('Failed to clear context:', error);
        this.showNotification('Failed to clear context', 'error');
      }
    }
  }

  async exportContext() {
    try {
      // This would need to be implemented to export context data
      const contextData = await chrome.runtime.sendMessage({ type: 'EXPORT_CONTEXT' });
      
      const blob = new Blob([JSON.stringify(contextData, null, 2)], { 
        type: 'application/json' 
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `eruda-ai-context-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      
      URL.revokeObjectURL(url);
      this.showNotification('Context exported successfully!');
    } catch (error) {
      console.error('Failed to export context:', error);
      this.showNotification('Failed to export context', 'error');
    }
  }

  async openErudaPanel() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (tab) {
        try {
          await chrome.tabs.sendMessage(tab.id, { type: 'OPEN_ERUDA_PANEL' });
          this.showNotification('Eruda panel opened successfully', 'success');
          window.close(); // Close popup
        } catch (connectionError) {
          // If content script connection fails, try to inject and retry
          console.log('Content script not responding, attempting to inject...');
          
          try {
            // Inject content script
            await chrome.scripting.executeScript({
              target: { tabId: tab.id },
              files: ['content.js']
            });
            
            // Wait a moment for initialization
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Retry the message
            await chrome.tabs.sendMessage(tab.id, { type: 'OPEN_ERUDA_PANEL' });
            this.showNotification('Eruda panel opened (after injection)', 'success');
            window.close();
          } catch (injectionError) {
            // Final fallback: show instructions for floating button
            this.showNotification(
              'Extension connection failed. Look for the floating 🔧 button on the page to open Eruda directly.',
              'warning'
            );
            console.error('Failed to inject content script:', injectionError);
          }
        }
      }
    } catch (error) {
      console.error('Failed to open Eruda panel:', error);
      this.showNotification(
        'Failed to open Eruda panel. Try using the floating 🔧 button on the page.',
        'error'
      );
    }
  }

  showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const notificationText = document.querySelector('.notification-text');
    
    notificationText.textContent = message;
    notification.className = `notification ${type}`;
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      this.hideNotification();
    }, 3000);
  }

  hideNotification() {
    const notification = document.getElementById('notification');
    notification.classList.add('hidden');
  }

  openHelp() {
    // For now, show help in a modal or create a help page
    this.showHelpModal();
  }

  openPrivacy() {
    this.showPrivacyModal();
  }

  openGitHub() {
    chrome.tabs.create({ 
      url: 'https://github.com/attmsta/workspace' 
    });
  }

  showHelpModal() {
    const helpContent = `
      <h3>Eruda AI Assistant Help</h3>
      <h4>Getting Started:</h4>
      <ol>
        <li>Configure your AI provider and API key</li>
        <li>Visit any webpage</li>
        <li>Open Eruda developer tools</li>
        <li>Click the "AI Assistant" tab</li>
        <li>Start asking questions about the page</li>
      </ol>
      
      <h4>Example Questions:</h4>
      <ul>
        <li>"What JavaScript frameworks are used on this page?"</li>
        <li>"Why is this form not submitting?"</li>
        <li>"What network requests are failing?"</li>
        <li>"How can I optimize this page's performance?"</li>
      </ul>
      
      <h4>Features:</h4>
      <ul>
        <li>Real-time page analysis</li>
        <li>Context-aware AI responses</li>
        <li>Network request monitoring</li>
        <li>Error detection and debugging</li>
      </ul>
    `;
    
    this.showModal('Help', helpContent);
  }

  showPrivacyModal() {
    const privacyContent = `
      <h3>Privacy Policy</h3>
      <h4>Data Collection:</h4>
      <ul>
        <li>We do not collect or store personal data</li>
        <li>API keys are stored locally in your browser</li>
        <li>Page context is processed locally</li>
        <li>Only AI API requests are sent externally</li>
      </ul>
      
      <h4>Data Usage:</h4>
      <ul>
        <li>Page content is analyzed locally for context</li>
        <li>Relevant context is sent to AI providers for responses</li>
        <li>No data is shared with third parties</li>
        <li>You can clear all stored data anytime</li>
      </ul>
      
      <h4>Security:</h4>
      <ul>
        <li>All API communications use HTTPS</li>
        <li>API keys are encrypted in browser storage</li>
        <li>No external tracking or analytics</li>
      </ul>
    `;
    
    this.showModal('Privacy Policy', privacyContent);
  }

  showModal(title, content) {
    // Create modal overlay
    const modalHtml = `
      <div class="modal-overlay" id="help-modal">
        <div class="modal-content">
          <div class="modal-header">
            <h2>${title}</h2>
            <button class="modal-close">&times;</button>
          </div>
          <div class="modal-body">
            ${content}
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Add modal styles
    const modalStyles = `
      <style id="modal-styles">
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
        }
        .modal-content {
          background: white;
          border-radius: 8px;
          max-width: 500px;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #e0e0e0;
        }
        .modal-header h2 {
          margin: 0;
          color: #333;
        }
        .modal-close {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #666;
        }
        .modal-body {
          padding: 20px;
          line-height: 1.6;
        }
        .modal-body h3, .modal-body h4 {
          color: #667eea;
          margin-top: 20px;
          margin-bottom: 10px;
        }
        .modal-body ul, .modal-body ol {
          margin-left: 20px;
        }
        .modal-body li {
          margin-bottom: 5px;
        }
      </style>
    `;
    
    document.head.insertAdjacentHTML('beforeend', modalStyles);
    
    // Add close functionality
    document.getElementById('help-modal').addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-overlay') || e.target.classList.contains('modal-close')) {
        document.getElementById('help-modal').remove();
        document.getElementById('modal-styles')?.remove();
      }
    });
  }

  toggleApiKeyVisibility() {
    const apiKeyInput = document.getElementById('api-key');
    const toggleButton = document.getElementById('toggle-api-key');
    
    if (apiKeyInput.type === 'password') {
      apiKeyInput.type = 'text';
      toggleButton.textContent = '🙈';
      toggleButton.title = 'Hide API Key';
    } else {
      apiKeyInput.type = 'password';
      toggleButton.textContent = '👁️';
      toggleButton.title = 'Show API Key';
    }
  }

  toggleAdvancedSettings() {
    const advancedContent = document.getElementById('advanced-content');
    const toggleButton = document.getElementById('toggle-advanced');
    const toggleText = toggleButton.querySelector('.toggle-text');
    const toggleIcon = toggleButton.querySelector('.toggle-icon');
    
    if (advancedContent.style.display === 'none') {
      advancedContent.style.display = 'block';
      toggleText.textContent = 'Hide Advanced Settings';
      toggleButton.classList.add('active');
    } else {
      advancedContent.style.display = 'none';
      toggleText.textContent = 'Show Advanced Settings';
      toggleButton.classList.remove('active');
    }
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PopupManager();
});