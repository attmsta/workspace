// Cybersecurity AI Tools for Eruda AI Assistant
class CybersecurityAI {
  constructor() {
    this.securityModules = new Map();
    this.threatDatabase = new Map();
    this.vulnerabilityScanner = null;
    this.securityMetrics = {
      lastScan: null,
      vulnerabilityCount: 0,
      riskScore: 0,
      complianceScore: 0
    };
    
    this.initializeSecurityModules();
    this.initializeThreatDatabase();
  }

  initializeSecurityModules() {
    // Web Application Security Scanner
    this.securityModules.set('web-app-scanner', {
      id: 'web-app-scanner',
      name: '🌐 Web Application Scanner',
      description: 'Comprehensive web application security analysis',
      category: 'vulnerability-assessment',
      enabled: true,
      methods: {
        scanOWASPTop10: this.scanOWASPTop10.bind(this),
        analyzeAuthentication: this.analyzeAuthentication.bind(this),
        checkSessionSecurity: this.checkSessionSecurity.bind(this),
        auditInputValidation: this.auditInputValidation.bind(this),
        assessCryptography: this.assessCryptography.bind(this)
      }
    });

    // Network Security Analyzer
    this.securityModules.set('network-analyzer', {
      id: 'network-analyzer',
      name: '🔗 Network Security Analyzer',
      description: 'Network traffic and communication security analysis',
      category: 'network-security',
      enabled: true,
      methods: {
        analyzeNetworkTraffic: this.analyzeNetworkTraffic.bind(this),
        checkTLSConfiguration: this.checkTLSConfiguration.bind(this),
        auditCORSPolicy: this.auditCORSPolicy.bind(this),
        scanForMaliciousRequests: this.scanForMaliciousRequests.bind(this),
        assessAPIEndpoints: this.assessAPIEndpoints.bind(this)
      }
    });

    // Content Security Policy Analyzer
    this.securityModules.set('csp-analyzer', {
      id: 'csp-analyzer',
      name: '🛡️ CSP Analyzer',
      description: 'Content Security Policy analysis and optimization',
      category: 'content-security',
      enabled: true,
      methods: {
        analyzeCSPHeaders: this.analyzeCSPHeaders.bind(this),
        detectCSPBypass: this.detectCSPBypass.bind(this),
        optimizeCSPPolicy: this.optimizeCSPPolicy.bind(this),
        validateCSPCompliance: this.validateCSPCompliance.bind(this)
      }
    });

    // Malware Detection Engine
    this.securityModules.set('malware-detector', {
      id: 'malware-detector',
      name: '🦠 Malware Detector',
      description: 'AI-powered malware and malicious code detection',
      category: 'threat-detection',
      enabled: true,
      methods: {
        scanForMaliciousCode: this.scanForMaliciousCode.bind(this),
        analyzeScriptBehavior: this.analyzeScriptBehavior.bind(this),
        detectCryptojacking: this.detectCryptojacking.bind(this),
        identifyPhishingAttempts: this.identifyPhishingAttempts.bind(this),
        checkForDataExfiltration: this.checkForDataExfiltration.bind(this)
      }
    });

    // Privacy Compliance Auditor
    this.securityModules.set('privacy-auditor', {
      id: 'privacy-auditor',
      name: '🔒 Privacy Compliance Auditor',
      description: 'GDPR, CCPA, and privacy regulation compliance analysis',
      category: 'privacy-compliance',
      enabled: true,
      methods: {
        auditGDPRCompliance: this.auditGDPRCompliance.bind(this),
        analyzeCookieUsage: this.analyzeCookieUsage.bind(this),
        checkDataCollection: this.checkDataCollection.bind(this),
        assessConsentMechanisms: this.assessConsentMechanisms.bind(this),
        validatePrivacyPolicies: this.validatePrivacyPolicies.bind(this)
      }
    });

    // Penetration Testing Assistant
    this.securityModules.set('pentest-assistant', {
      id: 'pentest-assistant',
      name: '🎯 Penetration Testing Assistant',
      description: 'AI-guided penetration testing and security assessment',
      category: 'penetration-testing',
      enabled: true,
      methods: {
        generateTestCases: this.generatePentestCases.bind(this),
        analyzeAttackVectors: this.analyzeAttackVectors.bind(this),
        simulateAttacks: this.simulateAttacks.bind(this),
        assessSecurityControls: this.assessSecurityControls.bind(this),
        generateSecurityReport: this.generateSecurityReport.bind(this)
      }
    });
  }

  initializeThreatDatabase() {
    // OWASP Top 10 2021
    this.threatDatabase.set('owasp-top10', {
      'A01:2021': {
        name: 'Broken Access Control',
        description: 'Restrictions on what authenticated users are allowed to do are often not properly enforced',
        severity: 'high',
        cwe: ['CWE-22', 'CWE-284', 'CWE-285'],
        detectionPatterns: [
          /\.\.\/|\.\.\\/, // Path traversal
          /admin|administrator|root/i, // Privilege escalation
          /bypass|override/i // Access control bypass
        ]
      },
      'A02:2021': {
        name: 'Cryptographic Failures',
        description: 'Failures related to cryptography which often leads to sensitive data exposure',
        severity: 'high',
        cwe: ['CWE-259', 'CWE-327', 'CWE-331'],
        detectionPatterns: [
          /md5|sha1/i, // Weak hashing
          /http:\/\//i, // Unencrypted transmission
          /password.*=.*['"]/i // Hardcoded passwords
        ]
      },
      'A03:2021': {
        name: 'Injection',
        description: 'Application is vulnerable to injection attacks',
        severity: 'critical',
        cwe: ['CWE-79', 'CWE-89', 'CWE-94'],
        detectionPatterns: [
          /eval\s*\(/i, // Code injection
          /innerHTML\s*=/i, // XSS potential
          /document\.write\s*\(/i, // DOM manipulation
          /SELECT.*FROM|INSERT.*INTO|UPDATE.*SET/i // SQL injection patterns
        ]
      },
      'A04:2021': {
        name: 'Insecure Design',
        description: 'Risks related to design flaws and missing security controls',
        severity: 'medium',
        cwe: ['CWE-209', 'CWE-256', 'CWE-501'],
        detectionPatterns: [
          /console\.log.*password/i, // Information disclosure
          /alert\s*\(/i, // Debug information
          /TODO|FIXME|HACK/i // Incomplete security implementations
        ]
      },
      'A05:2021': {
        name: 'Security Misconfiguration',
        description: 'Missing appropriate security hardening across any part of the application stack',
        severity: 'medium',
        cwe: ['CWE-16', 'CWE-209', 'CWE-200'],
        detectionPatterns: [
          /X-Frame-Options|X-Content-Type-Options/i, // Missing security headers
          /Access-Control-Allow-Origin:\s*\*/i, // Permissive CORS
          /debug.*true|development/i // Debug mode enabled
        ]
      }
    });

    // Common vulnerability patterns
    this.threatDatabase.set('vulnerability-patterns', {
      xss: {
        patterns: [
          /<script[^>]*>.*?<\/script>/gi,
          /javascript:/gi,
          /on\w+\s*=/gi,
          /innerHTML|outerHTML/gi
        ],
        severity: 'high',
        description: 'Cross-Site Scripting vulnerability patterns'
      },
      csrf: {
        patterns: [
          /method\s*=\s*["']post["']/gi,
          /action\s*=\s*["'][^"']*["']/gi
        ],
        severity: 'medium',
        description: 'Cross-Site Request Forgery vulnerability patterns'
      },
      sqli: {
        patterns: [
          /SELECT.*FROM|INSERT.*INTO|UPDATE.*SET|DELETE.*FROM/gi,
          /UNION.*SELECT/gi,
          /OR\s+1\s*=\s*1|AND\s+1\s*=\s*1/gi
        ],
        severity: 'critical',
        description: 'SQL Injection vulnerability patterns'
      }
    });

    // Malware signatures
    this.threatDatabase.set('malware-signatures', {
      cryptojacking: {
        patterns: [
          /coinhive|cryptoloot|jsecoin/gi,
          /stratum\+tcp|mining.*pool/gi,
          /crypto.*miner|bitcoin.*miner/gi
        ],
        severity: 'high',
        description: 'Cryptocurrency mining malware'
      },
      phishing: {
        patterns: [
          /verify.*account|suspend.*account/gi,
          /click.*here.*immediately|urgent.*action/gi,
          /paypal|amazon|microsoft.*security/gi
        ],
        severity: 'high',
        description: 'Phishing attempt indicators'
      },
      dataExfiltration: {
        patterns: [
          /btoa\(|atob\(/gi,
          /XMLHttpRequest.*send|fetch.*POST/gi,
          /document\.cookie|localStorage|sessionStorage/gi
        ],
        severity: 'critical',
        description: 'Data exfiltration patterns'
      }
    });
  }

  // ==================== WEB APPLICATION SCANNER ====================

  async scanOWASPTop10(context) {
    const vulnerabilities = [];
    const owaspThreats = this.threatDatabase.get('owasp-top10');

    for (const [threatId, threat] of Object.entries(owaspThreats)) {
      const findings = await this.detectThreat(context, threat);
      if (findings.length > 0) {
        vulnerabilities.push({
          id: threatId,
          name: threat.name,
          description: threat.description,
          severity: threat.severity,
          cwe: threat.cwe,
          findings: findings,
          recommendations: this.generateOWASPRecommendations(threatId)
        });
      }
    }

    return {
      status: vulnerabilities.length > 0 ? 'vulnerabilities_found' : 'secure',
      vulnerabilities: vulnerabilities,
      riskScore: this.calculateRiskScore(vulnerabilities),
      recommendations: this.generateSecurityRecommendations(vulnerabilities)
    };
  }

  async detectThreat(context, threat) {
    const findings = [];
    const content = this.extractSecurityContent(context);

    for (const pattern of threat.detectionPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        findings.push({
          pattern: pattern.toString(),
          matches: matches,
          location: this.identifyLocation(content, matches[0]),
          confidence: this.calculateConfidence(pattern, matches)
        });
      }
    }

    return findings;
  }

  async analyzeAuthentication(context) {
    const authIssues = [];
    const content = this.extractSecurityContent(context);

    // Check for weak authentication patterns
    const weakPatterns = [
      { pattern: /password.*=.*["'][^"']{1,5}["']/gi, issue: 'Weak password detected' },
      { pattern: /admin.*admin|root.*root/gi, issue: 'Default credentials detected' },
      { pattern: /auth.*false|bypass.*auth/gi, issue: 'Authentication bypass detected' },
      { pattern: /session.*=.*[^;]{50,}/gi, issue: 'Potentially insecure session handling' }
    ];

    for (const { pattern, issue } of weakPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        authIssues.push({
          issue: issue,
          severity: 'high',
          evidence: matches.slice(0, 3), // Limit evidence
          recommendation: this.getAuthRecommendation(issue)
        });
      }
    }

    return {
      status: authIssues.length > 0 ? 'issues_found' : 'secure',
      issues: authIssues,
      score: Math.max(0, 100 - (authIssues.length * 20)),
      recommendations: this.generateAuthRecommendations(authIssues)
    };
  }

  async checkSessionSecurity(context) {
    const sessionIssues = [];
    
    // Check cookies for security attributes
    if (context.network && context.network.cookies) {
      for (const cookie of context.network.cookies) {
        if (!cookie.secure && window.location.protocol === 'https:') {
          sessionIssues.push({
            type: 'insecure_cookie',
            severity: 'medium',
            cookie: cookie.name,
            issue: 'Cookie missing Secure flag on HTTPS site'
          });
        }

        if (!cookie.httpOnly) {
          sessionIssues.push({
            type: 'accessible_cookie',
            severity: 'high',
            cookie: cookie.name,
            issue: 'Cookie accessible via JavaScript (missing HttpOnly flag)'
          });
        }

        if (!cookie.sameSite || cookie.sameSite === 'None') {
          sessionIssues.push({
            type: 'csrf_vulnerable_cookie',
            severity: 'medium',
            cookie: cookie.name,
            issue: 'Cookie vulnerable to CSRF attacks (missing/weak SameSite)'
          });
        }
      }
    }

    return {
      status: sessionIssues.length > 0 ? 'issues_found' : 'secure',
      issues: sessionIssues,
      recommendations: this.generateSessionRecommendations(sessionIssues)
    };
  }

  // ==================== NETWORK SECURITY ANALYZER ====================

  async analyzeNetworkTraffic(context) {
    const networkIssues = [];
    
    if (context.network && context.network.requests) {
      for (const request of context.network.requests) {
        // Check for insecure protocols
        if (request.url.startsWith('http://') && window.location.protocol === 'https:') {
          networkIssues.push({
            type: 'mixed_content',
            severity: 'high',
            url: request.url,
            issue: 'HTTP resource loaded on HTTPS page'
          });
        }

        // Check for suspicious domains
        if (this.isSuspiciousDomain(request.url)) {
          networkIssues.push({
            type: 'suspicious_domain',
            severity: 'critical',
            url: request.url,
            issue: 'Request to potentially malicious domain'
          });
        }

        // Check for data exfiltration patterns
        if (this.detectDataExfiltration(request)) {
          networkIssues.push({
            type: 'data_exfiltration',
            severity: 'critical',
            url: request.url,
            issue: 'Potential data exfiltration detected'
          });
        }
      }
    }

    return {
      status: networkIssues.length > 0 ? 'issues_found' : 'secure',
      issues: networkIssues,
      riskScore: this.calculateNetworkRiskScore(networkIssues),
      recommendations: this.generateNetworkRecommendations(networkIssues)
    };
  }

  async checkTLSConfiguration(context) {
    const tlsIssues = [];
    
    // Check current page TLS
    if (window.location.protocol !== 'https:') {
      tlsIssues.push({
        type: 'no_tls',
        severity: 'critical',
        issue: 'Page not served over HTTPS',
        recommendation: 'Implement HTTPS with valid TLS certificate'
      });
    }

    // Check for weak TLS configurations in network requests
    if (context.network && context.network.requests) {
      const httpRequests = context.network.requests.filter(req => 
        req.url.startsWith('http://') && !req.url.includes('localhost')
      );

      if (httpRequests.length > 0) {
        tlsIssues.push({
          type: 'weak_tls',
          severity: 'high',
          issue: `${httpRequests.length} unencrypted HTTP requests detected`,
          requests: httpRequests.slice(0, 5).map(req => req.url)
        });
      }
    }

    return {
      status: tlsIssues.length > 0 ? 'issues_found' : 'secure',
      issues: tlsIssues,
      recommendations: this.generateTLSRecommendations(tlsIssues)
    };
  }

  // ==================== MALWARE DETECTOR ====================

  async scanForMaliciousCode(context) {
    const malwareFindings = [];
    const content = this.extractSecurityContent(context);
    const malwareSignatures = this.threatDatabase.get('malware-signatures');

    for (const [malwareType, signature] of Object.entries(malwareSignatures)) {
      for (const pattern of signature.patterns) {
        const matches = content.match(pattern);
        if (matches) {
          malwareFindings.push({
            type: malwareType,
            severity: signature.severity,
            description: signature.description,
            evidence: matches.slice(0, 3),
            confidence: this.calculateMalwareConfidence(pattern, matches),
            recommendation: this.getMalwareRecommendation(malwareType)
          });
        }
      }
    }

    return {
      status: malwareFindings.length > 0 ? 'malware_detected' : 'clean',
      findings: malwareFindings,
      threatLevel: this.calculateThreatLevel(malwareFindings),
      recommendations: this.generateMalwareRecommendations(malwareFindings)
    };
  }

  async detectCryptojacking(context) {
    const cryptoIndicators = [];
    const content = this.extractSecurityContent(context);

    // Known cryptojacking patterns
    const cryptoPatterns = [
      /coinhive|cryptoloot|jsecoin|minergate/gi,
      /stratum\+tcp|mining.*pool|hashrate/gi,
      /crypto.*miner|bitcoin.*miner|monero.*miner/gi,
      /webassembly.*mining|wasm.*crypto/gi
    ];

    for (const pattern of cryptoPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        cryptoIndicators.push({
          pattern: pattern.toString(),
          matches: matches,
          severity: 'high',
          description: 'Cryptocurrency mining code detected'
        });
      }
    }

    // Check for high CPU usage patterns
    if (context.performance && context.performance.cpuUsage > 80) {
      cryptoIndicators.push({
        type: 'high_cpu_usage',
        value: context.performance.cpuUsage,
        severity: 'medium',
        description: 'Unusually high CPU usage detected'
      });
    }

    return {
      status: cryptoIndicators.length > 0 ? 'cryptojacking_detected' : 'clean',
      indicators: cryptoIndicators,
      recommendations: cryptoIndicators.length > 0 ? [
        'Block cryptocurrency mining scripts',
        'Monitor CPU usage for unusual spikes',
        'Use browser extensions to block miners',
        'Implement Content Security Policy to prevent unauthorized scripts'
      ] : []
    };
  }

  // ==================== PRIVACY COMPLIANCE AUDITOR ====================

  async auditGDPRCompliance(context) {
    const complianceIssues = [];
    const content = this.extractSecurityContent(context);

    // Check for data collection without consent
    const dataCollectionPatterns = [
      /collect.*personal.*data|personal.*information/gi,
      /email.*address|phone.*number|credit.*card/gi,
      /tracking.*cookies|analytics.*tracking/gi
    ];

    for (const pattern of dataCollectionPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        complianceIssues.push({
          type: 'data_collection',
          severity: 'medium',
          description: 'Potential personal data collection detected',
          evidence: matches.slice(0, 2),
          requirement: 'GDPR Article 6 - Lawful basis for processing'
        });
      }
    }

    // Check for consent mechanisms
    const hasConsentBanner = /cookie.*consent|accept.*cookies|privacy.*policy/gi.test(content);
    if (!hasConsentBanner && context.network?.cookies?.length > 0) {
      complianceIssues.push({
        type: 'missing_consent',
        severity: 'high',
        description: 'Cookies set without visible consent mechanism',
        requirement: 'GDPR Article 7 - Conditions for consent'
      });
    }

    return {
      status: complianceIssues.length > 0 ? 'non_compliant' : 'compliant',
      issues: complianceIssues,
      complianceScore: Math.max(0, 100 - (complianceIssues.length * 15)),
      recommendations: this.generateGDPRRecommendations(complianceIssues)
    };
  }

  async analyzeCookieUsage(context) {
    const cookieIssues = [];
    
    if (context.network && context.network.cookies) {
      for (const cookie of context.network.cookies) {
        // Check for tracking cookies without consent
        if (this.isTrackingCookie(cookie) && !this.hasConsentForCookie(cookie)) {
          cookieIssues.push({
            type: 'tracking_without_consent',
            severity: 'high',
            cookie: cookie.name,
            issue: 'Tracking cookie set without explicit consent'
          });
        }

        // Check for excessive cookie duration
        if (cookie.maxAge && cookie.maxAge > 31536000) { // 1 year
          cookieIssues.push({
            type: 'excessive_duration',
            severity: 'medium',
            cookie: cookie.name,
            duration: cookie.maxAge,
            issue: 'Cookie has excessive retention period'
          });
        }
      }
    }

    return {
      status: cookieIssues.length > 0 ? 'issues_found' : 'compliant',
      issues: cookieIssues,
      recommendations: this.generateCookieRecommendations(cookieIssues)
    };
  }

  // ==================== PENETRATION TESTING ASSISTANT ====================

  async generatePentestCases(context) {
    const testCases = [];
    const content = this.extractSecurityContent(context);

    // Generate test cases based on detected technologies
    if (content.includes('form') || content.includes('input')) {
      testCases.push({
        category: 'Input Validation',
        tests: [
          'Test for SQL injection in form fields',
          'Test for XSS in text inputs',
          'Test for command injection in file uploads',
          'Test for LDAP injection in search fields'
        ],
        priority: 'high'
      });
    }

    if (content.includes('login') || content.includes('auth')) {
      testCases.push({
        category: 'Authentication',
        tests: [
          'Test for brute force protection',
          'Test for default credentials',
          'Test for session fixation',
          'Test for password policy enforcement'
        ],
        priority: 'critical'
      });
    }

    if (context.network?.requests?.length > 0) {
      testCases.push({
        category: 'Network Security',
        tests: [
          'Test for insecure direct object references',
          'Test for CSRF vulnerabilities',
          'Test for information disclosure in responses',
          'Test for HTTP method tampering'
        ],
        priority: 'high'
      });
    }

    return {
      testCases: testCases,
      estimatedTime: testCases.length * 30, // 30 minutes per category
      recommendations: this.generatePentestRecommendations(testCases)
    };
  }

  async analyzeAttackVectors(context) {
    const attackVectors = [];
    const content = this.extractSecurityContent(context);

    // Client-side attack vectors
    if (content.includes('innerHTML') || content.includes('eval')) {
      attackVectors.push({
        vector: 'Client-side Code Injection',
        severity: 'critical',
        description: 'Application vulnerable to XSS and code injection attacks',
        exploitability: 'high',
        impact: 'high'
      });
    }

    // Server-side attack vectors
    if (context.network?.requests?.some(req => req.method === 'POST')) {
      attackVectors.push({
        vector: 'Server-side Request Forgery',
        severity: 'high',
        description: 'POST requests may be vulnerable to CSRF attacks',
        exploitability: 'medium',
        impact: 'high'
      });
    }

    // Data exposure vectors
    if (content.includes('console.log') || content.includes('alert')) {
      attackVectors.push({
        vector: 'Information Disclosure',
        severity: 'medium',
        description: 'Debug information may expose sensitive data',
        exploitability: 'low',
        impact: 'medium'
      });
    }

    return {
      vectors: attackVectors,
      overallRisk: this.calculateOverallRisk(attackVectors),
      prioritizedVectors: attackVectors.sort((a, b) => 
        this.getVectorPriority(b) - this.getVectorPriority(a)
      )
    };
  }

  // ==================== UTILITY METHODS ====================

  extractSecurityContent(context) {
    let content = '';
    
    if (context.html) content += context.html + '\n';
    if (context.javascript) content += context.javascript + '\n';
    if (context.css) content += context.css + '\n';
    if (context.console?.logs) content += context.console.logs.join('\n') + '\n';
    
    return content;
  }

  calculateRiskScore(vulnerabilities) {
    let score = 0;
    for (const vuln of vulnerabilities) {
      switch (vuln.severity) {
        case 'critical': score += 40; break;
        case 'high': score += 25; break;
        case 'medium': score += 15; break;
        case 'low': score += 5; break;
      }
    }
    return Math.min(100, score);
  }

  calculateConfidence(pattern, matches) {
    // Simple confidence calculation based on pattern specificity and match count
    const patternComplexity = pattern.toString().length;
    const matchCount = matches.length;
    
    let confidence = Math.min(90, (patternComplexity / 10) + (matchCount * 5));
    return Math.max(10, confidence);
  }

  isSuspiciousDomain(url) {
    const suspiciousTLDs = ['.tk', '.ml', '.ga', '.cf'];
    const suspiciousKeywords = ['phishing', 'malware', 'virus', 'hack'];
    
    return suspiciousTLDs.some(tld => url.includes(tld)) ||
           suspiciousKeywords.some(keyword => url.toLowerCase().includes(keyword));
  }

  detectDataExfiltration(request) {
    // Check for large POST requests or suspicious data patterns
    if (request.method === 'POST' && request.body) {
      const bodySize = JSON.stringify(request.body).length;
      return bodySize > 10000; // Large data transfer
    }
    return false;
  }

  isTrackingCookie(cookie) {
    const trackingPatterns = ['_ga', '_gid', '_fbp', 'utm_', 'track', 'analytics'];
    return trackingPatterns.some(pattern => cookie.name.includes(pattern));
  }

  hasConsentForCookie(cookie) {
    // Simple check - in real implementation, this would check consent management
    return document.cookie.includes('consent=true') || 
           localStorage.getItem('cookieConsent') === 'true';
  }

  generateSecurityRecommendations(vulnerabilities) {
    const recommendations = [];
    
    if (vulnerabilities.some(v => v.severity === 'critical')) {
      recommendations.push('🚨 Address critical vulnerabilities immediately');
      recommendations.push('🔒 Implement input validation and output encoding');
    }
    
    if (vulnerabilities.some(v => v.name.includes('Injection'))) {
      recommendations.push('🛡️ Use parameterized queries and prepared statements');
      recommendations.push('🧹 Sanitize all user inputs');
    }
    
    recommendations.push('📋 Conduct regular security assessments');
    recommendations.push('🎓 Provide security training for development team');
    
    return recommendations;
  }

  // Get security module by ID
  getSecurityModule(moduleId) {
    return this.securityModules.get(moduleId);
  }

  // Get all security modules
  getAllSecurityModules() {
    return Array.from(this.securityModules.values());
  }

  // Run security analysis
  async runSecurityAnalysis(moduleId, method, context) {
    const module = this.securityModules.get(moduleId);
    if (!module || !module.enabled) {
      throw new Error(`Security module ${moduleId} not found or disabled`);
    }

    if (!module.methods[method]) {
      throw new Error(`Method ${method} not found in module ${moduleId}`);
    }

    try {
      const result = await module.methods[method](context);
      
      // Update security metrics
      this.updateSecurityMetrics(result);
      
      return result;
    } catch (error) {
      console.error(`Error running security analysis ${moduleId}.${method}:`, error);
      throw error;
    }
  }

  updateSecurityMetrics(result) {
    this.securityMetrics.lastScan = Date.now();
    
    if (result.vulnerabilities) {
      this.securityMetrics.vulnerabilityCount = result.vulnerabilities.length;
    }
    
    if (result.riskScore !== undefined) {
      this.securityMetrics.riskScore = result.riskScore;
    }
    
    if (result.complianceScore !== undefined) {
      this.securityMetrics.complianceScore = result.complianceScore;
    }
  }

  getSecurityMetrics() {
    return { ...this.securityMetrics };
  }
}

// Make CybersecurityAI available globally
window.CybersecurityAI = CybersecurityAI;