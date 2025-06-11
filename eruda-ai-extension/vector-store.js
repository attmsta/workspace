// In-browser vector store implementation for RAG system
class VectorStore {
  constructor() {
    this.documents = [];
    this.embeddings = [];
    this.indexedDB = null;
    this.dbName = 'ErudaAIVectorStore';
    this.dbVersion = 1;
  }

  async initialize() {
    await this.initializeDB();
    await this.loadDocuments();
  }

  async initializeDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => reject(request.error);
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
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async addDocument(document) {
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
    // For now, use a simple TF-IDF-like approach
    // In production, you'd want to use actual embeddings from OpenAI or similar
    return this.generateSimpleEmbedding(text);
  }

  generateSimpleEmbedding(text, dimensions = 384) {
    // Simple hash-based embedding for demonstration
    // This creates a deterministic vector based on text content
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const embedding = new Array(dimensions).fill(0);
    
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
      request.onerror = () => reject(request.error);
    });
  }

  async storeEmbedding(documentId, embedding) {
    const transaction = this.indexedDB.transaction(['embeddings'], 'readwrite');
    const store = transaction.objectStore('embeddings');
    
    return new Promise((resolve, reject) => {
      const request = store.add({ documentId, embedding });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async search(query, topK = 5) {
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
    return similarities.slice(0, topK);
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
    
    await Promise.all([
      new Promise(resolve => {
        const request = documentsStore.clear();
        request.onsuccess = () => resolve();
      }),
      new Promise(resolve => {
        const request = embeddingsStore.clear();
        request.onsuccess = () => resolve();
      })
    ]);
    
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
}

// Make VectorStore available globally
window.VectorStore = VectorStore;