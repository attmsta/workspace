// Injected script for enhanced page monitoring and context extraction
(function() {
  'use strict';

  class PageContextExtractor {
    constructor() {
      this.originalConsole = {};
      this.originalFetch = window.fetch;
      this.originalXHR = window.XMLHttpRequest;
      this.eventListeners = new Map();
      this.performanceEntries = [];
      this.sendQueue = [];
      this.sendTimeout = null;
      
      this.init();
    }

    init() {
      this.interceptConsole();
      this.interceptNetworkRequests();
      this.monitorPerformance();
      this.trackEventListeners();
      this.monitorErrors();
      this.extractInitialContext();
    }

    interceptConsole() {
      const methods = ['log', 'warn', 'error', 'info', 'debug'];
      
      methods.forEach(method => {
        this.originalConsole[method] = console[method];
        console[method] = (...args) => {
          // Call original method
          this.originalConsole[method].apply(console, args);
          
          // Send to extension
          this.sendToExtension('console_output', {
            level: method,
            args: args.map(arg => this.serializeValue(arg)),
            timestamp: Date.now(),
            stack: new Error().stack
          });
        };
      });
    }

    interceptNetworkRequests() {
      // Intercept fetch
      window.fetch = async (...args) => {
        const startTime = performance.now();
        const request = new Request(...args);
        
        try {
          const response = await this.originalFetch(...args);
          const endTime = performance.now();
          
          // Clone response to read body without consuming it
          const responseClone = response.clone();
          let responseBody = null;
          
          try {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              responseBody = await responseClone.json();
            } else if (contentType && contentType.includes('text/')) {
              responseBody = await responseClone.text();
            }
          } catch (e) {
            // Body reading failed, skip it
          }

          this.sendToExtension('network_request', {
            url: request.url,
            method: request.method,
            headers: Object.fromEntries(request.headers.entries()),
            body: await this.getRequestBody(request),
            response: {
              status: response.status,
              statusText: response.statusText,
              headers: Object.fromEntries(response.headers.entries()),
              body: responseBody
            },
            duration: endTime - startTime,
            timestamp: Date.now()
          });

          return response;
        } catch (error) {
          const endTime = performance.now();
          
          this.sendToExtension('network_error', {
            url: request.url,
            method: request.method,
            error: error.message,
            duration: endTime - startTime,
            timestamp: Date.now()
          });
          
          throw error;
        }
      };

      // Intercept XMLHttpRequest
      const originalOpen = this.originalXHR.prototype.open;
      const originalSend = this.originalXHR.prototype.send;
      
      this.originalXHR.prototype.open = function(method, url, ...args) {
        this._requestData = { method, url, startTime: performance.now() };
        return originalOpen.call(this, method, url, ...args);
      };

      this.originalXHR.prototype.send = function(body) {
        const xhr = this;
        
        xhr.addEventListener('loadend', function() {
          const endTime = performance.now();
          
          window.pageContextExtractor.sendToExtension('xhr_request', {
            url: xhr._requestData.url,
            method: xhr._requestData.method,
            requestBody: body,
            response: {
              status: xhr.status,
              statusText: xhr.statusText,
              headers: xhr.getAllResponseHeaders(),
              body: xhr.responseText
            },
            duration: endTime - xhr._requestData.startTime,
            timestamp: Date.now()
          });
        });

        return originalSend.call(this, body);
      };
    }

    async getRequestBody(request) {
      try {
        const cloned = request.clone();
        const body = await cloned.text();
        return body;
      } catch (e) {
        return null;
      }
    }

    monitorPerformance() {
      // Monitor performance entries
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          this.sendToExtension('performance_entry', {
            name: entry.name,
            entryType: entry.entryType,
            startTime: entry.startTime,
            duration: entry.duration,
            timestamp: Date.now()
          });
        });
      });

      observer.observe({ entryTypes: ['navigation', 'resource', 'measure', 'mark'] });
    }

    trackEventListeners() {
      const originalAddEventListener = EventTarget.prototype.addEventListener;
      const originalRemoveEventListener = EventTarget.prototype.removeEventListener;
      
      EventTarget.prototype.addEventListener = function(type, listener, options) {
        // Track the listener
        const target = this;
        const key = `${target.constructor.name}_${type}`;
        
        if (!window.pageContextExtractor.eventListeners.has(key)) {
          window.pageContextExtractor.eventListeners.set(key, []);
        }
        
        window.pageContextExtractor.eventListeners.get(key).push({
          type,
          listener: listener.toString().substring(0, 200),
          options,
          target: window.pageContextExtractor.getElementInfo(target),
          timestamp: Date.now()
        });

        return originalAddEventListener.call(this, type, listener, options);
      };

      EventTarget.prototype.removeEventListener = function(type, listener, options) {
        // Could track removal here if needed
        return originalRemoveEventListener.call(this, type, listener, options);
      };
    }

    monitorErrors() {
      window.addEventListener('error', (event) => {
        this.sendToExtension('javascript_error', {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          error: event.error ? event.error.stack : null,
          timestamp: Date.now()
        });
      });

      window.addEventListener('unhandledrejection', (event) => {
        this.sendToExtension('promise_rejection', {
          reason: event.reason ? event.reason.toString() : 'Unknown',
          stack: event.reason && event.reason.stack ? event.reason.stack : null,
          timestamp: Date.now()
        });
      });
    }

    extractInitialContext() {
      // Extract comprehensive page context
      const context = {
        page: {
          url: window.location.href,
          title: document.title,
          referrer: document.referrer,
          userAgent: navigator.userAgent,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight
          }
        },
        dom: {
          nodeCount: document.querySelectorAll('*').length,
          forms: this.extractForms(),
          inputs: this.extractInputs(),
          links: this.extractLinks(),
          images: this.extractImages(),
          scripts: this.extractScriptTags(),
          styles: this.extractStyleTags()
        },
        javascript: {
          globals: this.extractGlobalVariables(),
          functions: this.extractGlobalFunctions(),
          frameworks: this.detectFrameworks()
        },
        storage: {
          localStorage: this.extractLocalStorage(),
          sessionStorage: this.extractSessionStorage(),
          cookies: this.extractCookies()
        },
        timing: performance.timing ? {
          navigationStart: performance.timing.navigationStart,
          domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
          loadComplete: performance.timing.loadEventEnd - performance.timing.navigationStart
        } : null
      };

      this.sendToExtension('initial_context', context);
    }

    extractForms() {
      return Array.from(document.forms).map(form => ({
        id: form.id,
        name: form.name,
        action: form.action,
        method: form.method,
        fieldCount: form.elements.length,
        fields: Array.from(form.elements).map(el => ({
          name: el.name,
          type: el.type,
          required: el.required
        }))
      }));
    }

    extractInputs() {
      return Array.from(document.querySelectorAll('input, textarea, select')).map(input => ({
        type: input.type,
        name: input.name,
        id: input.id,
        placeholder: input.placeholder,
        required: input.required,
        value: input.type === 'password' ? '[HIDDEN]' : input.value?.substring(0, 100)
      }));
    }

    extractLinks() {
      return Array.from(document.links).map(link => ({
        href: link.href,
        text: link.textContent?.substring(0, 100),
        target: link.target,
        rel: link.rel
      }));
    }

    extractImages() {
      return Array.from(document.images).map(img => ({
        src: img.src,
        alt: img.alt,
        width: img.width,
        height: img.height,
        loading: img.loading
      }));
    }

    extractScriptTags() {
      return Array.from(document.scripts).map(script => ({
        src: script.src,
        type: script.type,
        async: script.async,
        defer: script.defer,
        inline: !script.src,
        content: script.src ? null : script.textContent?.substring(0, 500)
      }));
    }

    extractStyleTags() {
      return Array.from(document.querySelectorAll('style, link[rel="stylesheet"]')).map(style => ({
        type: style.tagName.toLowerCase(),
        href: style.href,
        media: style.media,
        inline: style.tagName === 'STYLE',
        content: style.tagName === 'STYLE' ? style.textContent?.substring(0, 500) : null
      }));
    }

    extractGlobalVariables() {
      const globals = {};
      const commonGlobals = ['window', 'document', 'console', 'navigator', 'location', 'history'];
      
      for (const key in window) {
        if (!commonGlobals.includes(key) && typeof window[key] !== 'function') {
          try {
            const value = window[key];
            globals[key] = this.serializeValue(value, 2); // Limit depth
          } catch (e) {
            globals[key] = '[Error accessing property]';
          }
        }
      }
      
      return globals;
    }

    extractGlobalFunctions() {
      const functions = [];
      
      for (const key in window) {
        if (typeof window[key] === 'function' && !key.startsWith('webkit')) {
          functions.push({
            name: key,
            signature: window[key].toString().substring(0, 200)
          });
        }
      }
      
      return functions;
    }

    detectFrameworks() {
      const frameworks = [];
      
      // Common framework detection
      if (window.React) frameworks.push('React');
      if (window.Vue) frameworks.push('Vue.js');
      if (window.angular) frameworks.push('AngularJS');
      if (window.ng) frameworks.push('Angular');
      if (window.jQuery || window.$) frameworks.push('jQuery');
      if (window.Backbone) frameworks.push('Backbone.js');
      if (window.Ember) frameworks.push('Ember.js');
      if (window.Svelte) frameworks.push('Svelte');
      
      return frameworks;
    }

    extractLocalStorage() {
      const storage = {};
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          storage[key] = localStorage.getItem(key)?.substring(0, 200);
        }
      } catch (e) {
        // localStorage not available
      }
      return storage;
    }

    extractSessionStorage() {
      const storage = {};
      try {
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          storage[key] = sessionStorage.getItem(key)?.substring(0, 200);
        }
      } catch (e) {
        // sessionStorage not available
      }
      return storage;
    }

    extractCookies() {
      return document.cookie.split(';').map(cookie => {
        const [name, value] = cookie.trim().split('=');
        return { name, value: value?.substring(0, 100) };
      });
    }

    getElementInfo(element) {
      if (!element || element.nodeType !== 1) return null;
      
      return {
        tagName: element.tagName,
        id: element.id,
        className: element.className,
        textContent: element.textContent?.substring(0, 100)
      };
    }

    serializeValue(value, maxDepth = 3, currentDepth = 0) {
      if (currentDepth >= maxDepth) return '[Max depth reached]';
      
      if (value === null) return null;
      if (value === undefined) return undefined;
      
      const type = typeof value;
      
      if (type === 'string' || type === 'number' || type === 'boolean') {
        return type === 'string' && value.length > 200 ? value.substring(0, 200) + '...' : value;
      }
      
      if (type === 'function') {
        return `[Function: ${value.name || 'anonymous'}]`;
      }
      
      if (value instanceof Error) {
        return {
          name: value.name,
          message: value.message,
          stack: value.stack
        };
      }
      
      if (Array.isArray(value)) {
        return value.slice(0, 10).map(item => this.serializeValue(item, maxDepth, currentDepth + 1));
      }
      
      if (type === 'object') {
        const serialized = {};
        const keys = Object.keys(value).slice(0, 20); // Limit number of properties
        
        for (const key of keys) {
          try {
            serialized[key] = this.serializeValue(value[key], maxDepth, currentDepth + 1);
          } catch (e) {
            serialized[key] = '[Error accessing property]';
          }
        }
        
        return serialized;
      }
      
      return String(value);
    }

    sendToExtension(type, data) {
      // Queue the message for batched sending
      this.sendQueue.push({
        source: 'eruda-ai-injected',
        type,
        data,
        timestamp: Date.now()
      });

      // Debounce sending to avoid overwhelming the content script
      if (this.sendTimeout) {
        clearTimeout(this.sendTimeout);
      }

      this.sendTimeout = setTimeout(() => {
        this.flushSendQueue();
      }, 100); // Send batched messages every 100ms
    }

    flushSendQueue() {
      if (this.sendQueue.length === 0) return;

      // Send all queued messages
      this.sendQueue.forEach(message => {
        window.postMessage(message, '*');
      });

      // Clear the queue
      this.sendQueue = [];
      this.sendTimeout = null;
    }
  }

  // Initialize the context extractor
  window.pageContextExtractor = new PageContextExtractor();
})();