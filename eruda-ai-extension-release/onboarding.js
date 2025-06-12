// Onboarding and Help System for Eruda AI Assistant
class OnboardingSystem {
  constructor() {
    this.currentStep = 0;
    this.isActive = false;
    this.overlay = null;
    this.helpModal = null;
    this.tourSteps = [
      {
        target: '.ai-chat-header',
        title: '🤖 Welcome to Eruda AI Assistant!',
        content: 'Your intelligent companion for web development and debugging. Let me show you around!',
        position: 'bottom'
      },
      {
        target: '.refresh-context-btn',
        title: '🔄 Context Capture',
        content: 'This button captures the current page state including HTML, CSS, JavaScript, and console logs for AI analysis.',
        position: 'bottom'
      },
      {
        target: '.context-viz-btn',
        title: '📊 Context Analysis',
        content: 'View detailed analytics about your page context, including categorized data and insights.',
        position: 'bottom'
      },
      {
        target: '.quick-actions',
        title: '⚡ Quick Actions',
        content: 'Use these preset queries to quickly analyze common aspects of your webpage.',
        position: 'top'
      },
      {
        target: '#ai-chat-input',
        title: '💬 Chat Interface',
        content: 'Ask questions about your page, debug issues, or get development advice. The AI has full context of your current page.',
        position: 'top'
      },
      {
        target: '.input-controls',
        title: '🛠️ Chat Controls',
        content: 'Clear conversations, export chat history, copy responses, and see character count.',
        position: 'top'
      }
    ];
    
    this.helpTopics = [
      {
        id: 'getting-started',
        title: '🚀 Getting Started',
        content: `
          <h4>Welcome to Eruda AI Assistant!</h4>
          <p>This extension combines the power of Eruda DevTools with AI assistance to help you debug and develop web applications more efficiently.</p>
          
          <h5>First Steps:</h5>
          <ol>
            <li>Configure your API key in the extension settings</li>
            <li>Open any webpage and activate Eruda DevTools</li>
            <li>Navigate to the AI Assistant tab</li>
            <li>Click "🔄 Context" to capture page information</li>
            <li>Start asking questions about your page!</li>
          </ol>
        `
      },
      {
        id: 'context-system',
        title: '📊 Context System',
        content: `
          <h4>Understanding the Context System</h4>
          <p>The AI Assistant automatically captures and categorizes information about your webpage:</p>
          
          <h5>Context Categories:</h5>
          <ul>
            <li><strong>🏗️ HTML:</strong> DOM structure, elements, attributes</li>
            <li><strong>🎨 CSS:</strong> Styles, selectors, computed values</li>
            <li><strong>⚡ JavaScript:</strong> Code, variables, functions, events</li>
            <li><strong>🌐 Network:</strong> Requests, responses, API calls</li>
            <li><strong>🐛 Console:</strong> Logs, errors, warnings</li>
            <li><strong>📊 Performance:</strong> Metrics, timing, resources</li>
            <li><strong>♿ Accessibility:</strong> ARIA, semantic structure</li>
            <li><strong>🔒 Security:</strong> CSP, HTTPS, vulnerabilities</li>
          </ul>
          
          <p>The system intelligently filters and prioritizes context based on your questions.</p>
        `
      },
      {
        id: 'ai-features',
        title: '🤖 AI Features',
        content: `
          <h4>Advanced AI Capabilities</h4>
          
          <h5>Smart Context Awareness:</h5>
          <ul>
            <li>Automatically understands your page structure</li>
            <li>Identifies JavaScript frameworks and libraries</li>
            <li>Detects common issues and patterns</li>
            <li>Provides relevant suggestions</li>
          </ul>
          
          <h5>Debugging Assistance:</h5>
          <ul>
            <li>Analyze JavaScript errors</li>
            <li>Suggest performance optimizations</li>
            <li>Review accessibility issues</li>
            <li>Explain complex code patterns</li>
          </ul>
          
          <h5>Development Help:</h5>
          <ul>
            <li>Code explanations and documentation</li>
            <li>Best practice recommendations</li>
            <li>Framework-specific guidance</li>
            <li>Security vulnerability detection</li>
          </ul>
        `
      },
      {
        id: 'tips-tricks',
        title: '💡 Tips & Tricks',
        content: `
          <h4>Pro Tips for Better Results</h4>
          
          <h5>Effective Questions:</h5>
          <ul>
            <li><strong>Be specific:</strong> "Why is this button not clickable?" vs "Fix my code"</li>
            <li><strong>Include context:</strong> "The login form validation isn't working"</li>
            <li><strong>Ask for explanations:</strong> "Explain how this React component works"</li>
          </ul>
          
          <h5>Context Management:</h5>
          <ul>
            <li>Refresh context after making code changes</li>
            <li>Use the analysis view to understand your page better</li>
            <li>Bookmark important context for later reference</li>
            <li>Clean up old context to improve performance</li>
          </ul>
          
          <h5>Keyboard Shortcuts:</h5>
          <ul>
            <li><strong>Ctrl/Cmd + Enter:</strong> Send message</li>
            <li><strong>Quick Actions:</strong> Click preset buttons for common tasks</li>
          </ul>
        `
      },
      {
        id: 'troubleshooting',
        title: '🔧 Troubleshooting',
        content: `
          <h4>Common Issues & Solutions</h4>
          
          <h5>API Key Issues:</h5>
          <ul>
            <li>Ensure your API key is correctly configured</li>
            <li>Check that you have sufficient API credits</li>
            <li>Verify the selected AI provider is correct</li>
          </ul>
          
          <h5>Context Problems:</h5>
          <ul>
            <li>Try refreshing the context if responses seem outdated</li>
            <li>Check that Eruda is properly loaded on the page</li>
            <li>Some pages may block content script injection</li>
          </ul>
          
          <h5>Performance Issues:</h5>
          <ul>
            <li>Clean up old context data regularly</li>
            <li>Reduce context categories if responses are slow</li>
            <li>Consider using a faster AI model for quick queries</li>
          </ul>
          
          <h5>Getting Help:</h5>
          <ul>
            <li>Check the browser console for error messages</li>
            <li>Try disabling other extensions that might conflict</li>
            <li>Report issues with specific error details</li>
          </ul>
        `
      }
    ];
  }

  async checkFirstTime() {
    const result = await chrome.storage.sync.get(['onboardingCompleted']);
    return !result.onboardingCompleted;
  }

  async markOnboardingComplete() {
    await chrome.storage.sync.set({ onboardingCompleted: true });
  }

  async startOnboarding() {
    if (this.isActive) return;
    
    this.isActive = true;
    this.currentStep = 0;
    this.createOverlay();
    this.showStep(0);
  }

  createOverlay() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'onboarding-overlay';
    this.overlay.innerHTML = `
      <div class="onboarding-backdrop"></div>
      <div class="onboarding-tooltip" id="onboarding-tooltip">
        <div class="tooltip-header">
          <h3 id="tooltip-title"></h3>
          <button class="tooltip-close" onclick="window.onboardingSystem.endOnboarding()">×</button>
        </div>
        <div class="tooltip-content" id="tooltip-content"></div>
        <div class="tooltip-footer">
          <div class="step-indicator">
            <span id="step-current">1</span> / <span id="step-total">${this.tourSteps.length}</span>
          </div>
          <div class="tooltip-buttons">
            <button class="btn-secondary" id="prev-btn" onclick="window.onboardingSystem.previousStep()">Previous</button>
            <button class="btn-secondary" onclick="window.onboardingSystem.skipOnboarding()">Skip</button>
            <button class="btn-primary" id="next-btn" onclick="window.onboardingSystem.nextStep()">Next</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.overlay);
    this.addOnboardingStyles();
  }

  showStep(stepIndex) {
    if (stepIndex < 0 || stepIndex >= this.tourSteps.length) return;
    
    this.currentStep = stepIndex;
    const step = this.tourSteps[stepIndex];
    const target = document.querySelector(step.target);
    
    if (!target) {
      console.warn(`Onboarding target not found: ${step.target}`);
      this.nextStep();
      return;
    }

    // Update tooltip content
    document.getElementById('tooltip-title').textContent = step.title;
    document.getElementById('tooltip-content').innerHTML = step.content;
    document.getElementById('step-current').textContent = stepIndex + 1;
    
    // Update button states
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    
    prevBtn.style.display = stepIndex === 0 ? 'none' : 'inline-block';
    nextBtn.textContent = stepIndex === this.tourSteps.length - 1 ? 'Finish' : 'Next';
    
    // Position tooltip
    this.positionTooltip(target, step.position);
    
    // Highlight target
    this.highlightTarget(target);
  }

  positionTooltip(target, position) {
    const tooltip = document.getElementById('onboarding-tooltip');
    const rect = target.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    
    let top, left;
    
    switch (position) {
      case 'top':
        top = rect.top - tooltipRect.height - 10;
        left = rect.left + (rect.width - tooltipRect.width) / 2;
        break;
      case 'bottom':
        top = rect.bottom + 10;
        left = rect.left + (rect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = rect.top + (rect.height - tooltipRect.height) / 2;
        left = rect.left - tooltipRect.width - 10;
        break;
      case 'right':
        top = rect.top + (rect.height - tooltipRect.height) / 2;
        left = rect.right + 10;
        break;
      default:
        top = rect.bottom + 10;
        left = rect.left;
    }
    
    // Ensure tooltip stays within viewport
    top = Math.max(10, Math.min(top, window.innerHeight - tooltipRect.height - 10));
    left = Math.max(10, Math.min(left, window.innerWidth - tooltipRect.width - 10));
    
    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${left}px`;
  }

  highlightTarget(target) {
    // Remove previous highlights
    document.querySelectorAll('.onboarding-highlight').forEach(el => {
      el.classList.remove('onboarding-highlight');
    });
    
    // Add highlight to current target
    target.classList.add('onboarding-highlight');
    
    // Scroll target into view if needed
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  nextStep() {
    if (this.currentStep < this.tourSteps.length - 1) {
      this.showStep(this.currentStep + 1);
    } else {
      this.completeOnboarding();
    }
  }

  previousStep() {
    if (this.currentStep > 0) {
      this.showStep(this.currentStep - 1);
    }
  }

  async completeOnboarding() {
    await this.markOnboardingComplete();
    this.endOnboarding();
    this.showCompletionMessage();
  }

  skipOnboarding() {
    this.endOnboarding();
  }

  endOnboarding() {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
    
    // Remove highlights
    document.querySelectorAll('.onboarding-highlight').forEach(el => {
      el.classList.remove('onboarding-highlight');
    });
    
    this.isActive = false;
  }

  showCompletionMessage() {
    const message = document.createElement('div');
    message.className = 'onboarding-completion';
    message.innerHTML = `
      <div class="completion-content">
        <h3>🎉 Welcome aboard!</h3>
        <p>You're all set to start using Eruda AI Assistant. Happy debugging!</p>
        <button class="btn-primary" onclick="this.parentElement.parentElement.remove()">Get Started</button>
      </div>
    `;
    
    document.body.appendChild(message);
    setTimeout(() => message.remove(), 5000);
  }

  showHelp() {
    if (this.helpModal) {
      this.helpModal.remove();
    }

    this.helpModal = document.createElement('div');
    this.helpModal.className = 'help-modal';
    this.helpModal.innerHTML = `
      <div class="help-modal-content">
        <div class="help-header">
          <h3>📚 Eruda AI Assistant Help</h3>
          <button class="help-close" onclick="window.onboardingSystem.closeHelp()">×</button>
        </div>
        
        <div class="help-body">
          <div class="help-sidebar">
            <div class="help-nav">
              ${this.helpTopics.map(topic => `
                <button class="help-nav-item" data-topic="${topic.id}">
                  ${topic.title}
                </button>
              `).join('')}
            </div>
            
            <div class="help-actions">
              <button class="btn-secondary" onclick="window.onboardingSystem.startOnboarding()">
                🎯 Take Tour
              </button>
              <button class="btn-secondary" onclick="window.onboardingSystem.showKeyboardShortcuts()">
                ⌨️ Shortcuts
              </button>
            </div>
          </div>
          
          <div class="help-content" id="help-content">
            ${this.helpTopics[0].content}
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.helpModal);
    this.addHelpStyles();
    this.setupHelpNavigation();
  }

  setupHelpNavigation() {
    const navItems = this.helpModal.querySelectorAll('.help-nav-item');
    const content = this.helpModal.querySelector('#help-content');
    
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        // Update active state
        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');
        
        // Show content
        const topicId = item.dataset.topic;
        const topic = this.helpTopics.find(t => t.id === topicId);
        if (topic) {
          content.innerHTML = topic.content;
        }
      });
    });
    
    // Set first item as active
    navItems[0].classList.add('active');
  }

  closeHelp() {
    if (this.helpModal) {
      this.helpModal.remove();
      this.helpModal = null;
    }
  }

  showKeyboardShortcuts() {
    const shortcuts = `
      <h4>⌨️ Keyboard Shortcuts</h4>
      <div class="shortcuts-list">
        <div class="shortcut-item">
          <kbd>Ctrl/Cmd + Enter</kbd>
          <span>Send message in chat</span>
        </div>
        <div class="shortcut-item">
          <kbd>Esc</kbd>
          <span>Close modals and overlays</span>
        </div>
        <div class="shortcut-item">
          <kbd>Ctrl/Cmd + K</kbd>
          <span>Focus chat input</span>
        </div>
        <div class="shortcut-item">
          <kbd>Ctrl/Cmd + R</kbd>
          <span>Refresh context</span>
        </div>
      </div>
      
      <h5>Quick Actions:</h5>
      <p>Click the preset buttons below the chat for common debugging tasks.</p>
    `;
    
    document.getElementById('help-content').innerHTML = shortcuts;
  }

  addOnboardingStyles() {
    if (document.getElementById('onboarding-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'onboarding-styles';
    styles.textContent = `
      .onboarding-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10000;
        pointer-events: none;
      }

      .onboarding-backdrop {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        pointer-events: auto;
      }

      .onboarding-tooltip {
        position: absolute;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        max-width: 400px;
        pointer-events: auto;
        z-index: 10001;
      }

      .tooltip-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px;
        border-bottom: 1px solid #eee;
      }

      .tooltip-header h3 {
        margin: 0;
        color: #333;
        font-size: 16px;
      }

      .tooltip-close {
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
        color: #999;
        padding: 0;
        width: 24px;
        height: 24px;
      }

      .tooltip-content {
        padding: 16px 20px;
        color: #555;
        line-height: 1.5;
      }

      .tooltip-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px;
        border-top: 1px solid #eee;
        background: #f8f9fa;
        border-radius: 0 0 8px 8px;
      }

      .step-indicator {
        font-size: 14px;
        color: #666;
      }

      .tooltip-buttons {
        display: flex;
        gap: 8px;
      }

      .onboarding-highlight {
        position: relative;
        z-index: 9999;
        box-shadow: 0 0 0 4px rgba(0, 123, 255, 0.5) !important;
        border-radius: 4px !important;
      }

      .onboarding-completion {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        z-index: 10002;
        padding: 0;
      }

      .completion-content {
        padding: 24px;
        text-align: center;
      }

      .completion-content h3 {
        margin: 0 0 12px 0;
        color: #28a745;
      }

      .completion-content p {
        margin: 0 0 20px 0;
        color: #555;
      }
    `;

    document.head.appendChild(styles);
  }

  addHelpStyles() {
    if (document.getElementById('help-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'help-styles';
    styles.textContent = `
      .help-modal {
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

      .help-modal-content {
        background: white;
        border-radius: 8px;
        width: 90%;
        max-width: 900px;
        height: 80%;
        max-height: 600px;
        display: flex;
        flex-direction: column;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      }

      .help-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        border-bottom: 1px solid #eee;
      }

      .help-header h3 {
        margin: 0;
        color: #333;
      }

      .help-close {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #999;
      }

      .help-body {
        display: flex;
        flex: 1;
        overflow: hidden;
      }

      .help-sidebar {
        width: 250px;
        background: #f8f9fa;
        border-right: 1px solid #eee;
        display: flex;
        flex-direction: column;
      }

      .help-nav {
        flex: 1;
        padding: 20px 0;
      }

      .help-nav-item {
        display: block;
        width: 100%;
        padding: 12px 20px;
        border: none;
        background: none;
        text-align: left;
        cursor: pointer;
        color: #555;
        font-size: 14px;
        transition: all 0.2s ease;
      }

      .help-nav-item:hover {
        background: #e9ecef;
      }

      .help-nav-item.active {
        background: #007bff;
        color: white;
      }

      .help-actions {
        padding: 20px;
        border-top: 1px solid #eee;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .help-content {
        flex: 1;
        padding: 20px;
        overflow-y: auto;
      }

      .help-content h4 {
        margin: 0 0 16px 0;
        color: #333;
      }

      .help-content h5 {
        margin: 20px 0 8px 0;
        color: #555;
      }

      .help-content ul, .help-content ol {
        margin: 0 0 16px 0;
        padding-left: 20px;
      }

      .help-content li {
        margin-bottom: 4px;
        line-height: 1.5;
      }

      .shortcuts-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin: 16px 0;
      }

      .shortcut-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 12px;
        background: #f8f9fa;
        border-radius: 4px;
      }

      .shortcut-item kbd {
        background: #e9ecef;
        border: 1px solid #adb5bd;
        border-radius: 3px;
        padding: 2px 6px;
        font-size: 12px;
        font-family: monospace;
      }

      .btn-primary, .btn-secondary {
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
    `;

    document.head.appendChild(styles);
  }
}

// Make OnboardingSystem available globally
window.OnboardingSystem = OnboardingSystem;