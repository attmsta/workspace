// Advanced AI Features for Eruda AI Assistant
class AdvancedAIFeatures {
  constructor() {
    this.promptTemplates = new Map();
    this.conversationMemory = null;
    this.modelManager = null;
    this.smartSuggestions = null;
    this.codeGenerator = null;
    
    this.init();
  }

  async init() {
    await this.loadPromptTemplates();
    await this.initializeConversationMemory();
    this.initializeModelManager();
    this.initializeSmartSuggestions();
    this.initializeCodeGenerator();
  }

  // ==================== PROMPT TEMPLATES ====================
  
  async loadPromptTemplates() {
    // Load default templates
    this.promptTemplates.set('debug', {
      id: 'debug',
      name: '🐛 Debug Issue',
      description: 'Analyze and debug code issues',
      template: `You are a debugging expert. Analyze the following code and context to identify and fix issues:

Context: {context}
Issue Description: {userInput}

Please provide:
1. Root cause analysis
2. Step-by-step debugging approach
3. Specific fix recommendations
4. Prevention strategies

Focus on practical, actionable solutions.`,
      variables: ['context', 'userInput'],
      category: 'debugging'
    });

    this.promptTemplates.set('performance', {
      id: 'performance',
      name: '⚡ Performance Analysis',
      description: 'Analyze and optimize performance',
      template: `You are a performance optimization expert. Analyze the following code and metrics:

Performance Data: {performanceData}
Code Context: {context}
Specific Concern: {userInput}

Please provide:
1. Performance bottleneck identification
2. Optimization recommendations
3. Implementation priority
4. Expected impact assessment

Focus on measurable improvements and best practices.`,
      variables: ['performanceData', 'context', 'userInput'],
      category: 'performance'
    });

    this.promptTemplates.set('security', {
      id: 'security',
      name: '🔒 Security Review',
      description: 'Security analysis and recommendations',
      template: `You are a security expert. Review the following code for security vulnerabilities:

Code Context: {context}
Security Concern: {userInput}

Please provide:
1. Vulnerability assessment
2. Risk level evaluation
3. Mitigation strategies
4. Security best practices

Focus on practical security improvements and compliance.`,
      variables: ['context', 'userInput'],
      category: 'security'
    });

    this.promptTemplates.set('accessibility', {
      id: 'accessibility',
      name: '♿ Accessibility Check',
      description: 'Accessibility analysis and improvements',
      template: `You are an accessibility expert. Analyze the following for accessibility compliance:

HTML/CSS Context: {context}
Accessibility Concern: {userInput}

Please provide:
1. WCAG compliance assessment
2. Accessibility issues identification
3. Improvement recommendations
4. Implementation guidance

Focus on inclusive design and WCAG 2.1 AA standards.`,
      variables: ['context', 'userInput'],
      category: 'accessibility'
    });

    this.promptTemplates.set('code-review', {
      id: 'code-review',
      name: '👀 Code Review',
      description: 'Comprehensive code review',
      template: `You are a senior developer conducting a code review. Analyze the following code:

Code Context: {context}
Review Focus: {userInput}

Please provide:
1. Code quality assessment
2. Best practices evaluation
3. Improvement suggestions
4. Maintainability recommendations

Focus on clean code principles and industry standards.`,
      variables: ['context', 'userInput'],
      category: 'code-quality'
    });

    this.promptTemplates.set('explain', {
      id: 'explain',
      name: '📚 Code Explanation',
      description: 'Explain code functionality',
      template: `You are a technical educator. Explain the following code in detail:

Code Context: {context}
Specific Question: {userInput}

Please provide:
1. High-level overview
2. Step-by-step breakdown
3. Key concepts explanation
4. Related patterns and practices

Focus on clear, educational explanations suitable for learning.`,
      variables: ['context', 'userInput'],
      category: 'education'
    });

    this.promptTemplates.set('refactor', {
      id: 'refactor',
      name: '🔄 Code Refactoring',
      description: 'Refactor and improve code',
      template: `You are a refactoring expert. Improve the following code:

Current Code: {context}
Refactoring Goal: {userInput}

Please provide:
1. Refactored code
2. Improvement explanations
3. Benefits of changes
4. Migration considerations

Focus on maintainability, readability, and performance.`,
      variables: ['context', 'userInput'],
      category: 'refactoring'
    });

    this.promptTemplates.set('testing', {
      id: 'testing',
      name: '🧪 Test Generation',
      description: 'Generate tests for code',
      template: `You are a testing expert. Create comprehensive tests for the following code:

Code to Test: {context}
Testing Requirements: {userInput}

Please provide:
1. Unit test cases
2. Integration test scenarios
3. Edge case coverage
4. Test implementation code

Focus on thorough coverage and practical test cases.`,
      variables: ['context', 'userInput'],
      category: 'testing'
    });

    // Load custom templates from storage
    try {
      const result = await chrome.storage.sync.get(['customPromptTemplates']);
      if (result.customPromptTemplates) {
        Object.entries(result.customPromptTemplates).forEach(([id, template]) => {
          this.promptTemplates.set(id, template);
        });
      }
    } catch (error) {
      console.warn('Could not load custom prompt templates:', error);
    }
  }

  async saveCustomTemplate(template) {
    try {
      const result = await chrome.storage.sync.get(['customPromptTemplates']);
      const customTemplates = result.customPromptTemplates || {};
      
      customTemplates[template.id] = template;
      
      await chrome.storage.sync.set({ customPromptTemplates: customTemplates });
      this.promptTemplates.set(template.id, template);
      
      return true;
    } catch (error) {
      console.error('Failed to save custom template:', error);
      return false;
    }
  }

  async deleteCustomTemplate(templateId) {
    try {
      const result = await chrome.storage.sync.get(['customPromptTemplates']);
      const customTemplates = result.customPromptTemplates || {};
      
      delete customTemplates[templateId];
      
      await chrome.storage.sync.set({ customPromptTemplates: customTemplates });
      this.promptTemplates.delete(templateId);
      
      return true;
    } catch (error) {
      console.error('Failed to delete custom template:', error);
      return false;
    }
  }

  getPromptTemplate(templateId) {
    return this.promptTemplates.get(templateId);
  }

  getAllPromptTemplates() {
    return Array.from(this.promptTemplates.values());
  }

  getTemplatesByCategory(category) {
    return Array.from(this.promptTemplates.values())
      .filter(template => template.category === category);
  }

  processTemplate(templateId, variables) {
    const template = this.promptTemplates.get(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    let processedTemplate = template.template;
    
    // Replace variables in template
    template.variables.forEach(variable => {
      const value = variables[variable] || '';
      const regex = new RegExp(`{${variable}}`, 'g');
      processedTemplate = processedTemplate.replace(regex, value);
    });

    return processedTemplate;
  }

  // ==================== CONVERSATION MEMORY ====================
  
  async initializeConversationMemory() {
    this.conversationMemory = new ConversationMemory();
    await this.conversationMemory.initialize();
  }

  async saveConversation(conversation) {
    if (this.conversationMemory) {
      return await this.conversationMemory.saveConversation(conversation);
    }
    return false;
  }

  async getConversationHistory(limit = 10) {
    if (this.conversationMemory) {
      return await this.conversationMemory.getHistory(limit);
    }
    return [];
  }

  async searchConversations(query) {
    if (this.conversationMemory) {
      return await this.conversationMemory.search(query);
    }
    return [];
  }

  // ==================== MODEL MANAGER ====================
  
  initializeModelManager() {
    this.modelManager = new AIModelManager();
  }

  async getAvailableModels() {
    return this.modelManager.getAvailableModels();
  }

  async setActiveModel(modelId) {
    return this.modelManager.setActiveModel(modelId);
  }

  getActiveModel() {
    return this.modelManager.getActiveModel();
  }

  // ==================== SMART SUGGESTIONS ====================
  
  initializeSmartSuggestions() {
    this.smartSuggestions = new SmartSuggestions();
  }

  async generateSuggestions(context) {
    if (this.smartSuggestions) {
      return await this.smartSuggestions.generateSuggestions(context);
    }
    return [];
  }

  // ==================== CODE GENERATOR ====================
  
  initializeCodeGenerator() {
    this.codeGenerator = new CodeGenerator();
  }

  async generateCode(prompt, context, options = {}) {
    if (this.codeGenerator) {
      return await this.codeGenerator.generate(prompt, context, options);
    }
    return null;
  }

  async refactorCode(code, instructions, context) {
    if (this.codeGenerator) {
      return await this.codeGenerator.refactor(code, instructions, context);
    }
    return null;
  }

  async generateTests(code, testType = 'unit') {
    if (this.codeGenerator) {
      return await this.codeGenerator.generateTests(code, testType);
    }
    return null;
  }
}

// ==================== CONVERSATION MEMORY ====================

class ConversationMemory {
  constructor() {
    this.conversations = [];
    this.maxConversations = 100;
    this.maxMessagesPerConversation = 50;
  }

  async initialize() {
    await this.loadConversations();
  }

  async loadConversations() {
    try {
      const result = await chrome.storage.local.get(['conversationHistory']);
      this.conversations = result.conversationHistory || [];
    } catch (error) {
      console.warn('Could not load conversation history:', error);
      this.conversations = [];
    }
  }

  async saveConversations() {
    try {
      await chrome.storage.local.set({ 
        conversationHistory: this.conversations.slice(-this.maxConversations)
      });
      return true;
    } catch (error) {
      console.error('Failed to save conversations:', error);
      return false;
    }
  }

  async saveConversation(conversation) {
    const conversationData = {
      id: this.generateConversationId(),
      timestamp: Date.now(),
      url: window.location.href,
      title: document.title,
      messages: conversation.slice(-this.maxMessagesPerConversation),
      summary: this.generateConversationSummary(conversation)
    };

    this.conversations.push(conversationData);
    
    // Keep only recent conversations
    if (this.conversations.length > this.maxConversations) {
      this.conversations = this.conversations.slice(-this.maxConversations);
    }

    return await this.saveConversations();
  }

  generateConversationId() {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateConversationSummary(messages) {
    if (messages.length === 0) return 'Empty conversation';
    
    const userMessages = messages.filter(msg => msg.role === 'user');
    if (userMessages.length === 0) return 'No user messages';
    
    const firstMessage = userMessages[0].content;
    return firstMessage.length > 100 ? 
      firstMessage.substring(0, 100) + '...' : 
      firstMessage;
  }

  async getHistory(limit = 10) {
    return this.conversations
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  async search(query) {
    const lowercaseQuery = query.toLowerCase();
    
    return this.conversations.filter(conv => {
      return conv.summary.toLowerCase().includes(lowercaseQuery) ||
             conv.title.toLowerCase().includes(lowercaseQuery) ||
             conv.messages.some(msg => 
               msg.content.toLowerCase().includes(lowercaseQuery)
             );
    }).sort((a, b) => b.timestamp - a.timestamp);
  }

  async clearHistory() {
    this.conversations = [];
    return await this.saveConversations();
  }

  async deleteConversation(conversationId) {
    this.conversations = this.conversations.filter(conv => conv.id !== conversationId);
    return await this.saveConversations();
  }

  getConversationById(conversationId) {
    return this.conversations.find(conv => conv.id === conversationId);
  }
}

// ==================== AI MODEL MANAGER ====================

class AIModelManager {
  constructor() {
    this.models = new Map();
    this.activeModel = null;
    this.initializeModels();
  }

  initializeModels() {
    // OpenAI Models
    this.models.set('gpt-4', {
      id: 'gpt-4',
      name: 'GPT-4',
      provider: 'openai',
      description: 'Most capable model, best for complex reasoning',
      maxTokens: 8192,
      costTier: 'high',
      capabilities: ['reasoning', 'coding', 'analysis', 'creativity']
    });

    this.models.set('gpt-3.5-turbo', {
      id: 'gpt-3.5-turbo',
      name: 'GPT-3.5 Turbo',
      provider: 'openai',
      description: 'Fast and efficient for most tasks',
      maxTokens: 4096,
      costTier: 'medium',
      capabilities: ['reasoning', 'coding', 'analysis']
    });

    // Anthropic Models
    this.models.set('claude-3-opus', {
      id: 'claude-3-opus',
      name: 'Claude 3 Opus',
      provider: 'anthropic',
      description: 'Excellent for analysis and reasoning',
      maxTokens: 200000,
      costTier: 'high',
      capabilities: ['reasoning', 'analysis', 'coding', 'safety']
    });

    this.models.set('claude-3-sonnet', {
      id: 'claude-3-sonnet',
      name: 'Claude 3 Sonnet',
      provider: 'anthropic',
      description: 'Balanced performance and cost',
      maxTokens: 200000,
      costTier: 'medium',
      capabilities: ['reasoning', 'analysis', 'coding']
    });

    // Google Models
    this.models.set('gemini-pro', {
      id: 'gemini-pro',
      name: 'Gemini Pro',
      provider: 'google',
      description: 'Google\'s advanced language model',
      maxTokens: 32768,
      costTier: 'medium',
      capabilities: ['reasoning', 'coding', 'analysis', 'multimodal']
    });

    // Set default model
    this.activeModel = 'gpt-3.5-turbo';
  }

  getAvailableModels() {
    return Array.from(this.models.values());
  }

  getModelsByProvider(provider) {
    return Array.from(this.models.values())
      .filter(model => model.provider === provider);
  }

  getModelsByCapability(capability) {
    return Array.from(this.models.values())
      .filter(model => model.capabilities.includes(capability));
  }

  async setActiveModel(modelId) {
    if (this.models.has(modelId)) {
      this.activeModel = modelId;
      
      // Save to storage
      try {
        await chrome.storage.sync.set({ activeAIModel: modelId });
        return true;
      } catch (error) {
        console.error('Failed to save active model:', error);
        return false;
      }
    }
    return false;
  }

  getActiveModel() {
    return this.models.get(this.activeModel);
  }

  getModelInfo(modelId) {
    return this.models.get(modelId);
  }

  async loadActiveModel() {
    try {
      const result = await chrome.storage.sync.get(['activeAIModel']);
      if (result.activeAIModel && this.models.has(result.activeAIModel)) {
        this.activeModel = result.activeAIModel;
      }
    } catch (error) {
      console.warn('Could not load active model:', error);
    }
  }
}

// ==================== SMART SUGGESTIONS ====================

class SmartSuggestions {
  constructor() {
    this.suggestionRules = [];
    this.initializeSuggestionRules();
  }

  initializeSuggestionRules() {
    this.suggestionRules = [
      {
        id: 'console-errors',
        condition: (context) => context.console && context.console.errors.length > 0,
        suggestion: {
          type: 'debug',
          title: '🐛 Debug Console Errors',
          description: 'Found console errors that need attention',
          action: 'debug',
          priority: 'high'
        }
      },
      {
        id: 'performance-issues',
        condition: (context) => context.performance && context.performance.loadTime > 3000,
        suggestion: {
          type: 'performance',
          title: '⚡ Optimize Page Performance',
          description: 'Page load time is slower than recommended',
          action: 'performance',
          priority: 'medium'
        }
      },
      {
        id: 'accessibility-issues',
        condition: (context) => context.html && this.hasAccessibilityIssues(context.html),
        suggestion: {
          type: 'accessibility',
          title: '♿ Improve Accessibility',
          description: 'Potential accessibility improvements detected',
          action: 'accessibility',
          priority: 'medium'
        }
      },
      {
        id: 'security-concerns',
        condition: (context) => context.security && this.hasSecurityConcerns(context.security),
        suggestion: {
          type: 'security',
          title: '🔒 Security Review Needed',
          description: 'Potential security issues detected',
          action: 'security',
          priority: 'high'
        }
      },
      {
        id: 'code-quality',
        condition: (context) => context.javascript && this.hasCodeQualityIssues(context.javascript),
        suggestion: {
          type: 'code-review',
          title: '👀 Code Quality Review',
          description: 'Code quality improvements available',
          action: 'code-review',
          priority: 'low'
        }
      }
    ];
  }

  async generateSuggestions(context) {
    const suggestions = [];

    for (const rule of this.suggestionRules) {
      try {
        if (rule.condition(context)) {
          suggestions.push({
            ...rule.suggestion,
            id: rule.id,
            timestamp: Date.now()
          });
        }
      } catch (error) {
        console.warn(`Error evaluating suggestion rule ${rule.id}:`, error);
      }
    }

    // Sort by priority
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    suggestions.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);

    return suggestions;
  }

  hasAccessibilityIssues(htmlContext) {
    // Simple accessibility checks
    const issues = [
      !htmlContext.includes('alt='), // Missing alt attributes
      !htmlContext.includes('aria-'), // Missing ARIA attributes
      !htmlContext.includes('<h1'), // Missing heading structure
      htmlContext.includes('onclick=') && !htmlContext.includes('onkeydown=') // Click without keyboard
    ];

    return issues.some(issue => issue);
  }

  hasSecurityConcerns(securityContext) {
    // Simple security checks
    const concerns = [
      securityContext.mixedContent, // Mixed content
      !securityContext.https, // Not HTTPS
      securityContext.vulnerabilities && securityContext.vulnerabilities.length > 0
    ];

    return concerns.some(concern => concern);
  }

  hasCodeQualityIssues(jsContext) {
    // Simple code quality checks
    const issues = [
      jsContext.includes('console.log'), // Console logs in production
      jsContext.includes('eval('), // Use of eval
      jsContext.includes('document.write'), // Use of document.write
      jsContext.includes('var ') && jsContext.includes('let ') // Mixed var/let usage
    ];

    return issues.some(issue => issue);
  }
}

// ==================== CODE GENERATOR ====================

class CodeGenerator {
  constructor() {
    this.templates = new Map();
    this.initializeTemplates();
  }

  initializeTemplates() {
    this.templates.set('function', {
      template: `function {name}({parameters}) {
  {body}
}`,
      variables: ['name', 'parameters', 'body']
    });

    this.templates.set('class', {
      template: `class {name} {
  constructor({constructorParams}) {
    {constructorBody}
  }

  {methods}
}`,
      variables: ['name', 'constructorParams', 'constructorBody', 'methods']
    });

    this.templates.set('test', {
      template: `describe('{description}', () => {
  {testCases}
});`,
      variables: ['description', 'testCases']
    });
  }

  async generate(prompt, context, options = {}) {
    // This would integrate with the AI service to generate code
    // For now, return a placeholder
    return {
      code: `// Generated code based on: ${prompt}`,
      explanation: 'Code generation would be implemented here',
      suggestions: []
    };
  }

  async refactor(code, instructions, context) {
    // This would integrate with the AI service to refactor code
    return {
      refactoredCode: code, // Placeholder
      changes: [],
      explanation: 'Code refactoring would be implemented here'
    };
  }

  async generateTests(code, testType = 'unit') {
    // This would integrate with the AI service to generate tests
    return {
      tests: `// Generated ${testType} tests for the provided code`,
      framework: 'jest',
      coverage: []
    };
  }
}

// Make AdvancedAIFeatures available globally
window.AdvancedAIFeatures = AdvancedAIFeatures;