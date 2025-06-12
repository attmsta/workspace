// Specialized AI Tools for Eruda AI Assistant
class SpecializedAITools {
  constructor() {
    this.tools = new Map();
    this.activeTools = new Set();
    this.toolResults = new Map();
    
    this.initializeTools();
  }

  initializeTools() {
    // Debug Assistant Tool
    this.tools.set('debug-assistant', {
      id: 'debug-assistant',
      name: '🐛 Debug Assistant',
      description: 'Intelligent debugging workflows and error analysis',
      category: 'debugging',
      enabled: true,
      methods: {
        analyzeErrors: this.analyzeErrors.bind(this),
        suggestFixes: this.suggestFixes.bind(this),
        generateTests: this.generateTests.bind(this),
        traceExecution: this.traceExecution.bind(this)
      }
    });

    // Performance Optimizer Tool
    this.tools.set('performance-optimizer', {
      id: 'performance-optimizer',
      name: '⚡ Performance Optimizer',
      description: 'AI-powered performance analysis and optimization',
      category: 'performance',
      enabled: true,
      methods: {
        analyzeMetrics: this.analyzePerformanceMetrics.bind(this),
        identifyBottlenecks: this.identifyBottlenecks.bind(this),
        suggestOptimizations: this.suggestOptimizations.bind(this),
        generateReport: this.generatePerformanceReport.bind(this)
      }
    });

    // Enhanced Security Analyzer Tool
    this.tools.set('security-analyzer', {
      id: 'security-analyzer',
      name: '🔒 Enhanced Security Analyzer',
      description: 'Comprehensive cybersecurity analysis with AI-powered threat detection',
      category: 'security',
      enabled: true,
      methods: {
        scanVulnerabilities: this.scanVulnerabilities.bind(this),
        analyzeCSP: this.analyzeCSP.bind(this),
        checkHTTPS: this.checkHTTPS.bind(this),
        auditDependencies: this.auditDependencies.bind(this),
        runCybersecurityScan: this.runCybersecurityScan.bind(this),
        detectMalware: this.detectMalware.bind(this),
        auditPrivacyCompliance: this.auditPrivacyCompliance.bind(this),
        generatePentestPlan: this.generatePentestPlan.bind(this)
      }
    });

    // Accessibility Checker Tool
    this.tools.set('accessibility-checker', {
      id: 'accessibility-checker',
      name: '♿ Accessibility Checker',
      description: 'AI-driven accessibility analysis and improvements',
      category: 'accessibility',
      enabled: true,
      methods: {
        auditWCAG: this.auditWCAG.bind(this),
        checkSemantics: this.checkSemantics.bind(this),
        analyzeContrast: this.analyzeContrast.bind(this),
        suggestImprovements: this.suggestAccessibilityImprovements.bind(this)
      }
    });

    // Code Reviewer Tool
    this.tools.set('code-reviewer', {
      id: 'code-reviewer',
      name: '👀 Code Reviewer',
      description: 'Intelligent code review and best practices',
      category: 'code-quality',
      enabled: true,
      methods: {
        reviewCode: this.reviewCode.bind(this),
        checkPatterns: this.checkPatterns.bind(this),
        suggestRefactoring: this.suggestRefactoring.bind(this),
        analyzeComplexity: this.analyzeComplexity.bind(this)
      }
    });
  }

  // ==================== DEBUG ASSISTANT ====================

  async analyzeErrors(context) {
    const errors = this.extractErrors(context);
    if (errors.length === 0) {
      return {
        status: 'success',
        message: 'No JavaScript errors detected',
        errors: [],
        suggestions: []
      };
    }

    const analysis = errors.map(error => ({
      error: error,
      severity: this.classifyErrorSeverity(error),
      category: this.categorizeError(error),
      possibleCauses: this.identifyPossibleCauses(error),
      suggestedFixes: this.generateErrorFixes(error)
    }));

    return {
      status: 'issues_found',
      message: `Found ${errors.length} JavaScript error(s)`,
      errors: analysis,
      suggestions: this.generateDebuggingSuggestions(analysis)
    };
  }

  extractErrors(context) {
    const errors = [];
    
    if (context.console && context.console.errors) {
      errors.push(...context.console.errors);
    }

    if (context.javascript && context.javascript.includes('Error:')) {
      // Extract inline errors from JavaScript
      const errorMatches = context.javascript.match(/Error:[^\\n]*/g) || [];
      errors.push(...errorMatches);
    }

    return errors;
  }

  classifyErrorSeverity(error) {
    const errorString = error.toString().toLowerCase();
    
    if (errorString.includes('syntaxerror') || errorString.includes('referenceerror')) {
      return 'critical';
    } else if (errorString.includes('typeerror') || errorString.includes('rangeerror')) {
      return 'high';
    } else if (errorString.includes('warning') || errorString.includes('deprecated')) {
      return 'low';
    }
    
    return 'medium';
  }

  categorizeError(error) {
    const errorString = error.toString().toLowerCase();
    
    if (errorString.includes('network') || errorString.includes('fetch')) {
      return 'network';
    } else if (errorString.includes('dom') || errorString.includes('element')) {
      return 'dom';
    } else if (errorString.includes('async') || errorString.includes('promise')) {
      return 'async';
    } else if (errorString.includes('syntax')) {
      return 'syntax';
    }
    
    return 'runtime';
  }

  identifyPossibleCauses(error) {
    const errorString = error.toString().toLowerCase();
    const causes = [];

    if (errorString.includes('undefined')) {
      causes.push('Variable or property not defined');
      causes.push('Timing issue - element not yet available');
    }

    if (errorString.includes('null')) {
      causes.push('Element not found in DOM');
      causes.push('API returned null response');
    }

    if (errorString.includes('network')) {
      causes.push('Network connectivity issue');
      causes.push('CORS policy blocking request');
      causes.push('Server endpoint not available');
    }

    return causes.length > 0 ? causes : ['Unknown cause - requires further investigation'];
  }

  generateErrorFixes(error) {
    const errorString = error.toString().toLowerCase();
    const fixes = [];

    if (errorString.includes('undefined')) {
      fixes.push('Add null/undefined checks before accessing properties');
      fixes.push('Use optional chaining (?.) operator');
      fixes.push('Ensure variables are properly initialized');
    }

    if (errorString.includes('element')) {
      fixes.push('Wait for DOM to be ready before accessing elements');
      fixes.push('Use document.querySelector with null checks');
      fixes.push('Add event listeners after elements are loaded');
    }

    if (errorString.includes('fetch') || errorString.includes('network')) {
      fixes.push('Add proper error handling for network requests');
      fixes.push('Check CORS configuration');
      fixes.push('Implement retry logic for failed requests');
    }

    return fixes.length > 0 ? fixes : ['Review error context and add appropriate error handling'];
  }

  generateDebuggingSuggestions(analysis) {
    const suggestions = [];
    const severityCounts = analysis.reduce((acc, item) => {
      acc[item.severity] = (acc[item.severity] || 0) + 1;
      return acc;
    }, {});

    if (severityCounts.critical > 0) {
      suggestions.push('🚨 Address critical errors first - they prevent code execution');
    }

    if (severityCounts.high > 2) {
      suggestions.push('⚠️ Multiple high-severity errors detected - consider code review');
    }

    suggestions.push('🔍 Use browser DevTools for detailed stack traces');
    suggestions.push('🧪 Add console.log statements to trace execution flow');
    suggestions.push('🛡️ Implement comprehensive error handling');

    return suggestions;
  }

  // ==================== PERFORMANCE OPTIMIZER ====================

  async analyzePerformanceMetrics(context) {
    const metrics = this.extractPerformanceMetrics(context);
    const analysis = {
      loadTime: this.analyzeLoadTime(metrics),
      renderMetrics: this.analyzeRenderMetrics(metrics),
      resourceUsage: this.analyzeResourceUsage(metrics),
      networkPerformance: this.analyzeNetworkPerformance(metrics)
    };

    return {
      status: 'analyzed',
      metrics: metrics,
      analysis: analysis,
      score: this.calculatePerformanceScore(analysis),
      recommendations: this.generatePerformanceRecommendations(analysis)
    };
  }

  extractPerformanceMetrics(context) {
    const metrics = {};

    if (context.performance) {
      metrics.loadTime = context.performance.loadTime || 0;
      metrics.firstContentfulPaint = context.performance.firstContentfulPaint || 0;
      metrics.largestContentfulPaint = context.performance.largestContentfulPaint || 0;
      metrics.cumulativeLayoutShift = context.performance.cumulativeLayoutShift || 0;
      metrics.firstInputDelay = context.performance.firstInputDelay || 0;
    }

    if (context.network) {
      metrics.resourceCount = context.network.requests?.length || 0;
      metrics.totalSize = context.network.totalSize || 0;
    }

    return metrics;
  }

  analyzeLoadTime(metrics) {
    const loadTime = metrics.loadTime || 0;
    
    return {
      value: loadTime,
      rating: loadTime < 2000 ? 'good' : loadTime < 4000 ? 'needs-improvement' : 'poor',
      suggestions: loadTime > 3000 ? [
        'Optimize images and use modern formats (WebP, AVIF)',
        'Minimize and compress CSS/JavaScript files',
        'Use a Content Delivery Network (CDN)',
        'Implement lazy loading for images'
      ] : []
    };
  }

  analyzeRenderMetrics(metrics) {
    const fcp = metrics.firstContentfulPaint || 0;
    const lcp = metrics.largestContentfulPaint || 0;
    const cls = metrics.cumulativeLayoutShift || 0;

    return {
      firstContentfulPaint: {
        value: fcp,
        rating: fcp < 1800 ? 'good' : fcp < 3000 ? 'needs-improvement' : 'poor'
      },
      largestContentfulPaint: {
        value: lcp,
        rating: lcp < 2500 ? 'good' : lcp < 4000 ? 'needs-improvement' : 'poor'
      },
      cumulativeLayoutShift: {
        value: cls,
        rating: cls < 0.1 ? 'good' : cls < 0.25 ? 'needs-improvement' : 'poor'
      }
    };
  }

  calculatePerformanceScore(analysis) {
    let score = 100;
    
    // Deduct points based on metrics
    if (analysis.loadTime.rating === 'poor') score -= 30;
    else if (analysis.loadTime.rating === 'needs-improvement') score -= 15;

    if (analysis.renderMetrics.firstContentfulPaint.rating === 'poor') score -= 20;
    else if (analysis.renderMetrics.firstContentfulPaint.rating === 'needs-improvement') score -= 10;

    if (analysis.renderMetrics.largestContentfulPaint.rating === 'poor') score -= 20;
    else if (analysis.renderMetrics.largestContentfulPaint.rating === 'needs-improvement') score -= 10;

    if (analysis.renderMetrics.cumulativeLayoutShift.rating === 'poor') score -= 20;
    else if (analysis.renderMetrics.cumulativeLayoutShift.rating === 'needs-improvement') score -= 10;

    return Math.max(0, score);
  }

  // ==================== ENHANCED SECURITY ANALYZER ====================

  async scanVulnerabilities(context) {
    const vulnerabilities = [];

    // Check for common security issues
    vulnerabilities.push(...this.checkXSSVulnerabilities(context));
    vulnerabilities.push(...this.checkCSRFVulnerabilities(context));
    vulnerabilities.push(...this.checkInsecureReferences(context));
    vulnerabilities.push(...this.checkDataExposure(context));

    return {
      status: vulnerabilities.length > 0 ? 'vulnerabilities_found' : 'secure',
      vulnerabilities: vulnerabilities,
      recommendations: this.generateSecurityRecommendations(vulnerabilities)
    };
  }

  async runCybersecurityScan(context) {
    // Initialize cybersecurity AI if not already available
    if (!window.cybersecurityAI) {
      window.cybersecurityAI = new window.CybersecurityAI();
    }

    const results = {
      owaspScan: null,
      malwareScan: null,
      networkAnalysis: null,
      privacyAudit: null,
      overallRiskScore: 0,
      criticalIssues: [],
      recommendations: []
    };

    try {
      // Run OWASP Top 10 scan
      results.owaspScan = await window.cybersecurityAI.runSecurityAnalysis(
        'web-app-scanner', 'scanOWASPTop10', context
      );

      // Run malware detection
      results.malwareScan = await window.cybersecurityAI.runSecurityAnalysis(
        'malware-detector', 'scanForMaliciousCode', context
      );

      // Run network security analysis
      results.networkAnalysis = await window.cybersecurityAI.runSecurityAnalysis(
        'network-analyzer', 'analyzeNetworkTraffic', context
      );

      // Run privacy compliance audit
      results.privacyAudit = await window.cybersecurityAI.runSecurityAnalysis(
        'privacy-auditor', 'auditGDPRCompliance', context
      );

      // Calculate overall risk score
      results.overallRiskScore = this.calculateOverallSecurityRisk(results);

      // Collect critical issues
      results.criticalIssues = this.extractCriticalIssues(results);

      // Generate comprehensive recommendations
      results.recommendations = this.generateComprehensiveSecurityRecommendations(results);

    } catch (error) {
      console.error('Cybersecurity scan failed:', error);
      return {
        status: 'error',
        error: error.message,
        recommendations: ['Unable to complete security scan. Please check console for details.']
      };
    }

    return {
      status: results.criticalIssues.length > 0 ? 'critical_issues_found' : 
              results.overallRiskScore > 50 ? 'moderate_risk' : 'low_risk',
      ...results
    };
  }

  async detectMalware(context) {
    if (!window.cybersecurityAI) {
      window.cybersecurityAI = new window.CybersecurityAI();
    }

    try {
      const malwareResults = await window.cybersecurityAI.runSecurityAnalysis(
        'malware-detector', 'scanForMaliciousCode', context
      );

      const cryptojackingResults = await window.cybersecurityAI.runSecurityAnalysis(
        'malware-detector', 'detectCryptojacking', context
      );

      return {
        status: malwareResults.status === 'malware_detected' || 
                cryptojackingResults.status === 'cryptojacking_detected' ? 
                'threats_detected' : 'clean',
        malwareFindings: malwareResults.findings || [],
        cryptojackingIndicators: cryptojackingResults.indicators || [],
        threatLevel: malwareResults.threatLevel || 'low',
        recommendations: [
          ...malwareResults.recommendations || [],
          ...cryptojackingResults.recommendations || []
        ]
      };
    } catch (error) {
      console.error('Malware detection failed:', error);
      return {
        status: 'error',
        error: error.message
      };
    }
  }

  async auditPrivacyCompliance(context) {
    if (!window.cybersecurityAI) {
      window.cybersecurityAI = new window.CybersecurityAI();
    }

    try {
      const gdprResults = await window.cybersecurityAI.runSecurityAnalysis(
        'privacy-auditor', 'auditGDPRCompliance', context
      );

      const cookieResults = await window.cybersecurityAI.runSecurityAnalysis(
        'privacy-auditor', 'analyzeCookieUsage', context
      );

      return {
        status: gdprResults.status === 'non_compliant' || 
                cookieResults.status === 'issues_found' ? 
                'compliance_issues' : 'compliant',
        gdprCompliance: gdprResults,
        cookieCompliance: cookieResults,
        overallScore: Math.min(gdprResults.complianceScore || 100, 
                              cookieResults.complianceScore || 100),
        recommendations: [
          ...gdprResults.recommendations || [],
          ...cookieResults.recommendations || []
        ]
      };
    } catch (error) {
      console.error('Privacy compliance audit failed:', error);
      return {
        status: 'error',
        error: error.message
      };
    }
  }

  async generatePentestPlan(context) {
    if (!window.cybersecurityAI) {
      window.cybersecurityAI = new window.CybersecurityAI();
    }

    try {
      const testCases = await window.cybersecurityAI.runSecurityAnalysis(
        'pentest-assistant', 'generateTestCases', context
      );

      const attackVectors = await window.cybersecurityAI.runSecurityAnalysis(
        'pentest-assistant', 'analyzeAttackVectors', context
      );

      return {
        status: 'plan_generated',
        testCases: testCases.testCases || [],
        attackVectors: attackVectors.vectors || [],
        estimatedTime: testCases.estimatedTime || 0,
        overallRisk: attackVectors.overallRisk || 'low',
        prioritizedVectors: attackVectors.prioritizedVectors || [],
        recommendations: [
          ...testCases.recommendations || [],
          'Follow OWASP Testing Guide methodology',
          'Document all findings with proof-of-concept',
          'Coordinate with development team before testing',
          'Ensure proper authorization before conducting tests'
        ]
      };
    } catch (error) {
      console.error('Penetration test plan generation failed:', error);
      return {
        status: 'error',
        error: error.message
      };
    }
  }

  calculateOverallSecurityRisk(results) {
    let riskScore = 0;
    let factors = 0;

    if (results.owaspScan?.riskScore !== undefined) {
      riskScore += results.owaspScan.riskScore;
      factors++;
    }

    if (results.malwareScan?.threatLevel) {
      const threatScores = { low: 10, medium: 40, high: 70, critical: 100 };
      riskScore += threatScores[results.malwareScan.threatLevel] || 0;
      factors++;
    }

    if (results.networkAnalysis?.riskScore !== undefined) {
      riskScore += results.networkAnalysis.riskScore;
      factors++;
    }

    if (results.privacyAudit?.overallScore !== undefined) {
      riskScore += (100 - results.privacyAudit.overallScore); // Invert compliance score
      factors++;
    }

    return factors > 0 ? Math.round(riskScore / factors) : 0;
  }

  extractCriticalIssues(results) {
    const criticalIssues = [];

    // Extract critical vulnerabilities from OWASP scan
    if (results.owaspScan?.vulnerabilities) {
      const critical = results.owaspScan.vulnerabilities.filter(v => v.severity === 'critical');
      criticalIssues.push(...critical.map(v => ({
        type: 'vulnerability',
        severity: 'critical',
        name: v.name,
        description: v.description
      })));
    }

    // Extract critical malware findings
    if (results.malwareScan?.malwareFindings) {
      const critical = results.malwareScan.malwareFindings.filter(f => f.severity === 'critical');
      criticalIssues.push(...critical.map(f => ({
        type: 'malware',
        severity: 'critical',
        name: f.type,
        description: f.description
      })));
    }

    // Extract critical network issues
    if (results.networkAnalysis?.issues) {
      const critical = results.networkAnalysis.issues.filter(i => i.severity === 'critical');
      criticalIssues.push(...critical.map(i => ({
        type: 'network',
        severity: 'critical',
        name: i.type,
        description: i.issue
      })));
    }

    return criticalIssues;
  }

  generateComprehensiveSecurityRecommendations(results) {
    const recommendations = [];

    // High-priority recommendations based on findings
    if (results.criticalIssues.length > 0) {
      recommendations.push('🚨 CRITICAL: Address critical security issues immediately');
      recommendations.push('🔒 Implement emergency security patches');
      recommendations.push('📞 Consider engaging security incident response team');
    }

    // OWASP-specific recommendations
    if (results.owaspScan?.vulnerabilities?.length > 0) {
      recommendations.push('🛡️ Follow OWASP secure coding practices');
      recommendations.push('🧪 Implement comprehensive input validation');
    }

    // Malware-specific recommendations
    if (results.malwareScan?.malwareFindings?.length > 0) {
      recommendations.push('🦠 Deploy anti-malware scanning tools');
      recommendations.push('🔍 Conduct thorough malware analysis');
    }

    // Network security recommendations
    if (results.networkAnalysis?.issues?.length > 0) {
      recommendations.push('🌐 Implement network security controls');
      recommendations.push('🔐 Enforce HTTPS for all communications');
    }

    // Privacy compliance recommendations
    if (results.privacyAudit?.overallScore < 80) {
      recommendations.push('📋 Improve privacy compliance measures');
      recommendations.push('🍪 Implement proper cookie consent management');
    }

    // General security recommendations
    recommendations.push('📊 Conduct regular security assessments');
    recommendations.push('🎓 Provide security training for development team');
    recommendations.push('📝 Maintain security documentation and policies');

    return recommendations;
  }

  checkXSSVulnerabilities(context) {
    const vulnerabilities = [];
    
    if (context.html && context.html.includes('innerHTML')) {
      vulnerabilities.push({
        type: 'XSS',
        severity: 'high',
        description: 'Potential XSS vulnerability through innerHTML usage',
        location: 'HTML/JavaScript',
        recommendation: 'Use textContent or sanitize HTML input'
      });
    }

    if (context.javascript && context.javascript.includes('eval(')) {
      vulnerabilities.push({
        type: 'Code Injection',
        severity: 'critical',
        description: 'Use of eval() function detected',
        location: 'JavaScript',
        recommendation: 'Avoid eval() and use safer alternatives'
      });
    }

    return vulnerabilities;
  }

  checkInsecureReferences(context) {
    const vulnerabilities = [];

    if (context.html && context.html.includes('http://')) {
      vulnerabilities.push({
        type: 'Mixed Content',
        severity: 'medium',
        description: 'HTTP resources loaded on HTTPS page',
        location: 'HTML',
        recommendation: 'Use HTTPS for all external resources'
      });
    }

    return vulnerabilities;
  }

  // ==================== ACCESSIBILITY CHECKER ====================

  async auditWCAG(context) {
    const issues = [];

    issues.push(...this.checkImageAlt(context));
    issues.push(...this.checkHeadingStructure(context));
    issues.push(...this.checkColorContrast(context));
    issues.push(...this.checkKeyboardNavigation(context));
    issues.push(...this.checkARIALabels(context));

    return {
      status: issues.length > 0 ? 'issues_found' : 'compliant',
      issues: issues,
      score: this.calculateAccessibilityScore(issues),
      recommendations: this.generateAccessibilityRecommendations(issues)
    };
  }

  checkImageAlt(context) {
    const issues = [];
    
    if (context.html) {
      const imgTags = context.html.match(/<img[^>]*>/g) || [];
      const imagesWithoutAlt = imgTags.filter(img => !img.includes('alt='));
      
      if (imagesWithoutAlt.length > 0) {
        issues.push({
          type: 'Missing Alt Text',
          severity: 'high',
          wcagLevel: 'A',
          description: `${imagesWithoutAlt.length} image(s) missing alt attributes`,
          recommendation: 'Add descriptive alt text to all images'
        });
      }
    }

    return issues;
  }

  checkHeadingStructure(context) {
    const issues = [];
    
    if (context.html) {
      const hasH1 = context.html.includes('<h1');
      if (!hasH1) {
        issues.push({
          type: 'Heading Structure',
          severity: 'medium',
          wcagLevel: 'AA',
          description: 'No H1 heading found on page',
          recommendation: 'Add a main H1 heading to establish page hierarchy'
        });
      }
    }

    return issues;
  }

  // ==================== CODE REVIEWER ====================

  async reviewCode(context) {
    const review = {
      codeQuality: this.assessCodeQuality(context),
      bestPractices: this.checkBestPractices(context),
      maintainability: this.assessMaintainability(context),
      performance: this.checkCodePerformance(context)
    };

    return {
      status: 'reviewed',
      review: review,
      overallScore: this.calculateCodeScore(review),
      recommendations: this.generateCodeRecommendations(review)
    };
  }

  assessCodeQuality(context) {
    const issues = [];
    
    if (context.javascript) {
      // Check for console.log statements
      if (context.javascript.includes('console.log')) {
        issues.push('Remove console.log statements from production code');
      }

      // Check for var usage
      if (context.javascript.includes('var ')) {
        issues.push('Consider using let/const instead of var');
      }

      // Check for function complexity
      const functionCount = (context.javascript.match(/function/g) || []).length;
      const lineCount = context.javascript.split('\n').length;
      if (functionCount > 0 && lineCount / functionCount > 50) {
        issues.push('Functions may be too complex - consider breaking them down');
      }
    }

    return {
      score: Math.max(0, 100 - (issues.length * 10)),
      issues: issues
    };
  }

  // ==================== UTILITY METHODS ====================

  getTool(toolId) {
    return this.tools.get(toolId);
  }

  getAllTools() {
    return Array.from(this.tools.values());
  }

  getToolsByCategory(category) {
    return Array.from(this.tools.values())
      .filter(tool => tool.category === category);
  }

  async runTool(toolId, method, context) {
    const tool = this.tools.get(toolId);
    if (!tool || !tool.enabled) {
      throw new Error(`Tool ${toolId} not found or disabled`);
    }

    if (!tool.methods[method]) {
      throw new Error(`Method ${method} not found in tool ${toolId}`);
    }

    try {
      const result = await tool.methods[method](context);
      this.toolResults.set(`${toolId}-${method}`, {
        timestamp: Date.now(),
        result: result
      });
      return result;
    } catch (error) {
      console.error(`Error running tool ${toolId}.${method}:`, error);
      throw error;
    }
  }

  getToolResult(toolId, method) {
    return this.toolResults.get(`${toolId}-${method}`);
  }

  clearToolResults() {
    this.toolResults.clear();
  }
}

// Make SpecializedAITools available globally
window.SpecializedAITools = SpecializedAITools;