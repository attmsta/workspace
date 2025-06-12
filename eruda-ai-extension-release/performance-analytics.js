// Performance Analytics System for Eruda AI Assistant
class PerformanceAnalytics {
  constructor() {
    this.metrics = {
      pageLoad: {},
      aiRequests: [],
      contextCapture: [],
      userInteractions: [],
      errors: [],
      resourceUsage: {}
    };
    
    this.observers = {
      performance: null,
      mutation: null,
      intersection: null
    };
    
    this.startTime = performance.now();
    this.isTracking = false;
    
    this.init();
  }

  async init() {
    await this.loadSettings();
    if (this.isTracking) {
      this.startTracking();
    }
  }

  async loadSettings() {
    try {
      const result = await chrome.storage.sync.get(['performanceTracking']);
      this.isTracking = result.performanceTracking !== false; // Default to true
    } catch (error) {
      console.warn('Could not load performance settings:', error);
      this.isTracking = true;
    }
  }

  startTracking() {
    this.trackPageLoad();
    this.trackResourceUsage();
    this.setupPerformanceObserver();
    this.trackUserInteractions();
    this.trackErrors();
    
    // Periodic data collection
    setInterval(() => this.collectMetrics(), 30000); // Every 30 seconds
  }

  trackPageLoad() {
    if (!window.performance) return;

    const navigation = performance.getEntriesByType('navigation')[0];
    if (navigation) {
      this.metrics.pageLoad = {
        timestamp: Date.now(),
        url: window.location.href,
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        firstPaint: this.getFirstPaint(),
        firstContentfulPaint: this.getFirstContentfulPaint(),
        largestContentfulPaint: this.getLargestContentfulPaint(),
        cumulativeLayoutShift: this.getCumulativeLayoutShift(),
        firstInputDelay: this.getFirstInputDelay(),
        timeToInteractive: this.getTimeToInteractive()
      };
    }
  }

  getFirstPaint() {
    const paintEntries = performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
    return firstPaint ? firstPaint.startTime : null;
  }

  getFirstContentfulPaint() {
    const paintEntries = performance.getEntriesByType('paint');
    const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    return fcp ? fcp.startTime : null;
  }

  getLargestContentfulPaint() {
    return new Promise((resolve) => {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        resolve(lastEntry ? lastEntry.startTime : null);
      }).observe({ entryTypes: ['largest-contentful-paint'] });
    });
  }

  getCumulativeLayoutShift() {
    return new Promise((resolve) => {
      let clsValue = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        resolve(clsValue);
      }).observe({ entryTypes: ['layout-shift'] });
    });
  }

  getFirstInputDelay() {
    return new Promise((resolve) => {
      new PerformanceObserver((list) => {
        const firstEntry = list.getEntries()[0];
        resolve(firstEntry ? firstEntry.processingStart - firstEntry.startTime : null);
      }).observe({ entryTypes: ['first-input'] });
    });
  }

  getTimeToInteractive() {
    // Simplified TTI calculation
    const navigation = performance.getEntriesByType('navigation')[0];
    if (navigation) {
      return navigation.domInteractive - navigation.navigationStart;
    }
    return null;
  }

  setupPerformanceObserver() {
    if (!window.PerformanceObserver) return;

    // Observe long tasks
    try {
      this.observers.performance = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'longtask') {
            this.trackLongTask(entry);
          } else if (entry.entryType === 'measure') {
            this.trackCustomMeasure(entry);
          }
        }
      });

      this.observers.performance.observe({ entryTypes: ['longtask', 'measure'] });
    } catch (error) {
      console.warn('Performance observer not supported:', error);
    }
  }

  trackLongTask(entry) {
    this.metrics.resourceUsage.longTasks = this.metrics.resourceUsage.longTasks || [];
    this.metrics.resourceUsage.longTasks.push({
      timestamp: Date.now(),
      duration: entry.duration,
      startTime: entry.startTime,
      attribution: entry.attribution
    });

    // Keep only recent long tasks
    if (this.metrics.resourceUsage.longTasks.length > 50) {
      this.metrics.resourceUsage.longTasks = this.metrics.resourceUsage.longTasks.slice(-25);
    }
  }

  trackCustomMeasure(entry) {
    if (entry.name.startsWith('eruda-ai-')) {
      this.metrics.aiRequests.push({
        timestamp: Date.now(),
        operation: entry.name,
        duration: entry.duration,
        startTime: entry.startTime
      });
    }
  }

  trackResourceUsage() {
    const updateResourceMetrics = () => {
      this.metrics.resourceUsage = {
        ...this.metrics.resourceUsage,
        timestamp: Date.now(),
        memory: this.getMemoryUsage(),
        cpu: this.getCPUUsage(),
        network: this.getNetworkUsage(),
        storage: this.getStorageUsage()
      };
    };

    updateResourceMetrics();
    setInterval(updateResourceMetrics, 60000); // Every minute
  }

  getMemoryUsage() {
    if (performance.memory) {
      return {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit,
        percentage: (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100
      };
    }
    return null;
  }

  getCPUUsage() {
    // Simplified CPU usage estimation based on long tasks
    const recentTasks = this.metrics.resourceUsage.longTasks || [];
    const now = Date.now();
    const recentTasksInLastMinute = recentTasks.filter(task => 
      now - task.timestamp < 60000
    );
    
    const totalTaskTime = recentTasksInLastMinute.reduce((sum, task) => sum + task.duration, 0);
    return {
      longTasksCount: recentTasksInLastMinute.length,
      totalBlockingTime: totalTaskTime,
      estimatedUsage: Math.min(100, (totalTaskTime / 60000) * 100)
    };
  }

  getNetworkUsage() {
    const resources = performance.getEntriesByType('resource');
    const totalSize = resources.reduce((sum, resource) => {
      return sum + (resource.transferSize || 0);
    }, 0);

    return {
      totalRequests: resources.length,
      totalSize: totalSize,
      averageSize: resources.length > 0 ? totalSize / resources.length : 0,
      slowRequests: resources.filter(r => r.duration > 1000).length
    };
  }

  getStorageUsage() {
    const storage = {
      localStorage: 0,
      sessionStorage: 0,
      indexedDB: 0
    };

    try {
      // Estimate localStorage usage
      let localStorageSize = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          localStorageSize += localStorage[key].length + key.length;
        }
      }
      storage.localStorage = localStorageSize;

      // Estimate sessionStorage usage
      let sessionStorageSize = 0;
      for (let key in sessionStorage) {
        if (sessionStorage.hasOwnProperty(key)) {
          sessionStorageSize += sessionStorage[key].length + key.length;
        }
      }
      storage.sessionStorage = sessionStorageSize;

      // IndexedDB usage would require more complex estimation
      storage.indexedDB = 'unknown';
    } catch (error) {
      console.warn('Could not estimate storage usage:', error);
    }

    return storage;
  }

  trackUserInteractions() {
    const interactionTypes = ['click', 'scroll', 'keydown', 'touchstart'];
    
    interactionTypes.forEach(type => {
      document.addEventListener(type, (event) => {
        this.recordInteraction(type, event);
      }, { passive: true });
    });
  }

  recordInteraction(type, event) {
    const interaction = {
      timestamp: Date.now(),
      type: type,
      target: event.target.tagName,
      targetId: event.target.id,
      targetClass: event.target.className,
      x: event.clientX,
      y: event.clientY
    };

    this.metrics.userInteractions.push(interaction);

    // Keep only recent interactions
    if (this.metrics.userInteractions.length > 100) {
      this.metrics.userInteractions = this.metrics.userInteractions.slice(-50);
    }
  }

  trackErrors() {
    window.addEventListener('error', (event) => {
      this.recordError({
        type: 'javascript',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error ? event.error.stack : null,
        timestamp: Date.now()
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.recordError({
        type: 'promise',
        message: event.reason.toString(),
        stack: event.reason.stack,
        timestamp: Date.now()
      });
    });
  }

  recordError(error) {
    this.metrics.errors.push(error);

    // Keep only recent errors
    if (this.metrics.errors.length > 50) {
      this.metrics.errors = this.metrics.errors.slice(-25);
    }
  }

  // AI-specific tracking methods
  trackAIRequest(operation, startTime) {
    performance.mark(`eruda-ai-${operation}-start`);
    return {
      end: () => {
        performance.mark(`eruda-ai-${operation}-end`);
        performance.measure(`eruda-ai-${operation}`, 
          `eruda-ai-${operation}-start`, 
          `eruda-ai-${operation}-end`);
      }
    };
  }

  trackContextCapture(contextType, size) {
    this.metrics.contextCapture.push({
      timestamp: Date.now(),
      type: contextType,
      size: size,
      duration: performance.now() - this.startTime
    });

    // Keep only recent captures
    if (this.metrics.contextCapture.length > 100) {
      this.metrics.contextCapture = this.metrics.contextCapture.slice(-50);
    }
  }

  collectMetrics() {
    // Update current metrics
    this.trackResourceUsage();
    
    // Store metrics periodically
    this.storeMetrics();
  }

  async storeMetrics() {
    try {
      const metricsToStore = {
        ...this.metrics,
        lastUpdated: Date.now(),
        sessionDuration: performance.now() - this.startTime
      };

      await chrome.storage.local.set({
        performanceMetrics: metricsToStore
      });
    } catch (error) {
      console.warn('Could not store performance metrics:', error);
    }
  }

  async getAnalytics() {
    try {
      const result = await chrome.storage.local.get(['performanceMetrics']);
      return result.performanceMetrics || this.metrics;
    } catch (error) {
      console.warn('Could not retrieve analytics:', error);
      return this.metrics;
    }
  }

  generateReport() {
    const report = {
      summary: this.generateSummary(),
      pagePerformance: this.analyzePagePerformance(),
      aiPerformance: this.analyzeAIPerformance(),
      userBehavior: this.analyzeUserBehavior(),
      issues: this.identifyIssues(),
      recommendations: this.generateRecommendations()
    };

    return report;
  }

  generateSummary() {
    const now = Date.now();
    const sessionDuration = (now - this.startTime) / 1000; // in seconds

    return {
      sessionDuration: sessionDuration,
      pageUrl: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: now,
      totalAIRequests: this.metrics.aiRequests.length,
      totalContextCaptures: this.metrics.contextCapture.length,
      totalErrors: this.metrics.errors.length,
      totalInteractions: this.metrics.userInteractions.length
    };
  }

  analyzePagePerformance() {
    const pageLoad = this.metrics.pageLoad;
    const resourceUsage = this.metrics.resourceUsage;

    return {
      loadTime: pageLoad.loadTime,
      firstContentfulPaint: pageLoad.firstContentfulPaint,
      largestContentfulPaint: pageLoad.largestContentfulPaint,
      cumulativeLayoutShift: pageLoad.cumulativeLayoutShift,
      memoryUsage: resourceUsage.memory,
      networkUsage: resourceUsage.network,
      performanceScore: this.calculatePerformanceScore(pageLoad)
    };
  }

  calculatePerformanceScore(pageLoad) {
    let score = 100;

    // Deduct points for slow metrics
    if (pageLoad.firstContentfulPaint > 2500) score -= 20;
    if (pageLoad.largestContentfulPaint > 4000) score -= 20;
    if (pageLoad.cumulativeLayoutShift > 0.25) score -= 20;
    if (pageLoad.firstInputDelay > 300) score -= 20;
    if (pageLoad.loadTime > 5000) score -= 20;

    return Math.max(0, score);
  }

  analyzeAIPerformance() {
    const aiRequests = this.metrics.aiRequests;
    
    if (aiRequests.length === 0) {
      return { message: 'No AI requests recorded yet' };
    }

    const durations = aiRequests.map(req => req.duration);
    const averageDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
    const maxDuration = Math.max(...durations);
    const minDuration = Math.min(...durations);

    return {
      totalRequests: aiRequests.length,
      averageResponseTime: averageDuration,
      maxResponseTime: maxDuration,
      minResponseTime: minDuration,
      requestsPerMinute: this.calculateRequestsPerMinute(aiRequests),
      slowRequests: aiRequests.filter(req => req.duration > 5000).length
    };
  }

  calculateRequestsPerMinute(requests) {
    if (requests.length === 0) return 0;
    
    const now = Date.now();
    const recentRequests = requests.filter(req => now - req.timestamp < 60000);
    return recentRequests.length;
  }

  analyzeUserBehavior() {
    const interactions = this.metrics.userInteractions;
    
    if (interactions.length === 0) {
      return { message: 'No user interactions recorded yet' };
    }

    const interactionTypes = {};
    interactions.forEach(interaction => {
      interactionTypes[interaction.type] = (interactionTypes[interaction.type] || 0) + 1;
    });

    return {
      totalInteractions: interactions.length,
      interactionTypes: interactionTypes,
      interactionsPerMinute: this.calculateInteractionsPerMinute(interactions),
      mostActiveElement: this.findMostActiveElement(interactions)
    };
  }

  calculateInteractionsPerMinute(interactions) {
    if (interactions.length === 0) return 0;
    
    const now = Date.now();
    const recentInteractions = interactions.filter(int => now - int.timestamp < 60000);
    return recentInteractions.length;
  }

  findMostActiveElement(interactions) {
    const elementCounts = {};
    interactions.forEach(interaction => {
      const key = `${interaction.target}${interaction.targetId ? '#' + interaction.targetId : ''}`;
      elementCounts[key] = (elementCounts[key] || 0) + 1;
    });

    const mostActive = Object.entries(elementCounts)
      .sort(([,a], [,b]) => b - a)[0];
    
    return mostActive ? { element: mostActive[0], count: mostActive[1] } : null;
  }

  identifyIssues() {
    const issues = [];

    // Performance issues
    if (this.metrics.pageLoad.loadTime > 5000) {
      issues.push({
        type: 'performance',
        severity: 'high',
        message: 'Page load time is very slow (>5s)',
        value: this.metrics.pageLoad.loadTime
      });
    }

    // Memory issues
    if (this.metrics.resourceUsage.memory && 
        this.metrics.resourceUsage.memory.percentage > 80) {
      issues.push({
        type: 'memory',
        severity: 'high',
        message: 'High memory usage detected',
        value: this.metrics.resourceUsage.memory.percentage
      });
    }

    // Error issues
    if (this.metrics.errors.length > 5) {
      issues.push({
        type: 'errors',
        severity: 'medium',
        message: 'Multiple JavaScript errors detected',
        value: this.metrics.errors.length
      });
    }

    // AI performance issues
    const slowAIRequests = this.metrics.aiRequests.filter(req => req.duration > 10000);
    if (slowAIRequests.length > 0) {
      issues.push({
        type: 'ai-performance',
        severity: 'medium',
        message: 'Slow AI response times detected',
        value: slowAIRequests.length
      });
    }

    return issues;
  }

  generateRecommendations() {
    const recommendations = [];
    const issues = this.identifyIssues();

    issues.forEach(issue => {
      switch (issue.type) {
        case 'performance':
          recommendations.push('Consider optimizing images, minifying CSS/JS, or using a CDN');
          break;
        case 'memory':
          recommendations.push('Check for memory leaks, reduce context size, or clean up old data');
          break;
        case 'errors':
          recommendations.push('Review and fix JavaScript errors to improve stability');
          break;
        case 'ai-performance':
          recommendations.push('Consider using a faster AI model or reducing context size');
          break;
      }
    });

    // General recommendations
    if (this.metrics.aiRequests.length > 20) {
      recommendations.push('Consider implementing request caching to improve performance');
    }

    if (this.metrics.contextCapture.length > 50) {
      recommendations.push('Regular context cleanup can improve performance');
    }

    return recommendations;
  }

  async exportAnalytics() {
    const report = this.generateReport();
    const exportData = {
      report: report,
      rawMetrics: this.metrics,
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };

    return exportData;
  }

  async clearAnalytics() {
    this.metrics = {
      pageLoad: {},
      aiRequests: [],
      contextCapture: [],
      userInteractions: [],
      errors: [],
      resourceUsage: {}
    };

    try {
      await chrome.storage.local.remove(['performanceMetrics']);
    } catch (error) {
      console.warn('Could not clear stored metrics:', error);
    }
  }
}

// Make PerformanceAnalytics available globally
window.PerformanceAnalytics = PerformanceAnalytics;