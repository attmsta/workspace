// AI Model Selection System for Eruda AI Assistant
class ModelSelector {
  constructor() {
    this.models = new Map();
    this.providers = new Map();
    this.activeModel = null;
    this.activeProvider = null;
    
    this.initializeProviders();
    this.initializeModels();
  }

  initializeProviders() {
    // OpenAI
    this.providers.set('openai', {
      id: 'openai',
      name: 'OpenAI',
      description: 'GPT models from OpenAI',
      apiKeyRequired: true,
      baseUrl: 'https://api.openai.com/v1',
      icon: '🤖',
      status: 'active'
    });

    // Anthropic
    this.providers.set('anthropic', {
      id: 'anthropic',
      name: 'Anthropic',
      description: 'Claude models from Anthropic',
      apiKeyRequired: true,
      baseUrl: 'https://api.anthropic.com/v1',
      icon: '🧠',
      status: 'active'
    });

    // Google AI
    this.providers.set('google', {
      id: 'google',
      name: 'Google AI',
      description: 'Gemini models from Google',
      apiKeyRequired: true,
      baseUrl: 'https://generativelanguage.googleapis.com/v1',
      icon: '🔍',
      status: 'active'
    });

    // Cohere
    this.providers.set('cohere', {
      id: 'cohere',
      name: 'Cohere',
      description: 'Command models from Cohere',
      apiKeyRequired: true,
      baseUrl: 'https://api.cohere.ai/v1',
      icon: '⚡',
      status: 'active'
    });

    // Mistral AI
    this.providers.set('mistral', {
      id: 'mistral',
      name: 'Mistral AI',
      description: 'Mistral models',
      apiKeyRequired: true,
      baseUrl: 'https://api.mistral.ai/v1',
      icon: '🌪️',
      status: 'active'
    });

    // Perplexity
    this.providers.set('perplexity', {
      id: 'perplexity',
      name: 'Perplexity',
      description: 'Perplexity AI models',
      apiKeyRequired: true,
      baseUrl: 'https://api.perplexity.ai',
      icon: '🔮',
      status: 'active'
    });

    // Together AI
    this.providers.set('together', {
      id: 'together',
      name: 'Together AI',
      description: 'Open source models via Together AI',
      apiKeyRequired: true,
      baseUrl: 'https://api.together.xyz/v1',
      icon: '🤝',
      status: 'active'
    });

    // Groq
    this.providers.set('groq', {
      id: 'groq',
      name: 'Groq',
      description: 'Fast inference with Groq',
      apiKeyRequired: true,
      baseUrl: 'https://api.groq.com/openai/v1',
      icon: '⚡',
      status: 'active'
    });
  }

  initializeModels() {
    // OpenAI Models (Updated December 2024)
    this.addModel({
      id: 'gpt-4o',
      name: 'GPT-4o',
      provider: 'openai',
      description: 'Latest GPT-4 Omni model with multimodal capabilities',
      maxTokens: 128000,
      contextWindow: 128000,
      costTier: 'high',
      capabilities: ['text', 'vision', 'reasoning', 'coding', 'analysis'],
      recommended: true,
      releaseDate: '2024-05-13'
    });

    this.addModel({
      id: 'gpt-4o-mini',
      name: 'GPT-4o Mini',
      provider: 'openai',
      description: 'Smaller, faster version of GPT-4o',
      maxTokens: 128000,
      contextWindow: 128000,
      costTier: 'medium',
      capabilities: ['text', 'reasoning', 'coding', 'analysis'],
      recommended: true,
      releaseDate: '2024-07-18'
    });

    this.addModel({
      id: 'gpt-4-turbo',
      name: 'GPT-4 Turbo',
      provider: 'openai',
      description: 'Enhanced GPT-4 with improved performance',
      maxTokens: 128000,
      contextWindow: 128000,
      costTier: 'high',
      capabilities: ['text', 'vision', 'reasoning', 'coding', 'analysis'],
      releaseDate: '2024-04-09'
    });

    this.addModel({
      id: 'gpt-3.5-turbo',
      name: 'GPT-3.5 Turbo',
      provider: 'openai',
      description: 'Fast and efficient for most tasks',
      maxTokens: 16385,
      contextWindow: 16385,
      costTier: 'low',
      capabilities: ['text', 'reasoning', 'coding'],
      releaseDate: '2023-03-01'
    });

    // Anthropic Models (Updated December 2024)
    this.addModel({
      id: 'claude-3-5-sonnet-20241022',
      name: 'Claude 3.5 Sonnet (Latest)',
      provider: 'anthropic',
      description: 'Latest Claude 3.5 Sonnet with enhanced capabilities',
      maxTokens: 8192,
      contextWindow: 200000,
      costTier: 'high',
      capabilities: ['text', 'reasoning', 'coding', 'analysis', 'safety'],
      recommended: true,
      releaseDate: '2024-10-22'
    });

    this.addModel({
      id: 'claude-3-5-haiku-20241022',
      name: 'Claude 3.5 Haiku',
      provider: 'anthropic',
      description: 'Fast and efficient Claude model',
      maxTokens: 8192,
      contextWindow: 200000,
      costTier: 'low',
      capabilities: ['text', 'reasoning', 'coding'],
      recommended: true,
      releaseDate: '2024-10-22'
    });

    this.addModel({
      id: 'claude-3-opus-20240229',
      name: 'Claude 3 Opus',
      provider: 'anthropic',
      description: 'Most capable Claude model for complex tasks',
      maxTokens: 4096,
      contextWindow: 200000,
      costTier: 'high',
      capabilities: ['text', 'reasoning', 'coding', 'analysis', 'creativity'],
      releaseDate: '2024-02-29'
    });

    // Google AI Models (Updated December 2024)
    this.addModel({
      id: 'gemini-1.5-pro',
      name: 'Gemini 1.5 Pro',
      provider: 'google',
      description: 'Advanced Gemini model with large context window',
      maxTokens: 8192,
      contextWindow: 2000000,
      costTier: 'high',
      capabilities: ['text', 'vision', 'reasoning', 'coding', 'multimodal'],
      recommended: true,
      releaseDate: '2024-02-15'
    });

    this.addModel({
      id: 'gemini-1.5-flash',
      name: 'Gemini 1.5 Flash',
      provider: 'google',
      description: 'Fast Gemini model optimized for speed',
      maxTokens: 8192,
      contextWindow: 1000000,
      costTier: 'medium',
      capabilities: ['text', 'vision', 'reasoning', 'coding'],
      recommended: true,
      releaseDate: '2024-05-14'
    });

    this.addModel({
      id: 'gemini-pro',
      name: 'Gemini Pro',
      provider: 'google',
      description: 'Standard Gemini model for general use',
      maxTokens: 8192,
      contextWindow: 32768,
      costTier: 'medium',
      capabilities: ['text', 'reasoning', 'coding'],
      releaseDate: '2023-12-06'
    });

    // Cohere Models
    this.addModel({
      id: 'command-r-plus',
      name: 'Command R+',
      provider: 'cohere',
      description: 'Advanced Command model with enhanced capabilities',
      maxTokens: 4096,
      contextWindow: 128000,
      costTier: 'high',
      capabilities: ['text', 'reasoning', 'coding', 'analysis'],
      recommended: true,
      releaseDate: '2024-04-04'
    });

    this.addModel({
      id: 'command-r',
      name: 'Command R',
      provider: 'cohere',
      description: 'Balanced Command model for general use',
      maxTokens: 4096,
      contextWindow: 128000,
      costTier: 'medium',
      capabilities: ['text', 'reasoning', 'coding'],
      releaseDate: '2024-03-11'
    });

    // Mistral AI Models
    this.addModel({
      id: 'mistral-large-2407',
      name: 'Mistral Large 2',
      provider: 'mistral',
      description: 'Latest Mistral Large model',
      maxTokens: 8192,
      contextWindow: 128000,
      costTier: 'high',
      capabilities: ['text', 'reasoning', 'coding', 'analysis'],
      recommended: true,
      releaseDate: '2024-07-24'
    });

    this.addModel({
      id: 'mistral-small-2409',
      name: 'Mistral Small',
      provider: 'mistral',
      description: 'Efficient Mistral model for everyday tasks',
      maxTokens: 8192,
      contextWindow: 128000,
      costTier: 'low',
      capabilities: ['text', 'reasoning', 'coding'],
      releaseDate: '2024-09-18'
    });

    // Perplexity Models
    this.addModel({
      id: 'llama-3.1-sonar-large-128k-online',
      name: 'Llama 3.1 Sonar Large (Online)',
      provider: 'perplexity',
      description: 'Llama 3.1 with real-time web search',
      maxTokens: 4096,
      contextWindow: 127072,
      costTier: 'high',
      capabilities: ['text', 'reasoning', 'web-search', 'real-time'],
      recommended: true,
      releaseDate: '2024-07-23'
    });

    this.addModel({
      id: 'llama-3.1-sonar-small-128k-online',
      name: 'Llama 3.1 Sonar Small (Online)',
      provider: 'perplexity',
      description: 'Efficient Llama 3.1 with web search',
      maxTokens: 4096,
      contextWindow: 127072,
      costTier: 'medium',
      capabilities: ['text', 'reasoning', 'web-search', 'real-time'],
      releaseDate: '2024-07-23'
    });

    // Together AI Models (Open Source)
    this.addModel({
      id: 'meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo',
      name: 'Llama 3.1 405B Instruct',
      provider: 'together',
      description: 'Largest open-source Llama model',
      maxTokens: 4096,
      contextWindow: 32768,
      costTier: 'high',
      capabilities: ['text', 'reasoning', 'coding', 'analysis'],
      recommended: true,
      releaseDate: '2024-07-23'
    });

    this.addModel({
      id: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
      name: 'Llama 3.1 70B Instruct',
      provider: 'together',
      description: 'High-performance open-source model',
      maxTokens: 4096,
      contextWindow: 32768,
      costTier: 'medium',
      capabilities: ['text', 'reasoning', 'coding'],
      releaseDate: '2024-07-23'
    });

    this.addModel({
      id: 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
      name: 'Llama 3.1 8B Instruct',
      provider: 'together',
      description: 'Fast and efficient open-source model',
      maxTokens: 4096,
      contextWindow: 32768,
      costTier: 'low',
      capabilities: ['text', 'reasoning', 'coding'],
      releaseDate: '2024-07-23'
    });

    // Groq Models (Fast Inference)
    this.addModel({
      id: 'llama-3.1-405b-reasoning',
      name: 'Llama 3.1 405B (Groq)',
      provider: 'groq',
      description: 'Ultra-fast inference of Llama 3.1 405B',
      maxTokens: 8192,
      contextWindow: 32768,
      costTier: 'high',
      capabilities: ['text', 'reasoning', 'coding', 'fast-inference'],
      recommended: true,
      releaseDate: '2024-07-23'
    });

    this.addModel({
      id: 'llama-3.1-70b-versatile',
      name: 'Llama 3.1 70B (Groq)',
      provider: 'groq',
      description: 'Ultra-fast inference of Llama 3.1 70B',
      maxTokens: 8192,
      contextWindow: 32768,
      costTier: 'medium',
      capabilities: ['text', 'reasoning', 'coding', 'fast-inference'],
      recommended: true,
      releaseDate: '2024-07-23'
    });

    this.addModel({
      id: 'llama-3.1-8b-instant',
      name: 'Llama 3.1 8B (Groq)',
      provider: 'groq',
      description: 'Ultra-fast inference of Llama 3.1 8B',
      maxTokens: 8192,
      contextWindow: 32768,
      costTier: 'low',
      capabilities: ['text', 'reasoning', 'coding', 'fast-inference'],
      releaseDate: '2024-07-23'
    });

    // Set default model
    this.activeModel = 'gpt-4o-mini';
    this.activeProvider = 'openai';
  }

  addModel(model) {
    this.models.set(model.id, model);
  }

  getProviders() {
    return Array.from(this.providers.values());
  }

  getProvider(providerId) {
    return this.providers.get(providerId);
  }

  getModels() {
    return Array.from(this.models.values());
  }

  getModelsByProvider(providerId) {
    return Array.from(this.models.values())
      .filter(model => model.provider === providerId)
      .sort((a, b) => {
        // Sort by recommended first, then by release date (newest first)
        if (a.recommended && !b.recommended) return -1;
        if (!a.recommended && b.recommended) return 1;
        return new Date(b.releaseDate) - new Date(a.releaseDate);
      });
  }

  getRecommendedModels() {
    return Array.from(this.models.values())
      .filter(model => model.recommended)
      .sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
  }

  getModelsByCapability(capability) {
    return Array.from(this.models.values())
      .filter(model => model.capabilities.includes(capability));
  }

  getModelsByCostTier(costTier) {
    return Array.from(this.models.values())
      .filter(model => model.costTier === costTier);
  }

  getModel(modelId) {
    return this.models.get(modelId);
  }

  getActiveModel() {
    return this.models.get(this.activeModel);
  }

  getActiveProvider() {
    return this.providers.get(this.activeProvider);
  }

  async setActiveModel(modelId) {
    const model = this.models.get(modelId);
    if (!model) {
      throw new Error(`Model ${modelId} not found`);
    }

    this.activeModel = modelId;
    this.activeProvider = model.provider;

    // Save to storage
    try {
      await chrome.storage.sync.set({
        activeAIModel: modelId,
        activeAIProvider: model.provider
      });
      return true;
    } catch (error) {
      console.error('Failed to save active model:', error);
      return false;
    }
  }

  async loadActiveModel() {
    try {
      const result = await chrome.storage.sync.get(['activeAIModel', 'activeAIProvider']);
      
      if (result.activeAIModel && this.models.has(result.activeAIModel)) {
        this.activeModel = result.activeAIModel;
        const model = this.models.get(result.activeAIModel);
        this.activeProvider = model.provider;
      }
      
      if (result.activeAIProvider && this.providers.has(result.activeAIProvider)) {
        this.activeProvider = result.activeAIProvider;
      }
    } catch (error) {
      console.warn('Could not load active model:', error);
    }
  }

  getModelDisplayInfo(modelId) {
    const model = this.models.get(modelId);
    if (!model) return null;

    const provider = this.providers.get(model.provider);
    
    return {
      ...model,
      providerName: provider?.name || model.provider,
      providerIcon: provider?.icon || '🤖',
      displayName: `${provider?.icon || '🤖'} ${model.name}`,
      costDisplay: this.getCostDisplay(model.costTier),
      capabilityIcons: this.getCapabilityIcons(model.capabilities)
    };
  }

  getCostDisplay(costTier) {
    const costMap = {
      low: '💰',
      medium: '💰💰',
      high: '💰💰💰'
    };
    return costMap[costTier] || '💰';
  }

  getCapabilityIcons(capabilities) {
    const iconMap = {
      text: '📝',
      vision: '👁️',
      reasoning: '🧠',
      coding: '💻',
      analysis: '📊',
      creativity: '🎨',
      safety: '🛡️',
      multimodal: '🔄',
      'web-search': '🌐',
      'real-time': '⚡',
      'fast-inference': '🚀'
    };

    return capabilities.map(cap => iconMap[cap] || '⭐').join(' ');
  }

  searchModels(query) {
    const lowercaseQuery = query.toLowerCase();
    
    return Array.from(this.models.values()).filter(model => {
      return model.name.toLowerCase().includes(lowercaseQuery) ||
             model.description.toLowerCase().includes(lowercaseQuery) ||
             model.provider.toLowerCase().includes(lowercaseQuery) ||
             model.capabilities.some(cap => cap.toLowerCase().includes(lowercaseQuery));
    });
  }

  getModelComparison(modelIds) {
    return modelIds.map(id => this.getModelDisplayInfo(id)).filter(Boolean);
  }

  getProviderStatus(providerId) {
    const provider = this.providers.get(providerId);
    return provider?.status || 'unknown';
  }

  async checkProviderApiKey(providerId) {
    try {
      const result = await chrome.storage.sync.get([`${providerId}ApiKey`]);
      return !!result[`${providerId}ApiKey`];
    } catch (error) {
      console.warn(`Could not check API key for ${providerId}:`, error);
      return false;
    }
  }

  getModelRecommendations(context = {}) {
    const recommendations = [];

    // Recommend based on context
    if (context.task === 'debugging') {
      recommendations.push(...this.getModelsByCapability('reasoning'));
    } else if (context.task === 'coding') {
      recommendations.push(...this.getModelsByCapability('coding'));
    } else if (context.task === 'analysis') {
      recommendations.push(...this.getModelsByCapability('analysis'));
    }

    // Recommend based on cost preference
    if (context.costPreference === 'low') {
      recommendations.push(...this.getModelsByCostTier('low'));
    } else if (context.costPreference === 'high') {
      recommendations.push(...this.getModelsByCostTier('high'));
    }

    // Remove duplicates and sort by recommendation score
    const uniqueRecommendations = Array.from(new Set(recommendations.map(m => m.id)))
      .map(id => this.models.get(id))
      .filter(Boolean);

    return uniqueRecommendations.slice(0, 5); // Top 5 recommendations
  }
}

// Make ModelSelector available globally
window.ModelSelector = ModelSelector;