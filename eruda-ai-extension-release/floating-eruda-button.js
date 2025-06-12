/**
 * Floating Eruda Button - DOM Shortcut for Direct Eruda Initialization
 * Bypasses extension popup communication issues and Android limitations
 */

class FloatingErudaButton {
  constructor() {
    this.button = null;
    this.isErudaLoaded = false;
    this.isErudaOpen = false;
    this.isDragging = false;
    this.dragOffset = { x: 0, y: 0 };
    this.position = { x: 20, y: 100 }; // Default position
    
    this.init();
  }

  init() {
    // Don't inject on certain domains to avoid conflicts
    if (this.shouldSkipDomain()) {
      return;
    }

    this.createButton();
    this.loadStoredPosition();
    this.attachEventListeners();
    
    // Auto-hide after 5 seconds, show on hover
    this.setupAutoHide();
  }

  shouldSkipDomain() {
    const skipDomains = [
      'chrome://',
      'chrome-extension://',
      'moz-extension://',
      'about:',
      'file://'
    ];
    
    return skipDomains.some(domain => window.location.href.startsWith(domain));
  }

  createButton() {
    // Remove existing button if any
    const existing = document.getElementById('eruda-floating-button');
    if (existing) {
      existing.remove();
    }

    this.button = document.createElement('div');
    this.button.id = 'eruda-floating-button';
    this.button.innerHTML = `
      <div class="eruda-btn-icon">🔧</div>
      <div class="eruda-btn-tooltip">Click to open Eruda Console</div>
    `;

    // Apply styles
    this.applyStyles();
    
    // Insert into DOM
    document.body.appendChild(this.button);
  }

  applyStyles() {
    const styles = `
      #eruda-floating-button {
        position: fixed;
        width: 50px;
        height: 50px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 50%;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        cursor: pointer;
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        user-select: none;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        opacity: 0.8;
        backdrop-filter: blur(10px);
        border: 2px solid rgba(255, 255, 255, 0.2);
      }

      #eruda-floating-button:hover {
        opacity: 1;
        transform: scale(1.1);
        box-shadow: 0 6px 25px rgba(0, 0, 0, 0.4);
      }

      #eruda-floating-button.dragging {
        transform: scale(1.1);
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
        opacity: 0.9;
      }

      #eruda-floating-button.eruda-open {
        background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
      }

      #eruda-floating-button.loading {
        animation: eruda-pulse 1.5s infinite;
      }

      .eruda-btn-icon {
        font-size: 20px;
        color: white;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        transition: transform 0.2s ease;
      }

      #eruda-floating-button:hover .eruda-btn-icon {
        transform: rotate(90deg);
      }

      .eruda-btn-tooltip {
        position: absolute;
        right: 60px;
        top: 50%;
        transform: translateY(-50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 12px;
        white-space: nowrap;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s ease;
        backdrop-filter: blur(10px);
      }

      #eruda-floating-button:hover .eruda-btn-tooltip {
        opacity: 1;
      }

      .eruda-btn-tooltip::after {
        content: '';
        position: absolute;
        left: 100%;
        top: 50%;
        transform: translateY(-50%);
        border: 5px solid transparent;
        border-left-color: rgba(0, 0, 0, 0.8);
      }

      #eruda-floating-button.auto-hide {
        opacity: 0.3;
        transform: scale(0.8);
      }

      #eruda-floating-button.auto-hide:hover {
        opacity: 1;
        transform: scale(1.1);
      }

      @keyframes eruda-pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }

      @media (max-width: 768px) {
        #eruda-floating-button {
          width: 45px;
          height: 45px;
        }
        
        .eruda-btn-icon {
          font-size: 18px;
        }
        
        .eruda-btn-tooltip {
          display: none; /* Hide tooltip on mobile */
        }
      }
    `;

    // Inject styles if not already present
    if (!document.getElementById('eruda-floating-button-styles')) {
      const styleSheet = document.createElement('style');
      styleSheet.id = 'eruda-floating-button-styles';
      styleSheet.textContent = styles;
      document.head.appendChild(styleSheet);
    }

    // Set initial position
    this.updatePosition();
  }

  attachEventListeners() {
    // Click to toggle Eruda
    this.button.addEventListener('click', (e) => {
      if (!this.isDragging) {
        this.toggleEruda();
      }
    });

    // Drag functionality
    this.button.addEventListener('mousedown', this.startDrag.bind(this));
    this.button.addEventListener('touchstart', this.startDrag.bind(this));
    
    document.addEventListener('mousemove', this.drag.bind(this));
    document.addEventListener('touchmove', this.drag.bind(this));
    
    document.addEventListener('mouseup', this.endDrag.bind(this));
    document.addEventListener('touchend', this.endDrag.bind(this));

    // Prevent context menu
    this.button.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });

    // Double-click to reset position
    this.button.addEventListener('dblclick', () => {
      this.resetPosition();
    });
  }

  setupAutoHide() {
    let hideTimeout;
    
    const showButton = () => {
      this.button.classList.remove('auto-hide');
      clearTimeout(hideTimeout);
      hideTimeout = setTimeout(() => {
        this.button.classList.add('auto-hide');
      }, 5000);
    };

    const hideButton = () => {
      clearTimeout(hideTimeout);
      hideTimeout = setTimeout(() => {
        this.button.classList.add('auto-hide');
      }, 2000);
    };

    // Show on page interaction
    document.addEventListener('mousemove', showButton);
    document.addEventListener('scroll', showButton);
    document.addEventListener('keydown', showButton);
    
    // Initial hide
    hideButton();
  }

  startDrag(e) {
    e.preventDefault();
    this.isDragging = false; // Will be set to true if actually dragging
    
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    
    this.dragOffset.x = clientX - this.position.x;
    this.dragOffset.y = clientY - this.position.y;
    
    this.button.classList.add('dragging');
  }

  drag(e) {
    if (!this.button.classList.contains('dragging')) return;
    
    e.preventDefault();
    this.isDragging = true;
    
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    
    this.position.x = clientX - this.dragOffset.x;
    this.position.y = clientY - this.dragOffset.y;
    
    // Keep within viewport bounds
    this.constrainPosition();
    this.updatePosition();
  }

  endDrag(e) {
    if (!this.button.classList.contains('dragging')) return;
    
    this.button.classList.remove('dragging');
    this.savePosition();
    
    // Small delay to prevent click event after drag
    setTimeout(() => {
      this.isDragging = false;
    }, 100);
  }

  constrainPosition() {
    const buttonSize = 50;
    const margin = 10;
    
    this.position.x = Math.max(margin, Math.min(
      window.innerWidth - buttonSize - margin,
      this.position.x
    ));
    
    this.position.y = Math.max(margin, Math.min(
      window.innerHeight - buttonSize - margin,
      this.position.y
    ));
  }

  updatePosition() {
    this.button.style.left = `${this.position.x}px`;
    this.button.style.top = `${this.position.y}px`;
  }

  savePosition() {
    try {
      localStorage.setItem('eruda-floating-button-position', JSON.stringify(this.position));
    } catch (e) {
      // Ignore localStorage errors
    }
  }

  loadStoredPosition() {
    try {
      const stored = localStorage.getItem('eruda-floating-button-position');
      if (stored) {
        this.position = JSON.parse(stored);
        this.constrainPosition();
      }
    } catch (e) {
      // Use default position
    }
  }

  resetPosition() {
    this.position = { x: 20, y: 100 };
    this.updatePosition();
    this.savePosition();
    
    // Visual feedback
    this.button.style.animation = 'eruda-pulse 0.5s ease';
    setTimeout(() => {
      this.button.style.animation = '';
    }, 500);
  }

  async toggleEruda() {
    if (this.isErudaLoaded && window.eruda) {
      // Toggle existing Eruda
      if (this.isErudaOpen) {
        window.eruda.hide();
        this.isErudaOpen = false;
        this.button.classList.remove('eruda-open');
        this.updateTooltip('Click to open Eruda Console');
      } else {
        window.eruda.show();
        this.isErudaOpen = true;
        this.button.classList.add('eruda-open');
        this.updateTooltip('Click to close Eruda Console');
      }
    } else {
      // Load and initialize Eruda
      await this.loadEruda();
    }
  }

  async loadEruda() {
    if (this.isErudaLoaded) return;
    
    this.button.classList.add('loading');
    this.updateTooltip('Loading Eruda...');
    
    try {
      // Try to get Eruda from extension first
      let erudaLoaded = false;
      
      // Method 1: Try to load from Chrome extension
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        try {
          const erudaUrl = chrome.runtime.getURL('eruda.js');
          await this.loadScript(erudaUrl);
          erudaLoaded = true;
        } catch (e) {
          console.log('Failed to load Eruda from extension, trying CDN...');
        }
      }
      
      // Method 2: Fallback to CDN
      if (!erudaLoaded) {
        await this.loadScript('https://cdn.jsdelivr.net/npm/eruda@3.4.1/eruda.js');
      }
      
      // Initialize Eruda
      if (window.eruda) {
        window.eruda.init({
          container: document.body,
          tool: ['console', 'elements', 'network', 'resources', 'info', 'snippets']
        });
        
        this.isErudaLoaded = true;
        this.isErudaOpen = true;
        this.button.classList.add('eruda-open');
        this.updateTooltip('Click to close Eruda Console');
        
        // Listen for Eruda hide/show events
        this.setupErudaListeners();
      } else {
        throw new Error('Eruda failed to load');
      }
    } catch (error) {
      console.error('Failed to load Eruda:', error);
      this.updateTooltip('Failed to load Eruda');
      
      // Show error feedback
      this.button.style.background = 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)';
      setTimeout(() => {
        this.button.style.background = '';
      }, 2000);
    } finally {
      this.button.classList.remove('loading');
    }
  }

  loadScript(src) {
    return new Promise((resolve, reject) => {
      // Check if script already exists
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) {
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  setupErudaListeners() {
    // Monitor Eruda visibility changes
    if (window.eruda && window.eruda._devTools) {
      const devTools = window.eruda._devTools;
      
      // Override show/hide methods to update button state
      const originalShow = devTools.show.bind(devTools);
      const originalHide = devTools.hide.bind(devTools);
      
      devTools.show = () => {
        originalShow();
        this.isErudaOpen = true;
        this.button.classList.add('eruda-open');
        this.updateTooltip('Click to close Eruda Console');
      };
      
      devTools.hide = () => {
        originalHide();
        this.isErudaOpen = false;
        this.button.classList.remove('eruda-open');
        this.updateTooltip('Click to open Eruda Console');
      };
    }
  }

  updateTooltip(text) {
    const tooltip = this.button.querySelector('.eruda-btn-tooltip');
    if (tooltip) {
      tooltip.textContent = text;
    }
  }

  destroy() {
    if (this.button) {
      this.button.remove();
    }
    
    const styles = document.getElementById('eruda-floating-button-styles');
    if (styles) {
      styles.remove();
    }
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.floatingErudaButton = new FloatingErudaButton();
  });
} else {
  window.floatingErudaButton = new FloatingErudaButton();
}

// Export for manual initialization
window.FloatingErudaButton = FloatingErudaButton;