export const CURATED_COURSES = [
  {
    id: 'c1',
    title: 'Machine Learning Foundations',
    description: 'Master core ML algorithms, supervised & unsupervised learning, regression, classification, and model evaluation using Python & Scikit-Learn.',
    category: 'AI & ML',
    instructor: 'Dr. Alan Turing',
    duration: '8 Weeks',
    rating: '4.9 ⭐',
    prerequisites: 'Basic Python & Linear Algebra',
    modules: [
      'Module 1: Introduction to Supervised Learning',
      'Module 2: Regression & Cost Functions',
      'Module 3: Decision Trees & Ensemble Methods',
      'Module 4: Model Tuning & Cross Validation'
    ]
  },
  {
    id: 'c2',
    title: 'Deep Learning & Neural Networks',
    description: 'Explore multi-layer perceptrons, Convolutional Networks (CNNs) for computer vision, Transformers, and PyTorch / TensorFlow backends.',
    category: 'AI & ML',
    instructor: 'Dr. Geoffrey Hinton',
    duration: '10 Weeks',
    rating: '4.9 ⭐',
    prerequisites: 'Python & Calculus',
    modules: [
      'Module 1: Backpropagation Mechanics',
      'Module 2: CNN Architecture & Feature Maps',
      'Module 3: Sequence Models & RNNs',
      'Module 4: Transfer Learning with PyTorch'
    ]
  },
  {
    id: 'c3',
    title: 'Generative AI & LLM Engineering',
    description: 'Build production applications powered by OpenAI GPT-4, Claude 3.5, LangChain, LlamaIndex, vector stores, RAG architectures, and fine-tuning.',
    category: 'GenAI',
    instructor: 'Dr. Andrew Ng',
    duration: '6 Weeks',
    rating: '5.0 ⭐',
    prerequisites: 'JavaScript or Python Basics',
    modules: [
      'Module 1: LLM Fundamentals & Prompt Engineering',
      'Module 2: Retrieval Augmented Generation (RAG)',
      'Module 3: LangChain Agents & Tools',
      'Module 4: Fine-Tuning Open Weights'
    ]
  },
  {
    id: 'c4',
    title: 'Natural Language Processing with Transformers',
    description: 'Understand self-attention mechanisms, HuggingFace Transformers, BERT, GPT models, tokenization, semantic search, and vector embeddings.',
    category: 'GenAI',
    instructor: 'Prof. Christopher Manning',
    duration: '8 Weeks',
    rating: '4.8 ⭐',
    prerequisites: 'Deep Learning Basics',
    modules: [
      'Module 1: Word Embeddings to Self-Attention',
      'Module 2: BERT & Encoder Architectures',
      'Module 3: Generative Decoder Architectures',
      'Module 4: Vector Databases & Similarity Search'
    ]
  },
  {
    id: 'c5',
    title: 'Full-Stack React & Next.js Masterclass',
    description: 'Build modern, scalable web applications with Next.js 14, React Server Components, TypeScript, SSR, and dynamic glassmorphism styling.',
    category: 'Web Dev',
    instructor: 'Dan Abramov',
    duration: '12 Weeks',
    rating: '4.9 ⭐',
    prerequisites: 'HTML, CSS & JS Basics',
    modules: [
      'Module 1: React Core Hooks & State Control',
      'Module 2: Next.js App Router & Server Components',
      'Module 3: REST & GraphQL API Integration',
      'Module 4: Production Deployment & Performance'
    ]
  },
  {
    id: 'c6',
    title: 'Cloud Architecture & Microservices',
    description: 'Design resilient distributed systems using Spring Boot, API Gateways, Keycloak OAuth2, Service Mesh, and event-driven architecture.',
    category: 'DevOps & Cloud',
    instructor: 'Kelsey Hightower',
    duration: '9 Weeks',
    rating: '9 Weeks',
    prerequisites: 'Java / Web Basics',
    modules: [
      'Module 1: Microservice Boundaries & Domain-Driven Design',
      'Module 2: API Gateways & JWT Auth Handshakes',
      'Module 3: Event-Driven Systems with Kafka',
      'Module 4: Resiliency Patterns (Circuit Breakers & Retries)'
    ]
  },
  {
    id: 'c7',
    title: 'Python for Data Science & Analytics',
    description: 'Wrangle raw datasets, perform exploratory data analysis (EDA), and build statistical visual models using Pandas, NumPy, and Seaborn.',
    category: 'Data Science',
    instructor: 'Wes McKinney',
    duration: '6 Weeks',
    rating: '4.7 ⭐',
    prerequisites: 'None (Beginner Friendly)',
    modules: [
      'Module 1: Data Structures in Pandas',
      'Module 2: Data Cleaning & Wrangling',
      'Module 3: Exploratory Data Analysis (EDA)',
      'Module 4: Statistical Visualization'
    ]
  },
  {
    id: 'c8',
    title: 'Cybersecurity & Ethical Hacking',
    description: 'Understand web application vulnerability analysis, OWASP Top 10, network defense strategies, penetration testing, and modern cryptography.',
    category: 'Security',
    instructor: 'Kevin Mitnick',
    duration: '8 Weeks',
    rating: '4.8 ⭐',
    prerequisites: 'Networking Basics',
    modules: [
      'Module 1: OWASP Vulnerability Scanning',
      'Module 2: Network Packet Inspection & WireShark',
      'Module 3: Penetration Testing Methodologies',
      'Module 4: Identity & Access Management Hardening'
    ]
  },
  {
    id: 'c9',
    title: 'Computer Vision & Autonomous Systems',
    description: 'Implement real-time object detection (YOLO), image segmentation, OpenCV pipeline processing, and autonomous vehicle perception systems.',
    category: 'AI & ML',
    instructor: 'Dr. Fei-Fei Li',
    duration: '10 Weeks',
    rating: '4.9 ⭐',
    prerequisites: 'Python & Linear Algebra',
    modules: [
      'Module 1: Image Processing with OpenCV',
      'Module 2: Feature Extraction & Edge Detection',
      'Module 3: Object Detection with YOLO & Faster R-CNN',
      'Module 4: Real-time Video Stream Inference'
    ]
  },
  {
    id: 'c10',
    title: 'Prompt Engineering & Agentic Workflows',
    description: 'Architect autonomous multi-agent systems, prompt chains, tool execution, function calling, and self-correcting agent loops.',
    category: 'GenAI',
    instructor: 'Sam Altman',
    duration: '4 Weeks',
    rating: '5.0 ⭐',
    prerequisites: 'Curiosity & Basic Logic',
    modules: [
      'Module 1: System Prompts & Structured JSON Output',
      'Module 2: ReAct Pattern (Reasoning & Action)',
      'Module 3: Multi-Agent Tool Orchestration',
      'Module 4: Evaluating Agent Benchmarks'
    ]
  },
  {
    id: 'c11',
    title: 'Docker, Kubernetes & Cloud Native',
    description: 'Containerize production microservices, manage Kubernetes clusters, set up Prometheus monitoring, and automate CI/CD pipelines.',
    category: 'DevOps & Cloud',
    instructor: 'Solomon Hykes',
    duration: '7 Weeks',
    rating: '4.9 ⭐',
    prerequisites: 'Linux CLI Basics',
    modules: [
      'Module 1: Multi-stage Docker Builds',
      'Module 2: Kubernetes Pods, Deployments & Services',
      'Module 3: Helm Charts & Ingress Control',
      'Module 4: CI/CD Pipeline Automation'
    ]
  }
];

export const getCategoryBadgeClass = (category) => {
  switch (category) {
    case 'GenAI': return 'badge-genai';
    case 'AI & ML': return 'badge-aiml';
    case 'Web Dev': return 'badge-webdev';
    case 'DevOps & Cloud': return 'badge-cloud';
    case 'Security': return 'badge-security';
    case 'Data Science': return 'badge-datascience';
    default: return 'badge-primary';
  }
};
