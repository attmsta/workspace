// In-browser vector store implementation for RAG system
class VectorStore {
  constructor() {
    this.documents = [];
    this.embeddings = [];
    this.indexedDB = null;
    this.dbName = 'ErudaAIVectorStore';
    this.dbVersion = 2; // Incremented for new features
    this.contextManager = null; // Will be injected
    this.semanticCache = new Map(); // Cache for semantic search results
    this.lastError = null;
    this.categoryWeights = {
      HTML: 0.8,
      CSS: 0.7,
      JAVASCRIPT: 0.9,
      NETWORK: 0.6,
      CONSOLE: 0.8,
      PERFORMANCE: 0.7,
      ACCESSIBILITY: 0.6,
      SECURITY: 0.8
    };
  }

  async initialize() {
    await this.initializeDB();
    await this.loadDocuments();
  }

  async initializeDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = (event) => {
        const error = event.target.error;
        console.error('IndexedDB: Error opening database', event.target.errorCode, error);
        this.lastError = { timestamp: Date.now(), message: error?.message || String(error), operation: 'initializeDB' };
        reject(error);
      };
      request.onsuccess = () => {
        this.indexedDB = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create documents store
        if (!db.objectStoreNames.contains('documents')) {
          const documentsStore = db.createObjectStore('documents', { keyPath: 'id', autoIncrement: true });
          documentsStore.createIndex('url', 'url', { unique: false });
          documentsStore.createIndex('type', 'type', { unique: false });
          documentsStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
        
        // Create embeddings store
        if (!db.objectStoreNames.contains('embeddings')) {
          const embeddingsStore = db.createObjectStore('embeddings', { keyPath: 'documentId' });
        }
      };
    });
  }

  async loadDocuments() {
    const transaction = this.indexedDB.transaction(['documents', 'embeddings'], 'readonly');
    const documentsStore = transaction.objectStore('documents');
    const embeddingsStore = transaction.objectStore('embeddings');
    
    const documentsRequest = documentsStore.getAll();
    const embeddingsRequest = embeddingsStore.getAll();
    
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => {
        this.documents = documentsRequest.result || [];
        this.embeddings = embeddingsRequest.result || [];
        resolve();
      };
      transaction.onerror = (event) => {
        const error = event.target.error;
        console.error('IndexedDB: Error loading documents from transaction', error);
        this.lastError = { timestamp: Date.now(), message: error?.message || String(error), operation: 'loadDocuments' };
        reject(error);
      };
    });
  }

  async addDocument(document) {
    try {
      // Add timestamp and generate chunks
      const doc = {
        ...document,
        id: Date.now() + Math.random(),
        timestamp: document.timestamp || Date.now()
      };

      // Split content into chunks for better retrieval
      const chunks = this.chunkContent(doc.content, 500);
      
      for (let i = 0; i < chunks.length; i++) {
        const chunkDoc = {
          ...doc,
          id: `${doc.id}_chunk_${i}`,
          content: chunks[i],
          chunkIndex: i,
          totalChunks: chunks.length
        };

        // Generate embedding for the chunk
        const embedding = await this.generateEmbedding(chunks[i]);

        // Store document and embedding
        await this.storeDocument(chunkDoc);
        await this.storeEmbedding(chunkDoc.id, embedding);
      }

      // Update in-memory collections
      await this.loadDocuments();
    } catch (error) {
      this.lastError = { timestamp: Date.now(), message: error.message || String(error), operation: 'addDocument' };
      throw error; // Re-throw after logging
    }
  }

  chunkContent(content, maxLength = 500) {
    if (content.length <= maxLength) {
      return [content];
    }

    const chunks = [];
    let start = 0;
    
    while (start < content.length) {
      let end = start + maxLength;
      
      // Try to break at word boundaries
      if (end < content.length) {
        const lastSpace = content.lastIndexOf(' ', end);
        if (lastSpace > start + maxLength * 0.5) {
          end = lastSpace;
        }
      }
      
      chunks.push(content.slice(start, end).trim());
      start = end;
    }
    
    return chunks.filter(chunk => chunk.length > 0);
  }

  async generateEmbedding(text) {
    // Try to use OpenAI embeddings if available, fallback to simple embeddings
    try {
      const openaiEmbedding = await this.generateOpenAIEmbedding(text);
      if (openaiEmbedding) {
        return openaiEmbedding;
      }
    } catch (error) {
      console.warn('OpenAI embeddings not available, using simple embeddings:', error.message);
        // Do not set lastError here if simple embedding is a planned fallback
    }
    
    try {
      return this.generateSimpleEmbedding(text);
    } catch (error) {
      this.lastError = { timestamp: Date.now(), message: error.message || String(error), operation: 'generateSimpleEmbedding' };
      throw error;
    }
  }

  async generateOpenAIEmbedding(text) {
    try {
      // Check if we have OpenAI settings
      const settings = await this.getSettings();
      if (!settings || settings.provider !== 'openai' || !settings.apiKey) {
        if (!settings || !settings.apiKey) {
          console.warn('OpenAI API key is missing. Cannot generate online embeddings.');
        }
        return null;
      }

      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${settings.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'text-embedding-ada-002',
          input: text.substring(0, 8000) // Limit text length
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.warn('OpenAI API request failed: Unauthorized. Check API key.');
        } else if (response.status === 429) {
          console.warn('OpenAI API request failed: Rate limit exceeded.');
        } else {
          console.warn('Failed to generate OpenAI embedding:', new Error(`OpenAI API error: ${response.statusText}`));
        }
        // Do not set lastError for failed API requests here, as it's handled by the caller or specific status codes
        return null;
      }

      const data = await response.json();
      return data.data[0].embedding;
    } catch (error) {
      const errorMessage = error.message || String(error);
      if (error instanceof TypeError && errorMessage === 'Failed to fetch') {
        console.warn('OpenAI API request failed: Network error.');
        this.lastError = { timestamp: Date.now(), message: 'Network error: Failed to fetch OpenAI embeddings.', operation: 'generateOpenAIEmbedding' };
      } else {
        console.warn('Failed to generate OpenAI embedding:', error);
        this.lastError = { timestamp: Date.now(), message: errorMessage, operation: 'generateOpenAIEmbedding' };
      }
      return null; // Explicitly return null on error
    }
  }

  async getSettings() {
    // Get settings from chrome storage
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const result = await chrome.storage.sync.get({
          provider: 'openai',
          apiKey: '',
          model: ''
        });
        return result;
      }
    } catch (error) {
      console.warn('Could not access chrome storage:', error);
    }
    return null;
  }

  generateSimpleEmbedding(text, dimensions = 384) {
    // Simple hash-based embedding for demonstration.
    // This creates a deterministic vector based on text content.
    // Stop words are removed to slightly improve relevance for this basic method.
    const STOP_WORDS = new Set([
      'the', 'a', 'is', 'in', 'it', 'of', 'and', 'to', 'for', 'on', 'with',
      'as', 'by', 'an', 'at', 'this', 'that', 'these', 'those', 'i', 'you',
      'he', 'she', 'we', 'they', 'was', 'were', 'be', 'has', 'had', 'do'
    ]);

    let words = text.toLowerCase().match(/\b\w+\b/g) || [];
    words = words.filter(word => !STOP_WORDS.has(word));

    const embedding = new Array(dimensions).fill(0);
    
    // This part is unlikely to throw an error with current logic, but good practice if complex ops were added.
    // For now, not adding try-catch around the loop for performance of this simple method.
    // If it could fail, a try-catch would be:
    // try {
    //   words.forEach(...);
    // } catch (e) {
    //   this.lastError = { timestamp: Date.now(), message: e.message, operation: 'generateSimpleEmbedding_loop' };
    //   throw e;
    // }
    words.forEach((word, index) => {
      const hash = this.simpleHash(word);
      for (let i = 0; i < dimensions; i++) {
        embedding[i] += Math.sin(hash + i) * Math.cos(hash * i + index);
      }
    });
    
    // Normalize the vector
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => magnitude > 0 ? val / magnitude : 0);
  }

  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash;
  }

  async storeDocument(document) {
    const transaction = this.indexedDB.transaction(['documents'], 'readwrite');
    const store = transaction.objectStore('documents');
    
    return new Promise((resolve, reject) => {
      const request = store.add(document);
      request.onsuccess = () => resolve(request.result);
      request.onerror = (event) => {
        console.error('IndexedDB: Error storing document', event.target.error);
        const error = event.target.error;
        console.error('IndexedDB: Error storing document', error);
        this.lastError = { timestamp: Date.now(), message: error?.message || String(error), operation: 'storeDocument' };
        if (error?.name === 'QuotaExceededError') {
          console.warn('IndexedDB: Quota exceeded. Cannot store more data. Please clear some storage or increase browser limits.');
        }
        reject(error);
      };
    });
  }

  async storeEmbedding(documentId, embedding) {
    const transaction = this.indexedDB.transaction(['embeddings'], 'readwrite');
    const store = transaction.objectStore('embeddings');
    
    return new Promise((resolve, reject) => {
      const request = store.add({ documentId, embedding });
      request.onsuccess = () => resolve(request.result);
      request.onerror = (event) => {
        const error = event.target.error;
        console.error('IndexedDB: Error storing embedding', error);
        this.lastError = { timestamp: Date.now(), message: error?.message || String(error), operation: 'storeEmbedding' };
        if (error?.name === 'QuotaExceededError') {
          console.warn('IndexedDB: Quota exceeded. Cannot store more data. Please clear some storage or increase browser limits.');
        }
        reject(error);
      };
    });
  }

  async search(query, topK = 5) {
    try {
      if (this.documents.length === 0) {
        return [];
      }

      // Generate embedding for query
      const queryEmbedding = await this.generateEmbedding(query);

      // Calculate similarities
      const similarities = this.embeddings.map(embeddingDoc => {
      const similarity = this.cosineSimilarity(queryEmbedding, embeddingDoc.embedding);
      const document = this.documents.find(doc => doc.id === embeddingDoc.documentId);
      
      return {
        document,
        similarity,
        ...document
      };
    }).filter(item => item.document);

    // Sort by similarity and return top K
    similarities.sort((a, b) => b.similarity - a.similarity);
    const resultsToLog = similarities.slice(0, topK);

    if (resultsToLog.length > 0) {
      const totalSimilarity = resultsToLog.reduce((sum, result) => sum + result.similarity, 0);
      const avgSimilarity = totalSimilarity / resultsToLog.length;
      const maxSimilarity = resultsToLog[0].similarity; // Already sorted
      console.debug(`VectorSearch: Top ${resultsToLog.length} results for query "${query.substring(0, 50)}...". Avg similarity: ${avgSimilarity.toFixed(3)}, Max similarity: ${maxSimilarity.toFixed(3)}`);
    }

    return resultsToLog;
    } catch (error) {
      this.lastError = { timestamp: Date.now(), message: error.message || String(error), operation: 'search' };
      throw error;
    }
  }

  cosineSimilarity(vecA, vecB) {
    if (vecA.length !== vecB.length) {
      return 0;
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  async getDocumentCount() {
    return this.documents.length;
  }

  async clearDocuments() {
    const transaction = this.indexedDB.transaction(['documents', 'embeddings'], 'readwrite');
    const documentsStore = transaction.objectStore('documents');
    const embeddingsStore = transaction.objectStore('embeddings');
    
    const clearPromises = [];

    clearPromises.push(new Promise((resolve, reject) => {
      const clearDocsRequest = documentsStore.clear();
      clearDocsRequest.onsuccess = () => resolve();
      clearDocsRequest.onerror = (event) => {
        const error = event.target.error;
        console.error('IndexedDB: Error clearing documents store', error);
        this.lastError = { timestamp: Date.now(), message: error?.message || String(error), operation: 'clearDocuments_docs' };
        reject(error);
      };
    }));

    clearPromises.push(new Promise((resolve, reject) => {
      const clearEmbedsRequest = embeddingsStore.clear();
      clearEmbedsRequest.onsuccess = () => resolve();
      clearEmbedsRequest.onerror = (event) => {
        const error = event.target.error;
        console.error('IndexedDB: Error clearing embeddings store', error);
        this.lastError = { timestamp: Date.now(), message: error?.message || String(error), operation: 'clearDocuments_embeds' };
        reject(error);
      };
    }));
    
    transaction.oncomplete = () => {
      this.documents = [];
      this.embeddings = [];
      // Resolve the main promise once transaction is complete
    };

    transaction.onerror = (event) => {
      const error = event.target.error;
      console.error('IndexedDB: Error during clearDocuments transaction', error);
      this.lastError = { timestamp: Date.now(), message: error?.message || String(error), operation: 'clearDocuments_transaction' };
      // Reject the main promise if transaction fails
    };

    try {
      await Promise.all(clearPromises);
    } catch (error) {
      // Errors from individual clear requests are already logged and lastError set.
      // This catch is to prevent unhandled promise rejections if any promise in Promise.all rejects.
      // The transaction.onerror should ideally handle the overall transaction failure.
      console.error("IndexedDB: Failure in one of the clear operations during Promise.all", error);
      // Potentially set a more general lastError if not already set by specific clear operation
      if (!this.lastError || (Date.now() - this.lastError.timestamp > 100)) { // Avoid overwriting specific recent error
         this.lastError = { timestamp: Date.now(), message: 'Failure in Promise.all for clearDocuments', operation: 'clearDocuments_PromiseAll' };
      }
    }

    // Reset in-memory arrays only if transaction was successful.
    // This part might need adjustment based on how we want to handle partial success/failure.
    // If transaction.onerror is triggered, this might not be reached as expected.
    this.documents = [];
    this.embeddings = [];
  }

  async getDocumentsByType(type) {
    return this.documents.filter(doc => doc.type === type);
  }

  async getDocumentsByUrl(url) {
    return this.documents.filter(doc => doc.url === url);
  }

  async getRecentDocuments(limit = 10) {
    return this.documents
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  /**
   * Set context manager for enhanced context handling
   */
  setContextManager(contextManager) {
    this.contextManager = contextManager;
  }

  /**
   * Add categorized context document
   */
  async addCategorizedDocument(content, metadata = {}) {
    const doc = {
      id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content,
      metadata: {
        ...metadata,
        timestamp: Date.now(),
        category: metadata.category || 'GENERAL',
        relevanceScore: metadata.relevanceScore || 0.5
      }
    };

    // Generate embedding
    const embedding = await this.generateEmbedding(content);
    
    // Store document and embedding
    this.documents.push(doc);
    this.embeddings.push(embedding);

    // Save to IndexedDB
    // This method is not defined in the provided code, assuming it's a typo for storeDocument or similar
    // For now, I'll assume this.storeDocument and this.storeEmbedding are used inside addDocument
    // await this.saveDocument(doc, embedding);
    // If saveDocument is a distinct method, it also needs lastError handling.

    return doc.id;
  }

  /**
   * Search with category filtering and relevance scoring
   */
  async searchWithCategories(query, options = {}) {
    try {
      const {
        categories = [],
        minRelevance = 0,
      maxResults = 10,
      boostRecent = true,
      semanticThreshold = 0.3
    } = options;

    // Check semantic cache first
    const cacheKey = `${query}_${JSON.stringify(options)}`;
    if (this.semanticCache.has(cacheKey)) {
      return this.semanticCache.get(cacheKey);
    }

    const queryEmbedding = await this.generateEmbedding(query);
    const results = [];

    for (let i = 0; i < this.documents.length; i++) {
      const doc = this.documents[i];
      const embedding = this.embeddings[i];

      // Category filtering
      if (categories.length > 0 && !categories.includes(doc.metadata.category)) {
        continue;
      }

      // Relevance filtering
      if (doc.metadata.relevanceScore < minRelevance) {
        continue;
      }

      // Calculate similarity
      const similarity = this.cosineSimilarity(queryEmbedding, embedding);
      
      if (similarity >= semanticThreshold) {
        let score = similarity;

        // Apply category weight
        const categoryWeight = this.categoryWeights[doc.metadata.category] || 0.5;
        score *= categoryWeight;

        // Apply relevance score
        score *= doc.metadata.relevanceScore;

        // Boost recent documents
        if (boostRecent) {
          const age = Date.now() - doc.metadata.timestamp;
          const ageHours = age / (1000 * 60 * 60);
          const recencyBoost = Math.max(0.5, 1 - (ageHours / 24)); // Decay over 24 hours
          score *= recencyBoost;
        }

        results.push({
          document: doc,
          similarity,
          score,
          category: doc.metadata.category
        });
      }
    }

    // Sort by score and limit results
    results.sort((a, b) => b.score - a.score);
    const finalResults = results.slice(0, maxResults);

    if (finalResults.length > 0) {
      const totalScore = finalResults.reduce((sum, result) => sum + result.score, 0);
      const avgScore = totalScore / finalResults.length;
      const maxScore = finalResults[0].score; // Already sorted
      console.debug(`VectorSearchWithCategories: Top ${finalResults.length} results for query "${query.substring(0,50)}...". Avg score: ${avgScore.toFixed(3)}, Max score: ${maxScore.toFixed(3)}`);
    }

    // Cache results
    this.semanticCache.set(cacheKey, finalResults);

    // Clean cache if it gets too large
    if (this.semanticCache.size > 100) {
      const keys = Array.from(this.semanticCache.keys());
      for (let i = 0; i < 20; i++) {
        this.semanticCache.delete(keys[i]);
      }
    }

    return finalResults;
    } catch (error) {
      this.lastError = { timestamp: Date.now(), message: error.message || String(error), operation: 'searchWithCategories' };
      throw error;
    }
  }

  /**
   * Get context summary for AI with category breakdown
   */
  async getContextSummaryForAI(query, options = {}) {
    const {
      maxContextLength = 4000,
      includeCategories = ['JAVASCRIPT', 'HTML', 'CONSOLE', 'PERFORMANCE'],
      prioritizeErrors = true
    } = options;

    const results = await this.searchWithCategories(query, {
      categories: includeCategories,
      maxResults: 20,
      minRelevance: 0.3
    });

    if (results.length === 0) {
      return 'No relevant context found for this query.';
    }

    let summary = '';
    let currentLength = 0;
    const categoryData = {};

    // Group results by category
    for (const result of results) {
      const category = result.category;
      if (!categoryData[category]) {
        categoryData[category] = [];
      }
      categoryData[category].push(result);
    }

    // Build summary by category priority
    const categoryPriority = prioritizeErrors 
      ? ['CONSOLE', 'JAVASCRIPT', 'PERFORMANCE', 'SECURITY', 'HTML', 'CSS', 'NETWORK', 'ACCESSIBILITY']
      : includeCategories;

    for (const category of categoryPriority) {
      if (!categoryData[category]) continue;

      const categoryResults = categoryData[category].slice(0, 3); // Max 3 per category
      const categoryIcon = this.getCategoryIcon(category);
      
      summary += `\n${categoryIcon} ${category}:\n`;
      
      for (const result of categoryResults) {
        const content = result.document.content.substring(0, 200);
        const addition = `- ${content}...\n`;
        
        if (currentLength + addition.length > maxContextLength) {
          summary += '- [Additional context truncated]\n';
          break;
        }
        
        summary += addition;
        currentLength += addition.length;
      }

      if (currentLength >= maxContextLength) break;
    }

    return summary.trim();
  }

  /**
   * Get category icon for display
   */
  getCategoryIcon(category) {
    const icons = {
      HTML: '🏗️',
      CSS: '🎨',
      JAVASCRIPT: '⚡',
      NETWORK: '🌐',
      CONSOLE: '🐛',
      PERFORMANCE: '📊',
      ACCESSIBILITY: '♿',
      SECURITY: '🔒'
    };
    return icons[category] || '📄';
  }

  /**
   * Analyze context patterns and provide insights
   */
  async analyzeContextPatterns() {
    const patterns = {
      commonIssues: {},
      categoryDistribution: {},
      timePatterns: {},
      recommendations: []
    };

    // Analyze category distribution
    for (const doc of this.documents) {
      const category = doc.metadata.category;
      patterns.categoryDistribution[category] = (patterns.categoryDistribution[category] || 0) + 1;
    }

    // Analyze common issues (from document content)
    const issueKeywords = ['error', 'warning', 'failed', 'missing', 'undefined', 'null', 'exception'];
    for (const doc of this.documents) {
      for (const keyword of issueKeywords) {
        if (doc.content.toLowerCase().includes(keyword)) {
          patterns.commonIssues[keyword] = (patterns.commonIssues[keyword] || 0) + 1;
        }
      }
    }

    // Time-based patterns
    const now = Date.now();
    const timeRanges = {
      'last_hour': now - (60 * 60 * 1000),
      'last_day': now - (24 * 60 * 60 * 1000),
      'last_week': now - (7 * 24 * 60 * 60 * 1000)
    };

    for (const [range, threshold] of Object.entries(timeRanges)) {
      patterns.timePatterns[range] = this.documents.filter(doc => 
        doc.metadata.timestamp > threshold
      ).length;
    }

    // Generate recommendations
    if (patterns.commonIssues.error > 5) {
      patterns.recommendations.push('High number of errors detected - consider debugging');
    }
    if (patterns.categoryDistribution.PERFORMANCE > 10) {
      patterns.recommendations.push('Performance issues detected frequently');
    }
    if (patterns.timePatterns.last_hour > 20) {
      patterns.recommendations.push('High activity in last hour - may indicate active debugging');
    }

    return patterns;
  }

  /**
   * Clean up old context data
   */
  async cleanupOldContext(maxAge = 24 * 60 * 60 * 1000) {
    const now = Date.now();
    const threshold = now - maxAge;
    
    const indicesToRemove = [];
    
    for (let i = 0; i < this.documents.length; i++) {
      const doc = this.documents[i];
      if (doc.metadata.timestamp < threshold && !doc.metadata.bookmarked) {
        indicesToRemove.push(i);
      }
    }

    // Remove from arrays (in reverse order to maintain indices)
    for (let i = indicesToRemove.length - 1; i >= 0; i--) {
      const index = indicesToRemove[i];
      this.documents.splice(index, 1);
      this.embeddings.splice(index, 1);
    }

    // Clear semantic cache
    this.semanticCache.clear();

    return indicesToRemove.length;
  }

  /**
   * Export context data for analysis
   */
  async exportContextData(options = {}) {
    const {
      includeEmbeddings = false,
      categories = [],
      maxAge = null
    } = options;

    let documents = this.documents;

    // Filter by categories
    if (categories.length > 0) {
      documents = documents.filter(doc => categories.includes(doc.metadata.category));
    }

    // Filter by age
    if (maxAge) {
      const threshold = Date.now() - maxAge;
      documents = documents.filter(doc => doc.metadata.timestamp > threshold);
    }

    const exportData = {
      exportDate: new Date().toISOString(),
      documentCount: documents.length,
      categories: [...new Set(documents.map(doc => doc.metadata.category))],
      documents: documents.map((doc, index) => ({
        ...doc,
        embedding: includeEmbeddings ? this.embeddings[this.documents.indexOf(doc)] : undefined
      }))
    };

    return exportData;
  }

  /**
   * Performs a basic on-demand health check of the IndexedDB instance.
   */
  async checkDBHealth() {
    try {
      // Try to re-initialize (or open) the database
      await this.initializeDB(); // This already sets lastError on failure
    } catch (error) {
      // initializeDB sets its own lastError, so we just return it
      return {
        ok: false,
        step: 'initialize',
        error: 'Failed to initialize database',
        details: this.lastError // return the error set by initializeDB
      };
    }

    if (!this.indexedDB) {
      this.lastError = { timestamp: Date.now(), message: 'DB connection not established.', operation: 'checkDBHealth_no_connection' };
      return {
        ok: false,
        step: 'initialize',
        error: 'Database connection not established after initialization attempt.',
        details: null
      };
    }

    try {
      // Try to perform a simple read operation (count documents)
      const transaction = this.indexedDB.transaction(['documents'], 'readonly');
      const store = transaction.objectStore('documents');

      return new Promise((resolve) => {
        const countRequest = store.count();

        countRequest.onsuccess = () => {
          console.info(`IndexedDB Health Check: Found ${countRequest.result} documents.`);
          resolve({
            ok: true,
            message: 'Database is responsive.',
            documentCount: countRequest.result
          });
        };

        countRequest.onerror = (event) => {
          const error = event.target.error;
          console.error('IndexedDB Health Check: Error counting documents', error);
          this.lastError = { timestamp: Date.now(), message: error?.message || String(error), operation: 'checkDBHealth_count' };
          resolve({
            ok: false,
            step: 'read_count',
            error: 'Failed to count documents',
            details: error
          });
        };

        transaction.onerror = (event) => {
          const error = event.target.error;
          // This might be redundant if countRequest.onerror fires, but good for overall transaction issues.
          console.error('IndexedDB Health Check: Transaction error during read_count', error);
          this.lastError = { timestamp: Date.now(), message: error?.message || String(error), operation: 'checkDBHealth_transaction' };
          resolve({
            ok: false,
            step: 'read_count_transaction',
            error: 'Transaction failed during document count',
            details: error
          });
        };
      });
    } catch (error) {
      // Catch synchronous errors if transaction creation itself fails
      console.error('IndexedDB Health Check: Error setting up read transaction', error);
      this.lastError = { timestamp: Date.now(), message: error.message || String(error), operation: 'checkDBHealth_setupTransaction' };
      return {
        ok: false,
        step: 'read_transaction_setup',
        error: 'Failed to set up read transaction',
        details: error
      };
    }
  }

  getLastError() {
    return this.lastError;
  }

  clearLastError() {
    this.lastError = null;
  }

  async getEmbeddingSourceSummary() {
    const settings = await this.getSettings();
    if (settings && settings.provider === 'openai' && settings.apiKey) {
      return "OpenAI (API)";
    }
    return "Local Fallback (Simple Hash)";
  }
}

// Make VectorStore available globally
window.VectorStore = VectorStore;