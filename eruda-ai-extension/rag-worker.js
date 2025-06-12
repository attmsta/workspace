/**
 * RAG Worker - Web Worker for Vector Store Operations
 * Handles computationally intensive vector operations in a separate thread
 */

class RAGWorker {
  constructor() {
    this.vectorStore = null;
    this.isInitialized = false;
    this.documents = new Map();
    this.categories = new Set();
  }

  /**
   * Initialize the RAG worker
   */
  async initialize() {
    try {
      // Initialize vector store if available
      if (typeof VectorStore !== 'undefined') {
        this.vectorStore = new VectorStore();
        await this.vectorStore.initialize();
      }
      
      this.isInitialized = true;
      return { success: true, message: 'RAG Worker initialized successfully' };
    } catch (error) {
      console.error('RAG Worker initialization failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Add document to the vector store
   */
  async addDocument(document) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const docId = document.id || this.generateDocumentId();
      const processedDoc = this.preprocessDocument(document);
      
      // Store document
      this.documents.set(docId, processedDoc);
      
      // Add category if specified
      if (document.category) {
        this.categories.add(document.category);
      }

      // Add to vector store if available
      if (this.vectorStore) {
        await this.vectorStore.addDocument(processedDoc);
      }

      return { 
        success: true, 
        documentId: docId,
        message: 'Document added successfully' 
      };
    } catch (error) {
      console.error('Failed to add document:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Search documents using vector similarity
   */
  async search(query, options = {}) {
    try {
      if (!this.isInitialized) {
        return { success: false, error: 'RAG Worker not initialized' };
      }

      const {
        limit = 5,
        category = null,
        threshold = 0.1,
        includeMetadata = true
      } = options;

      let results = [];

      // Use vector store if available
      if (this.vectorStore) {
        if (category && this.vectorStore.searchWithCategories) {
          results = await this.vectorStore.searchWithCategories(query, {
            categories: [category],
            limit,
            threshold
          });
        } else {
          results = await this.vectorStore.search(query, limit);
        }
      } else {
        // Fallback to simple text matching
        results = this.simpleTextSearch(query, { limit, category, threshold });
      }

      // Process results
      const processedResults = results.map(result => ({
        ...result,
        metadata: includeMetadata ? this.getDocumentMetadata(result.id) : null
      }));

      return {
        success: true,
        results: processedResults,
        query,
        totalResults: results.length
      };
    } catch (error) {
      console.error('Search failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get document statistics
   */
  getStatistics() {
    return {
      totalDocuments: this.documents.size,
      categories: Array.from(this.categories),
      categoryCount: this.categories.size,
      isInitialized: this.isInitialized,
      hasVectorStore: !!this.vectorStore
    };
  }

  /**
   * Clean up old documents
   */
  async cleanup(options = {}) {
    try {
      const { 
        maxAge = 7 * 24 * 60 * 60 * 1000, // 7 days
        maxDocuments = 1000 
      } = options;

      const now = Date.now();
      let removedCount = 0;

      // Remove old documents
      for (const [id, doc] of this.documents.entries()) {
        const age = now - (doc.timestamp || 0);
        if (age > maxAge) {
          this.documents.delete(id);
          removedCount++;
        }
      }

      // Remove excess documents if over limit
      if (this.documents.size > maxDocuments) {
        const sortedDocs = Array.from(this.documents.entries())
          .sort((a, b) => (b[1].timestamp || 0) - (a[1].timestamp || 0));
        
        const toRemove = sortedDocs.slice(maxDocuments);
        toRemove.forEach(([id]) => {
          this.documents.delete(id);
          removedCount++;
        });
      }

      // Clean vector store if available
      if (this.vectorStore && this.vectorStore.cleanup) {
        await this.vectorStore.cleanup(options);
      }

      return {
        success: true,
        removedCount,
        remainingDocuments: this.documents.size
      };
    } catch (error) {
      console.error('Cleanup failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Export data
   */
  exportData() {
    return {
      documents: Array.from(this.documents.entries()),
      categories: Array.from(this.categories),
      statistics: this.getStatistics(),
      exportTimestamp: Date.now()
    };
  }

  /**
   * Import data
   */
  async importData(data) {
    try {
      if (data.documents) {
        this.documents = new Map(data.documents);
      }
      
      if (data.categories) {
        this.categories = new Set(data.categories);
      }

      // Re-add documents to vector store if available
      if (this.vectorStore) {
        for (const [id, doc] of this.documents.entries()) {
          await this.vectorStore.addDocument(doc);
        }
      }

      return { 
        success: true, 
        importedDocuments: this.documents.size,
        importedCategories: this.categories.size
      };
    } catch (error) {
      console.error('Import failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Helper methods

  generateDocumentId() {
    return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  preprocessDocument(document) {
    return {
      ...document,
      id: document.id || this.generateDocumentId(),
      timestamp: document.timestamp || Date.now(),
      content: this.cleanText(document.content || ''),
      title: this.cleanText(document.title || ''),
      url: document.url || '',
      category: document.category || 'general'
    };
  }

  cleanText(text) {
    if (typeof text !== 'string') return '';
    return text
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s\-_.]/g, ' ')
      .trim()
      .toLowerCase();
  }

  simpleTextSearch(query, options = {}) {
    const { limit = 5, category = null } = options;
    const queryTerms = this.cleanText(query).split(' ').filter(term => term.length > 2);
    
    const results = [];
    
    for (const [id, doc] of this.documents.entries()) {
      if (category && doc.category !== category) continue;
      
      const content = `${doc.title} ${doc.content}`.toLowerCase();
      let score = 0;
      
      queryTerms.forEach(term => {
        const matches = (content.match(new RegExp(term, 'g')) || []).length;
        score += matches;
      });
      
      if (score > 0) {
        results.push({
          id,
          content: doc.content,
          title: doc.title,
          score: score / queryTerms.length,
          category: doc.category
        });
      }
    }
    
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  getDocumentMetadata(docId) {
    const doc = this.documents.get(docId);
    if (!doc) return null;
    
    return {
      id: doc.id,
      timestamp: doc.timestamp,
      category: doc.category,
      url: doc.url,
      wordCount: (doc.content || '').split(' ').length
    };
  }
}

// Web Worker message handling
if (typeof self !== 'undefined' && self.postMessage) {
  const ragWorker = new RAGWorker();
  
  self.onmessage = async function(e) {
    const { id, method, params } = e.data;
    
    try {
      let result;
      
      switch (method) {
        case 'initialize':
          result = await ragWorker.initialize();
          break;
        case 'addDocument':
          result = await ragWorker.addDocument(params.document);
          break;
        case 'search':
          result = await ragWorker.search(params.query, params.options);
          break;
        case 'getStatistics':
          result = ragWorker.getStatistics();
          break;
        case 'cleanup':
          result = await ragWorker.cleanup(params.options);
          break;
        case 'exportData':
          result = ragWorker.exportData();
          break;
        case 'importData':
          result = await ragWorker.importData(params.data);
          break;
        default:
          result = { success: false, error: `Unknown method: ${method}` };
      }
      
      self.postMessage({ id, result });
    } catch (error) {
      self.postMessage({ 
        id, 
        result: { success: false, error: error.message } 
      });
    }
  };
}

// Export for non-worker environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RAGWorker;
} else if (typeof window !== 'undefined') {
  window.RAGWorker = RAGWorker;
}