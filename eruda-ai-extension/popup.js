// Popup script for Eruda AI Assistant settings
class PopupManager {
  constructor() {
    this.settings = {};
    this.modelOptions = {
      openai: [
        { value: 'gpt-4', label: 'GPT-4' },
        { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
        { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' }
      ],
      anthropic: [
        { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus' },
        { value: 'claude-3-sonnet-20240229', label: 'Claude 3 Sonnet' },
        { value: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku' }
      ],
      openrouter: [
        { value: 'anthropic/claude-3-opus', label: 'Claude 3 Opus' },
        { value: 'anthropic/claude-3-sonnet', label: 'Claude 3 Sonnet' },
        { value: 'openai/gpt-4', label: 'GPT-4' },
        { value: 'openai/gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
        { value: 'meta-llama/llama-2-70b-chat', label: 'Llama 2 70B' }
      ]
    };
    
    this.init();
  }

  async init() {
    await this.loadSettings();
    this.setupEventListeners();
    this.updateModelOptions();
    this.updateStatus();
    this.updateStats();
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

    // Test connection
    document.getElementById('test-connection').addEventListener('click', () => {
      this.testConnection();
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
    const provider = document.getElementById('provider').value;
    const modelSelect = document.getElementById('model');
    
    // Clear existing options
    modelSelect.innerHTML = '<option value="">Default</option>';
    
    // Add provider-specific options
    if (this.modelOptions[provider]) {
      this.modelOptions[provider].forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.value;
        optionElement.textContent = option.label;
        modelSelect.appendChild(optionElement);
      });
    }

    // Restore selected value if it exists
    if (this.settings.model) {
      modelSelect.value = this.settings.model;
    }
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
          settings[key] = parseInt(value, 10);
        } else {
          settings[key] = value;
        }
      }

      // Handle unchecked checkbox
      if (!formData.has('ragEnabled')) {
        settings.ragEnabled = false;
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
        // This would need to be implemented to get actual stats
        // For now, showing placeholder values
        document.getElementById('context-count').textContent = '0 chunks';
        document.getElementById('total-context').textContent = '0 chunks';
      }
    } catch (error) {
      console.error('Failed to update stats:', error);
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
        await chrome.tabs.sendMessage(tab.id, { type: 'OPEN_ERUDA_PANEL' });
        window.close(); // Close popup
      }
    } catch (error) {
      console.error('Failed to open Eruda panel:', error);
      this.showNotification('Failed to open Eruda panel', 'error');
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
    chrome.tabs.create({ 
      url: 'https://github.com/your-repo/eruda-ai-assistant#help' 
    });
  }

  openPrivacy() {
    chrome.tabs.create({ 
      url: 'https://github.com/your-repo/eruda-ai-assistant#privacy' 
    });
  }

  openGitHub() {
    chrome.tabs.create({ 
      url: 'https://github.com/your-repo/eruda-ai-assistant' 
    });
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PopupManager();
});