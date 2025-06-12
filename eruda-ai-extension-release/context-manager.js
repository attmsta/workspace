/**
 * Advanced Context Management System
 * Handles intelligent context filtering, categorization, and organization
 */

class ContextManager {
  constructor() {
    this.contexts = new Map();
    this.categories = {
      HTML: { weight: 0.8, color: '#e74c3c', icon: '🏗️' },
      CSS: { weight: 0.7, color: '#3498db', icon: '🎨' },
      JAVASCRIPT: { weight: 0.9, color: '#f39c12', icon: '⚡' },
      NETWORK: { weight: 0.6, color: '#27ae60', icon: '🌐' },
      CONSOLE: { weight: 0.8, color: '#9b59b6', icon: '🐛' },
      PERFORMANCE: { weight: 0.7, color: '#e67e22', icon: '📊' },
      ACCESSIBILITY: { weight: 0.6, color: '#1abc9c', icon: '♿' },
      SECURITY: { weight: 0.8, color: '#c0392b', icon: '🔒' }
    };
    this.maxContextAge = 24 * 60 * 60 * 1000; // 24 hours
    this.maxContextItems = 1000;
  }

  /**
   * Capture and categorize page context
   */
  async captureContext(tabId = null) {
    const timestamp = Date.now();
    const url = window.location.href;
    const title = document.title;

    const context = {
      id: `context_${timestamp}`,
      timestamp,
      url,
      title,
      categories: {},
      relevanceScore: 0,
      bookmarked: false
    };

    // Capture different types of context
    context.categories.HTML = await this.captureHTMLContext();
    context.categories.CSS = await this.captureCSSContext();
    context.categories.JAVASCRIPT = await this.captureJavaScriptContext();
    context.categories.NETWORK = await this.captureNetworkContext();
    context.categories.CONSOLE = await this.captureConsoleContext();
    context.categories.PERFORMANCE = await this.capturePerformanceContext();
    context.categories.ACCESSIBILITY = await this.captureAccessibilityContext();
    context.categories.SECURITY = await this.captureSecurityContext();

    // Calculate overall relevance score
    context.relevanceScore = this.calculateRelevanceScore(context);

    // Store context
    this.contexts.set(context.id, context);

    // Cleanup old contexts
    await this.cleanupOldContexts();

    return context;
  }

  /**
   * Capture HTML structure and content
   */
  async captureHTMLContext() {
    const html = {
      elements: [],
      structure: {},
      metadata: {},
      issues: []
    };

    try {
      // Document structure
      html.structure = {
        doctype: document.doctype ? document.doctype.name : 'unknown',
        lang: document.documentElement.lang || 'not-specified',
        charset: document.characterSet,
        title: document.title,
        headElements: document.head.children.length,
        bodyElements: document.body.children.length
      };

      // Meta information
      const metaTags = Array.from(document.querySelectorAll('meta'));
      html.metadata = {
        viewport: metaTags.find(m => m.name === 'viewport')?.content || 'not-set',
        description: metaTags.find(m => m.name === 'description')?.content || 'not-set',
        keywords: metaTags.find(m => m.name === 'keywords')?.content || 'not-set',
        author: metaTags.find(m => m.name === 'author')?.content || 'not-set'
      };

      // Key elements
      html.elements = [
        { type: 'headings', count: document.querySelectorAll('h1,h2,h3,h4,h5,h6').length },
        { type: 'links', count: document.querySelectorAll('a[href]').length },
        { type: 'images', count: document.querySelectorAll('img').length },
        { type: 'forms', count: document.querySelectorAll('form').length },
        { type: 'inputs', count: document.querySelectorAll('input,textarea,select').length },
        { type: 'scripts', count: document.querySelectorAll('script').length },
        { type: 'stylesheets', count: document.querySelectorAll('link[rel="stylesheet"]').length }
      ];

      // Common issues
      if (!html.structure.lang || html.structure.lang === 'not-specified') {
        html.issues.push('Missing or unspecified document language');
      }
      if (html.metadata.viewport === 'not-set') {
        html.issues.push('Missing viewport meta tag');
      }
      if (html.metadata.description === 'not-set') {
        html.issues.push('Missing meta description');
      }

    } catch (error) {
      html.issues.push(`HTML analysis error: ${error.message}`);
    }

    return html;
  }

  /**
   * Capture CSS styles and computed styles
   */
  async captureCSSContext() {
    const css = {
      stylesheets: [],
      computedStyles: {},
      customProperties: [],
      issues: []
    };

    try {
      // External stylesheets
      const stylesheets = Array.from(document.styleSheets);
      css.stylesheets = stylesheets.map(sheet => ({
        href: sheet.href || 'inline',
        rules: sheet.cssRules ? sheet.cssRules.length : 0,
        disabled: sheet.disabled
      }));

      // CSS custom properties (variables)
      const rootStyles = getComputedStyle(document.documentElement);
      css.customProperties = Array.from(rootStyles).filter(prop => prop.startsWith('--'));

      // Common computed styles for body
      const bodyStyles = getComputedStyle(document.body);
      css.computedStyles = {
        fontFamily: bodyStyles.fontFamily,
        fontSize: bodyStyles.fontSize,
        lineHeight: bodyStyles.lineHeight,
        color: bodyStyles.color,
        backgroundColor: bodyStyles.backgroundColor
      };

      // Check for common issues
      if (css.stylesheets.length === 0) {
        css.issues.push('No external stylesheets detected');
      }

    } catch (error) {
      css.issues.push(`CSS analysis error: ${error.message}`);
    }

    return css;
  }

  /**
   * Capture JavaScript context and errors
   */
  async captureJavaScriptContext() {
    const js = {
      frameworks: [],
      libraries: [],
      globals: [],
      errors: [],
      performance: {}
    };

    try {
      // Detect common frameworks and libraries
      const detections = {
        'React': () => window.React || document.querySelector('[data-reactroot]'),
        'Vue': () => window.Vue || document.querySelector('[data-v-]'),
        'Angular': () => window.angular || window.ng || document.querySelector('[ng-app]'),
        'jQuery': () => window.jQuery || window.$,
        'Lodash': () => window._ && window._.VERSION,
        'Moment': () => window.moment,
        'D3': () => window.d3,
        'Three.js': () => window.THREE,
        'Bootstrap': () => window.bootstrap || document.querySelector('.bootstrap'),
        'Tailwind': () => document.querySelector('[class*="tw-"]') || document.querySelector('[class*="tailwind"]')
      };

      for (const [name, detect] of Object.entries(detections)) {
        if (detect()) {
          js.frameworks.push(name);
        }
      }

      // Global variables (sample)
      js.globals = Object.keys(window).filter(key => 
        !['window', 'document', 'navigator', 'location', 'history'].includes(key) &&
        typeof window[key] !== 'function'
      ).slice(0, 20);

      // Performance metrics
      if (window.performance) {
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
          js.performance = {
            domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart),
            loadComplete: Math.round(navigation.loadEventEnd - navigation.loadEventStart),
            firstPaint: 0,
            firstContentfulPaint: 0
          };

          // Paint metrics
          const paintEntries = performance.getEntriesByType('paint');
          paintEntries.forEach(entry => {
            if (entry.name === 'first-paint') {
              js.performance.firstPaint = Math.round(entry.startTime);
            } else if (entry.name === 'first-contentful-paint') {
              js.performance.firstContentfulPaint = Math.round(entry.startTime);
            }
          });
        }
      }

    } catch (error) {
      js.errors.push(`JavaScript analysis error: ${error.message}`);
    }

    return js;
  }

  /**
   * Capture network requests and resources
   */
  async captureNetworkContext() {
    const network = {
      resources: [],
      requests: [],
      performance: {},
      issues: []
    };

    try {
      if (window.performance) {
        // Resource timing
        const resources = performance.getEntriesByType('resource');
        network.resources = resources.map(resource => ({
          name: resource.name.split('/').pop() || resource.name,
          type: resource.initiatorType,
          size: resource.transferSize || 0,
          duration: Math.round(resource.duration),
          cached: resource.transferSize === 0 && resource.decodedBodySize > 0
        })).slice(0, 50); // Limit to 50 resources

        // Performance summary
        const totalSize = network.resources.reduce((sum, r) => sum + r.size, 0);
        const avgDuration = network.resources.length > 0 
          ? network.resources.reduce((sum, r) => sum + r.duration, 0) / network.resources.length 
          : 0;

        network.performance = {
          totalResources: network.resources.length,
          totalSize: Math.round(totalSize / 1024), // KB
          averageDuration: Math.round(avgDuration),
          cachedResources: network.resources.filter(r => r.cached).length
        };

        // Check for issues
        if (totalSize > 5 * 1024 * 1024) { // 5MB
          network.issues.push('Large total resource size detected');
        }
        if (avgDuration > 1000) {
          network.issues.push('Slow average resource load time');
        }
      }

    } catch (error) {
      network.issues.push(`Network analysis error: ${error.message}`);
    }

    return network;
  }

  /**
   * Capture console messages and errors
   */
  async captureConsoleContext() {
    const console = {
      errors: [],
      warnings: [],
      logs: [],
      summary: {}
    };

    try {
      // This would need to be enhanced with actual console monitoring
      // For now, we'll capture basic error information
      
      // Check for common error indicators
      const errorElements = document.querySelectorAll('[data-error], .error, .alert-danger');
      if (errorElements.length > 0) {
        console.errors.push(`${errorElements.length} error elements found on page`);
      }

      // Check for missing resources (404s)
      const brokenImages = Array.from(document.querySelectorAll('img')).filter(img => !img.complete || img.naturalWidth === 0);
      if (brokenImages.length > 0) {
        console.errors.push(`${brokenImages.length} broken images detected`);
      }

      console.summary = {
        errorCount: console.errors.length,
        warningCount: console.warnings.length,
        logCount: console.logs.length
      };

    } catch (error) {
      console.errors.push(`Console analysis error: ${error.message}`);
    }

    return console;
  }

  /**
   * Capture performance metrics
   */
  async capturePerformanceContext() {
    const perf = {
      metrics: {},
      vitals: {},
      recommendations: [],
      issues: []
    };

    try {
      if (window.performance) {
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
          perf.metrics = {
            dns: Math.round(navigation.domainLookupEnd - navigation.domainLookupStart),
            tcp: Math.round(navigation.connectEnd - navigation.connectStart),
            request: Math.round(navigation.responseStart - navigation.requestStart),
            response: Math.round(navigation.responseEnd - navigation.responseStart),
            domParsing: Math.round(navigation.domContentLoadedEventStart - navigation.responseEnd),
            domReady: Math.round(navigation.domContentLoadedEventEnd - navigation.navigationStart),
            pageLoad: Math.round(navigation.loadEventEnd - navigation.navigationStart)
          };

          // Performance recommendations
          if (perf.metrics.pageLoad > 3000) {
            perf.recommendations.push('Page load time is slow (>3s)');
          }
          if (perf.metrics.domParsing > 1000) {
            perf.recommendations.push('DOM parsing is slow (>1s)');
          }
        }

        // Memory usage (if available)
        if (performance.memory) {
          perf.vitals.memory = {
            used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024), // MB
            total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024), // MB
            limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024) // MB
          };
        }
      }

    } catch (error) {
      perf.issues.push(`Performance analysis error: ${error.message}`);
    }

    return perf;
  }

  /**
   * Capture accessibility information
   */
  async captureAccessibilityContext() {
    const a11y = {
      checks: {},
      issues: [],
      recommendations: []
    };

    try {
      // Basic accessibility checks
      a11y.checks = {
        hasLang: !!document.documentElement.lang,
        hasTitle: !!document.title && document.title.trim().length > 0,
        hasHeadings: document.querySelectorAll('h1,h2,h3,h4,h5,h6').length > 0,
        hasAltText: Array.from(document.querySelectorAll('img')).every(img => img.alt !== undefined),
        hasLabels: Array.from(document.querySelectorAll('input,textarea,select')).every(input => 
          input.labels?.length > 0 || input.getAttribute('aria-label') || input.getAttribute('aria-labelledby')
        ),
        hasSkipLinks: document.querySelectorAll('a[href^="#"]').length > 0,
        hasLandmarks: document.querySelectorAll('main,nav,header,footer,aside,section').length > 0
      };

      // Generate issues and recommendations
      if (!a11y.checks.hasLang) {
        a11y.issues.push('Missing document language attribute');
        a11y.recommendations.push('Add lang attribute to html element');
      }
      if (!a11y.checks.hasTitle) {
        a11y.issues.push('Missing or empty page title');
        a11y.recommendations.push('Add descriptive page title');
      }
      if (!a11y.checks.hasHeadings) {
        a11y.issues.push('No heading elements found');
        a11y.recommendations.push('Add heading structure for better navigation');
      }
      if (!a11y.checks.hasAltText) {
        a11y.issues.push('Images missing alt text');
        a11y.recommendations.push('Add alt attributes to all images');
      }
      if (!a11y.checks.hasLabels) {
        a11y.issues.push('Form inputs missing labels');
        a11y.recommendations.push('Add labels or aria-label to form inputs');
      }

    } catch (error) {
      a11y.issues.push(`Accessibility analysis error: ${error.message}`);
    }

    return a11y;
  }

  /**
   * Capture security-related information
   */
  async captureSecurityContext() {
    const security = {
      protocol: {},
      headers: {},
      content: {},
      issues: [],
      recommendations: []
    };

    try {
      // Protocol information
      security.protocol = {
        isHTTPS: location.protocol === 'https:',
        protocol: location.protocol,
        port: location.port || (location.protocol === 'https:' ? '443' : '80')
      };

      // Content security
      security.content = {
        hasCSP: !!document.querySelector('meta[http-equiv="Content-Security-Policy"]'),
        hasInlineScripts: document.querySelectorAll('script:not([src])').length > 0,
        hasInlineStyles: document.querySelectorAll('style').length > 0,
        externalScripts: document.querySelectorAll('script[src]').length,
        externalStyles: document.querySelectorAll('link[rel="stylesheet"]').length
      };

      // Security issues
      if (!security.protocol.isHTTPS) {
        security.issues.push('Page not served over HTTPS');
        security.recommendations.push('Use HTTPS for secure communication');
      }
      if (!security.content.hasCSP) {
        security.issues.push('No Content Security Policy detected');
        security.recommendations.push('Implement Content Security Policy');
      }
      if (security.content.hasInlineScripts) {
        security.issues.push('Inline scripts detected');
        security.recommendations.push('Move scripts to external files');
      }

    } catch (error) {
      security.issues.push(`Security analysis error: ${error.message}`);
    }

    return security;
  }

  /**
   * Calculate relevance score for context
   */
  calculateRelevanceScore(context) {
    let score = 0;
    let totalWeight = 0;

    for (const [category, data] of Object.entries(context.categories)) {
      if (this.categories[category]) {
        const weight = this.categories[category].weight;
        let categoryScore = 0;

        // Calculate category-specific scores
        switch (category) {
          case 'JAVASCRIPT':
            categoryScore = (data.frameworks.length * 0.3) + 
                          (data.errors.length > 0 ? 0.5 : 0) +
                          (Object.keys(data.performance).length > 0 ? 0.2 : 0);
            break;
          case 'HTML':
            categoryScore = (data.issues.length > 0 ? 0.4 : 0) +
                          (data.elements.length * 0.1) +
                          (Object.keys(data.metadata).length * 0.05);
            break;
          case 'CONSOLE':
            categoryScore = data.summary.errorCount * 0.5 + data.summary.warningCount * 0.3;
            break;
          case 'PERFORMANCE':
            categoryScore = (data.recommendations.length * 0.3) + 
                          (data.issues.length * 0.4) +
                          (Object.keys(data.metrics).length * 0.1);
            break;
          case 'ACCESSIBILITY':
            categoryScore = data.issues.length * 0.4 + data.recommendations.length * 0.2;
            break;
          case 'SECURITY':
            categoryScore = data.issues.length * 0.5 + data.recommendations.length * 0.2;
            break;
          default:
            categoryScore = 0.5; // Default moderate relevance
        }

        score += Math.min(categoryScore, 1) * weight;
        totalWeight += weight;
      }
    }

    return totalWeight > 0 ? Math.min(score / totalWeight, 1) : 0;
  }

  /**
   * Search contexts by content and relevance
   */
  searchContexts(query, options = {}) {
    const {
      categories = Object.keys(this.categories),
      minRelevance = 0,
      maxResults = 10,
      sortBy = 'relevance' // 'relevance', 'timestamp', 'url'
    } = options;

    const results = [];
    const queryLower = query.toLowerCase();

    for (const context of this.contexts.values()) {
      if (context.relevanceScore < minRelevance) continue;

      let matchScore = 0;

      // Search in URL and title
      if (context.url.toLowerCase().includes(queryLower)) matchScore += 0.3;
      if (context.title.toLowerCase().includes(queryLower)) matchScore += 0.3;

      // Search in category data
      for (const category of categories) {
        if (context.categories[category]) {
          const categoryData = JSON.stringify(context.categories[category]).toLowerCase();
          if (categoryData.includes(queryLower)) {
            matchScore += this.categories[category]?.weight || 0.5;
          }
        }
      }

      if (matchScore > 0) {
        results.push({
          ...context,
          matchScore: matchScore * context.relevanceScore
        });
      }
    }

    // Sort results
    results.sort((a, b) => {
      switch (sortBy) {
        case 'timestamp':
          return b.timestamp - a.timestamp;
        case 'url':
          return a.url.localeCompare(b.url);
        case 'relevance':
        default:
          return b.matchScore - a.matchScore;
      }
    });

    return results.slice(0, maxResults);
  }

  /**
   * Get context summary for AI
   */
  getContextSummary(contextId, categories = null) {
    const context = this.contexts.get(contextId);
    if (!context) return null;

    const summary = {
      url: context.url,
      title: context.title,
      timestamp: context.timestamp,
      relevanceScore: context.relevanceScore,
      categories: {}
    };

    const categoriesToInclude = categories || Object.keys(context.categories);

    for (const category of categoriesToInclude) {
      if (context.categories[category]) {
        summary.categories[category] = this.summarizeCategory(category, context.categories[category]);
      }
    }

    return summary;
  }

  /**
   * Summarize category data for AI consumption
   */
  summarizeCategory(category, data) {
    switch (category) {
      case 'HTML':
        return {
          structure: data.structure,
          elementCounts: data.elements,
          issues: data.issues.slice(0, 5)
        };
      case 'JAVASCRIPT':
        return {
          frameworks: data.frameworks,
          performance: data.performance,
          errors: data.errors.slice(0, 3)
        };
      case 'CONSOLE':
        return data.summary;
      case 'PERFORMANCE':
        return {
          metrics: data.metrics,
          recommendations: data.recommendations.slice(0, 3)
        };
      case 'ACCESSIBILITY':
        return {
          checks: data.checks,
          issues: data.issues.slice(0, 3)
        };
      case 'SECURITY':
        return {
          protocol: data.protocol,
          issues: data.issues.slice(0, 3)
        };
      default:
        return data;
    }
  }

  /**
   * Bookmark a context
   */
  bookmarkContext(contextId, bookmark = true) {
    const context = this.contexts.get(contextId);
    if (context) {
      context.bookmarked = bookmark;
      return true;
    }
    return false;
  }

  /**
   * Get bookmarked contexts
   */
  getBookmarkedContexts() {
    return Array.from(this.contexts.values()).filter(context => context.bookmarked);
  }

  /**
   * Clean up old contexts
   */
  async cleanupOldContexts() {
    const now = Date.now();
    const contextsToDelete = [];

    for (const [id, context] of this.contexts.entries()) {
      if (!context.bookmarked && (now - context.timestamp) > this.maxContextAge) {
        contextsToDelete.push(id);
      }
    }

    // If we still have too many contexts, remove oldest non-bookmarked ones
    if (this.contexts.size > this.maxContextItems) {
      const sortedContexts = Array.from(this.contexts.entries())
        .filter(([id, context]) => !context.bookmarked)
        .sort(([, a], [, b]) => a.timestamp - b.timestamp);

      const excessCount = this.contexts.size - this.maxContextItems;
      for (let i = 0; i < Math.min(excessCount, sortedContexts.length); i++) {
        contextsToDelete.push(sortedContexts[i][0]);
      }
    }

    // Delete contexts
    for (const id of contextsToDelete) {
      this.contexts.delete(id);
    }

    return contextsToDelete.length;
  }

  /**
   * Export contexts for backup or analysis
   */
  exportContexts(options = {}) {
    const {
      includeBookmarked = true,
      includeRecent = true,
      recentHours = 24,
      categories = null
    } = options;

    const now = Date.now();
    const recentThreshold = now - (recentHours * 60 * 60 * 1000);

    const contexts = Array.from(this.contexts.values()).filter(context => {
      if (includeBookmarked && context.bookmarked) return true;
      if (includeRecent && context.timestamp > recentThreshold) return true;
      return false;
    });

    return {
      exportDate: new Date().toISOString(),
      contextCount: contexts.length,
      categories: categories || Object.keys(this.categories),
      contexts: contexts.map(context => ({
        ...context,
        categories: categories 
          ? Object.fromEntries(Object.entries(context.categories).filter(([cat]) => categories.includes(cat)))
          : context.categories
      }))
    };
  }

  /**
   * Get context statistics
   */
  getStats() {
    const contexts = Array.from(this.contexts.values());
    const now = Date.now();
    const hourAgo = now - (60 * 60 * 1000);
    const dayAgo = now - (24 * 60 * 60 * 1000);

    return {
      total: contexts.length,
      bookmarked: contexts.filter(c => c.bookmarked).length,
      lastHour: contexts.filter(c => c.timestamp > hourAgo).length,
      lastDay: contexts.filter(c => c.timestamp > dayAgo).length,
      averageRelevance: contexts.length > 0 
        ? contexts.reduce((sum, c) => sum + c.relevanceScore, 0) / contexts.length 
        : 0,
      categories: Object.keys(this.categories).map(cat => ({
        name: cat,
        count: contexts.filter(c => c.categories[cat]).length,
        ...this.categories[cat]
      }))
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ContextManager;
} else if (typeof window !== 'undefined') {
  window.ContextManager = ContextManager;
}