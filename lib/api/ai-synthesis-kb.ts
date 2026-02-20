/**
 * Hardcoded AI Synthesis Knowledge Base
 * Comprehensive information about key topics: Laplace, Data Structures, Transformers
 */

export interface KnowledgeEntry {
  title: string
  definition: string
  keyPoints: string[]
  applications: string[]
  examples: string[]
  relatedTopics: string[]
}

export const AI_SYNTHESIS_KB: Record<string, KnowledgeEntry> = {
  laplace: {
    title: "Laplace Transform",
    definition:
      "The Laplace transform is an integral transform that converts a function of a real variable t (time) to a function of a complex variable s. It is widely used to solve differential equations and analyze dynamic systems.",
    keyPoints: [
      "Converts time-domain signals to frequency-domain representation",
      "Defined as: L{f(t)} = F(s) = ∫₀^∞ e^(-st) f(t) dt",
      "Handles initial conditions naturally in differential equations",
      "Provides stability analysis through pole-zero diagrams",
      "Essential for control systems and electrical engineering",
    ],
    applications: [
      "Control system analysis and design",
      "Circuit analysis and network synthesis",
      "Vibration analysis and mechanical systems",
      "Signal processing and filtering",
      "Stability analysis of dynamic systems",
      "Finding solutions to differential equations",
    ],
    examples: [
      "Step response analysis: L{u(t)} = 1/s",
      "Exponential decay: L{e^(-at)} = 1/(s+a)",
      "Sinusoidal signals: L{sin(ωt)} = ω/(s² + ω²)",
      "Ramp function: L{t} = 1/s²",
      "Circuit RLC analysis using Laplace impedances",
    ],
    relatedTopics: [
      "Fourier Transform",
      "Z-Transform",
      "Differential Equations",
      "Control Theory",
      "Signal Processing",
      "System Stability",
    ],
  },

  "data structures": {
    title: "Data Structures",
    definition:
      "Data structures are specialized formats for organizing, processing, and storing data efficiently. They determine how data is accessed, modified, and managed in algorithms and applications.",
    keyPoints: [
      "Provide organized storage and retrieval of data",
      "Affect algorithm efficiency (time and space complexity)",
      "Foundation of computer science and software engineering",
      "Each structure has trade-offs between access, insertion, and deletion time",
      "Choice of data structure impacts program performance",
    ],
    applications: [
      "Database management systems (indexing with B-trees)",
      "File systems and directory structures",
      "Compiler design and syntax parsing",
      "Graph algorithms and network analysis",
      "Memory management and caching",
      "Real-time systems and embedded applications",
      "Game development and physics simulation",
    ],
    examples: [
      "Arrays: Fast access O(1), slow insertion O(n)",
      "Linked Lists: Efficient insertion O(1), slower access O(n)",
      "Hash Tables: Average O(1) for lookup, insertion, deletion",
      "Trees: Binary Search Trees for sorted data (O(log n) average)",
      "Graphs: Networks, social media, GPS navigation",
      "Heaps: Priority queues and heap sort algorithm",
      "Stacks: Function call stacks, expression evaluation",
      "Queues: Task scheduling, message processing",
    ],
    relatedTopics: [
      "Algorithms",
      "Big O Notation",
      "Database Design",
      "Memory Management",
      "Searching and Sorting",
      "Graph Theory",
      "Time Complexity",
    ],
  },

  transformers: {
    title: "Transformers (Machine Learning Architecture)",
    definition:
      "Transformers are a revolutionary deep learning architecture introduced in 2017 that uses self-attention mechanisms to process sequential data in parallel, replacing RNNs and LSTMs for many NLP tasks.",
    keyPoints: [
      "Based on self-attention mechanism allowing parallel processing",
      "No recurrence, enabling faster training on GPUs/TPUs",
      "Processes entire sequences simultaneously (not sequentially)",
      "Learns relationships between all positions in sequence",
      "Scalable to very large datasets and models",
      "Foundation for modern LLMs like GPT, BERT, Claude",
    ],
    applications: [
      "Natural Language Processing (NLP): Machine translation, text summarization",
      "Large Language Models: ChatGPT, BERT, GPT-4, Claude",
      "Machine Translation: Neural machine translation systems",
      "Text Classification: Sentiment analysis, spam detection",
      "Named Entity Recognition: Extracting people, locations, organizations",
      "Question Answering: Reading comprehension systems",
      "Vision Transformers: Image classification and object detection",
      "Speech Recognition: Audio-to-text conversion",
      "Code Generation: GitHub Copilot, Code interpreters",
    ],
    examples: [
      "BERT: Bidirectional Encoder Representations from Transformers",
      "GPT series: Generative Pre-trained Transformers (GPT-2, GPT-3, GPT-4)",
      "Attention Is All You Need: Original transformer paper architecture",
      "Vision Transformers (ViT): Applying transformers to images",
      "Multimodal transformers: CLIP combining vision and language",
      "T5: Text-to-Text Transfer Transformer for multiple NLP tasks",
    ],
    relatedTopics: [
      "Attention Mechanism",
      "Self-Attention",
      "Neural Networks",
      "Deep Learning",
      "Natural Language Processing",
      "Embeddings and Word2Vec",
      "Sequence Models",
      "RNNs and LSTMs (predecessors)",
    ],
  },
}

/**
 * Get knowledge base entry for a topic
 * Case-insensitive matching
 */
export function getKnowledgeEntry(topic: string): KnowledgeEntry | null {
  const normalizedTopic = topic.toLowerCase().trim()

  // Direct match
  if (AI_SYNTHESIS_KB[normalizedTopic]) {
    return AI_SYNTHESIS_KB[normalizedTopic]
  }

  // Fuzzy match for common variations
  for (const [key, entry] of Object.entries(AI_SYNTHESIS_KB)) {
    if (
      normalizedTopic.includes(key) ||
      key.includes(normalizedTopic) ||
      entry.title.toLowerCase().includes(normalizedTopic)
    ) {
      return entry
    }
  }

  return null
}

/**
 * Format knowledge entry for AI synthesis response
 */
export function formatKnowledgeEntryForAI(entry: KnowledgeEntry): string {
  return `
## ${entry.title}

**Definition:** ${entry.definition}

### Key Points:
${entry.keyPoints.map((point) => `- ${point}`).join("\n")}

### Applications:
${entry.applications.map((app) => `- ${app}`).join("\n")}

### Examples:
${entry.examples.map((example) => `- ${example}`).join("\n")}

### Related Topics:
${entry.relatedTopics.join(", ")}
`
}

/**
 * Check if query matches any topics in knowledge base
 */
export function matchesKnowledgeBase(query: string): string[] {
  const normalizedQuery = query.toLowerCase()
  const matches: string[] = []

  for (const key of Object.keys(AI_SYNTHESIS_KB)) {
    if (normalizedQuery.includes(key)) {
      matches.push(key)
    }
  }

  return matches
}
