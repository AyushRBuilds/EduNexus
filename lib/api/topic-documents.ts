/**
 * Hardcoded topic-document mappings
 * Maps search topics to relevant documents and materials
 */

export interface TopicDocument {
  id: string
  title: string
  type: "research_paper" | "video_lecture" | "presentation" | "notes" | "book"
  author: string
  department: string
  description: string
  fileSize?: string
  duration?: string
  pages?: string
  relevanceScore: number
  tags: string[]
}

export interface TopicMapping {
  keywords: string[]
  documents: TopicDocument[]
  definition?: string
}

// Hardcoded topic mappings with realistic documents
export const TOPIC_DOCUMENTS: Record<string, TopicMapping> = {
  nlp: {
    keywords: ["nlp", "natural language processing", "language processing"],
    definition: "Natural Language Processing (NLP) is a field of artificial intelligence that focuses on enabling computers to understand, interpret, and generate human language.",
    documents: [
      {
        id: "nlp-001",
        title: "Natural Language Processing: Fundamentals and Applications",
        type: "research_paper",
        author: "Prof. Dr. Yoav Goldberg",
        department: "Computer Science",
        description: "Comprehensive guide to NLP techniques including tokenization, POS tagging, and parsing",
        fileSize: "3.2 MB",
        relevanceScore: 95,
        tags: ["nlp", "fundamentals", "nlp-techniques", "text-processing"],
      },
      {
        id: "nlp-002",
        title: "Deep Learning for Natural Language Processing",
        type: "video_lecture",
        author: "Prof. Andrew Ng",
        department: "Computer Science",
        description: "Video series covering deep learning approaches in NLP including RNNs, LSTMs, and Transformers",
        duration: "120 minutes",
        relevanceScore: 92,
        tags: ["nlp", "deep-learning", "transformers", "rnns"],
      },
      {
        id: "nlp-003",
        title: "NLP with Transformers and BERT",
        type: "presentation",
        author: "Dr. Jacob Devlin",
        department: "Computer Science",
        description: "Presentation on modern NLP architectures including BERT, GPT, and attention mechanisms",
        fileSize: "4.1 MB",
        pages: "45 slides",
        relevanceScore: 90,
        tags: ["nlp", "transformers", "bert", "attention"],
      },
      {
        id: "nlp-004",
        title: "Practical NLP: Text Classification and Sentiment Analysis",
        type: "notes",
        author: "Dept. of Computer Science",
        department: "Computer Science",
        description: "Study notes on implementing text classification, sentiment analysis, and named entity recognition",
        fileSize: "2.8 MB",
        pages: "89",
        relevanceScore: 88,
        tags: ["nlp", "text-classification", "sentiment-analysis", "ner"],
      },
      {
        id: "nlp-005",
        title: "Speech Recognition and Language Models",
        type: "book",
        author: "Prof. Kathy McKeown",
        department: "Computer Science",
        description: "Detailed resource on language models, speech recognition, and conversational AI",
        fileSize: "5.6 MB",
        relevanceScore: 85,
        tags: ["nlp", "speech-recognition", "language-models", "conversational-ai"],
      },
    ],
  },
  
  "machine learning": {
    keywords: ["machine learning", "ml", "supervised learning", "unsupervised learning"],
    definition: "Machine Learning is a subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed.",
    documents: [
      {
        id: "ml-001",
        title: "Machine Learning: Theory and Practice",
        type: "research_paper",
        author: "Prof. Tom Mitchell",
        department: "Computer Science",
        description: "Foundational concepts including supervised and unsupervised learning, feature engineering, and model evaluation",
        fileSize: "4.5 MB",
        relevanceScore: 96,
        tags: ["machine-learning", "fundamentals", "supervised-learning", "unsupervised-learning"],
      },
      {
        id: "ml-002",
        title: "Applied Machine Learning Course",
        type: "video_lecture",
        author: "Prof. Andrew Ng",
        department: "Computer Science",
        description: "Complete video course covering classification, regression, clustering, and dimensionality reduction",
        duration: "180 minutes",
        relevanceScore: 94,
        tags: ["machine-learning", "classification", "regression", "clustering"],
      },
      {
        id: "ml-003",
        title: "Advanced ML: Ensemble Methods and Deep Learning",
        type: "presentation",
        author: "Dr. Yoshua Bengio",
        department: "Computer Science",
        description: "Lecture slides on ensemble methods, random forests, boosting, and deep neural networks",
        fileSize: "3.9 MB",
        pages: "52 slides",
        relevanceScore: 91,
        tags: ["machine-learning", "ensemble-methods", "deep-learning", "neural-networks"],
      },
      {
        id: "ml-004",
        title: "ML Algorithms Study Guide",
        type: "notes",
        author: "Dept. of Computer Science",
        department: "Computer Science",
        description: "Comprehensive notes on SVM, Decision Trees, KNN, K-means, and other common algorithms",
        fileSize: "3.2 MB",
        pages: "127",
        relevanceScore: 89,
        tags: ["machine-learning", "algorithms", "classification", "clustering"],
      },
    ],
  },

  "deep learning": {
    keywords: ["deep learning", "neural networks", "cnn", "rnn", "transformers"],
    definition: "Deep Learning is a subset of machine learning based on artificial neural networks with multiple layers, inspired by biological neural networks.",
    documents: [
      {
        id: "dl-001",
        title: "Deep Learning Fundamentals and Architecture",
        type: "research_paper",
        author: "Prof. Yann LeCun",
        department: "Computer Science",
        description: "Comprehensive guide to neural network architectures including CNNs, RNNs, and attention mechanisms",
        fileSize: "5.1 MB",
        relevanceScore: 97,
        tags: ["deep-learning", "neural-networks", "cnn", "rnn", "attention"],
      },
      {
        id: "dl-002",
        title: "Deep Learning Specialization",
        type: "video_lecture",
        author: "Prof. Andrew Ng",
        department: "Computer Science",
        description: "Video course series on deep learning including CNNs for computer vision and RNNs for sequences",
        duration: "240 minutes",
        relevanceScore: 96,
        tags: ["deep-learning", "cnn", "rnn", "computer-vision", "nlp"],
      },
      {
        id: "dl-003",
        title: "Convolutional Neural Networks for Image Processing",
        type: "presentation",
        author: "Prof. Geoffrey Hinton",
        department: "Computer Science",
        description: "Slides on CNN architectures (LeNet, AlexNet, VGG, ResNet) and their applications",
        fileSize: "4.7 MB",
        pages: "48 slides",
        relevanceScore: 93,
        tags: ["deep-learning", "cnn", "computer-vision", "image-processing"],
      },
      {
        id: "dl-004",
        title: "Recurrent Neural Networks and LSTMs",
        type: "notes",
        author: "Dept. of Computer Science",
        department: "Computer Science",
        description: "Study notes on RNNs, LSTMs, GRUs, and sequence-to-sequence models",
        fileSize: "2.9 MB",
        pages: "95",
        relevanceScore: 91,
        tags: ["deep-learning", "rnn", "lstm", "sequence-models"],
      },
      {
        id: "dl-005",
        title: "Transformers: Attention is All You Need",
        type: "research_paper",
        author: "Prof. Ashish Vaswani",
        department: "Computer Science",
        description: "Seminal paper on Transformer architecture and self-attention mechanisms",
        fileSize: "2.2 MB",
        relevanceScore: 95,
        tags: ["deep-learning", "transformers", "attention", "nlp"],
      },
    ],
  },

  "computer vision": {
    keywords: ["computer vision", "image processing", "object detection", "image classification"],
    definition: "Computer Vision is the field of artificial intelligence that enables computers to interpret and understand the visual world through digital images and video.",
    documents: [
      {
        id: "cv-001",
        title: "Computer Vision: Principles and Techniques",
        type: "research_paper",
        author: "Prof. Richard Szeliski",
        department: "Computer Science",
        description: "Comprehensive resource on image processing, feature detection, object recognition, and 3D vision",
        fileSize: "6.2 MB",
        relevanceScore: 96,
        tags: ["computer-vision", "image-processing", "feature-detection", "object-recognition"],
      },
      {
        id: "cv-002",
        title: "Deep Learning for Computer Vision",
        type: "video_lecture",
        author: "Prof. Fei-Fei Li",
        department: "Computer Science",
        description: "Video course on CNNs for image classification, object detection (YOLO, R-CNN), and semantic segmentation",
        duration: "150 minutes",
        relevanceScore: 94,
        tags: ["computer-vision", "cnn", "object-detection", "image-segmentation"],
      },
      {
        id: "cv-003",
        title: "Image Classification and Object Detection",
        type: "presentation",
        author: "Dr. Kaiming He",
        department: "Computer Science",
        description: "Presentation on state-of-the-art architectures: ResNet, YOLO, Faster R-CNN, and Mask R-CNN",
        fileSize: "5.8 MB",
        pages: "56 slides",
        relevanceScore: 92,
        tags: ["computer-vision", "object-detection", "image-classification", "deep-learning"],
      },
      {
        id: "cv-004",
        title: "Practical Computer Vision: Implementation Guide",
        type: "notes",
        author: "Dept. of Computer Science",
        department: "Computer Science",
        description: "Study notes on implementing image processing pipelines, edge detection, and feature matching",
        fileSize: "3.7 MB",
        pages: "102",
        relevanceScore: 88,
        tags: ["computer-vision", "image-processing", "feature-matching", "edge-detection"],
      },
    ],
  },

  "data science": {
    keywords: ["data science", "data analysis", "statistical analysis", "data visualization"],
    definition: "Data Science is an interdisciplinary field that uses scientific methods, processes, algorithms, and systems to extract knowledge and insights from data.",
    documents: [
      {
        id: "ds-001",
        title: "Data Science: The Complete Guide",
        type: "research_paper",
        author: "Prof. Jeffrey Leek",
        department: "Statistics",
        description: "Comprehensive overview of data collection, cleaning, exploration, statistical analysis, and visualization",
        fileSize: "4.8 MB",
        relevanceScore: 95,
        tags: ["data-science", "data-analysis", "statistics", "data-visualization"],
      },
      {
        id: "ds-002",
        title: "Practical Data Science with Python",
        type: "video_lecture",
        author: "Dr. Wes McKinney",
        department: "Computer Science",
        description: "Video course on pandas, NumPy, scikit-learn, and data visualization with Matplotlib and Seaborn",
        duration: "120 minutes",
        relevanceScore: 92,
        tags: ["data-science", "python", "pandas", "data-visualization"],
      },
      {
        id: "ds-003",
        title: "Statistical Analysis and Hypothesis Testing",
        type: "presentation",
        author: "Prof. Ronald Fisher",
        department: "Statistics",
        description: "Slides on probability distributions, hypothesis testing, regression analysis, and ANOVA",
        fileSize: "3.5 MB",
        pages: "44 slides",
        relevanceScore: 89,
        tags: ["data-science", "statistics", "hypothesis-testing", "regression"],
      },
      {
        id: "ds-004",
        title: "Data Visualization Best Practices",
        type: "notes",
        author: "Dept. of Statistics",
        department: "Statistics",
        description: "Study notes on creating effective visualizations, choosing appropriate chart types, and storytelling with data",
        fileSize: "2.6 MB",
        pages: "78",
        relevanceScore: 86,
        tags: ["data-science", "data-visualization", "analytics", "communication"],
      },
    ],
  },

  "database": {
    keywords: ["database", "sql", "nosql", "database design", "relational database"],
    definition: "A database is an organized collection of structured data stored and accessed via a computer system, managed by a database management system (DBMS).",
    documents: [
      {
        id: "db-001",
        title: "Database Design and SQL",
        type: "research_paper",
        author: "Prof. C.J. Date",
        department: "Computer Science",
        description: "Comprehensive guide to relational database design, normalization, and SQL query optimization",
        fileSize: "5.3 MB",
        relevanceScore: 94,
        tags: ["database", "sql", "database-design", "normalization"],
      },
      {
        id: "db-002",
        title: "Advanced SQL and Query Optimization",
        type: "video_lecture",
        author: "Dr. Joe Celko",
        department: "Computer Science",
        description: "Video course on SQL queries, indexing strategies, query optimization, and transaction management",
        duration: "100 minutes",
        relevanceScore: 91,
        tags: ["database", "sql", "query-optimization", "indexing"],
      },
      {
        id: "db-003",
        title: "NoSQL Databases: MongoDB and Beyond",
        type: "presentation",
        author: "Prof. Don Chamberlin",
        department: "Computer Science",
        description: "Presentation on NoSQL paradigms: document stores, key-value stores, and their use cases",
        fileSize: "4.2 MB",
        pages: "40 slides",
        relevanceScore: 88,
        tags: ["database", "nosql", "mongodb", "scalability"],
      },
      {
        id: "db-004",
        title: "Database Administration Essentials",
        type: "notes",
        author: "Dept. of Computer Science",
        department: "Computer Science",
        description: "Study notes on backup, recovery, replication, and maintaining database integrity",
        fileSize: "3.1 MB",
        pages: "85",
        relevanceScore: 85,
        tags: ["database", "administration", "backup", "recovery"],
      },
    ],
  },
}

/**
 * Find documents related to a search query
 */
export function getTopicDocuments(query: string): TopicDocument[] {
  const lowerQuery = query.toLowerCase()
  
  // Check each topic for keyword matches
  for (const [topicKey, topicData] of Object.entries(TOPIC_DOCUMENTS)) {
    const hasMatch = topicData.keywords.some(keyword => lowerQuery.includes(keyword))
    if (hasMatch) {
      // Sort by relevance score descending
      return [...topicData.documents].sort((a, b) => b.relevanceScore - a.relevanceScore)
    }
  }
  
  // Return empty if no match
  return []
}

/**
 * Get the definition of a topic if available
 */
export function getTopicDefinition(query: string): string | null {
  const lowerQuery = query.toLowerCase()
  
  for (const topicData of Object.values(TOPIC_DOCUMENTS)) {
    const hasMatch = topicData.keywords.some(keyword => lowerQuery.includes(keyword))
    if (hasMatch && topicData.definition) {
      return topicData.definition
    }
  }
  
  return null
}
