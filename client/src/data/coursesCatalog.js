export const CURATED_COURSES = [
  // --- COURSERA REAL-TIME COURSES ---
  {
    id: 'c_coursera_1',
    title: 'AI For Everyone',
    description: 'AI is not only for engineers. Learn what AI can and cannot do, spot opportunities to apply AI to problems in your organization, and build a sustainable AI strategy.',
    category: 'GenAI',
    instructor: 'Andrew Ng',
    provider: 'DeepLearning.AI',
    duration: '12 Hours',
    rating: '4.8 ⭐',
    ratingCount: '38,000+',
    students: '1,100,000+',
    platform: 'Coursera',
    courseUrl: 'https://www.coursera.org/learn/ai-for-everyone',
    udemyUrl: 'https://www.coursera.org/learn/ai-for-everyone',
    level: 'Beginner (No coding required)',
    prerequisites: 'None',
    whatYouWillLearn: [
      'Understand key AI terminology: Machine Learning, Deep Learning, & Data Science',
      'Realistic overview of what AI can and cannot do in modern business',
      'Spot opportunities to apply AI solutions to problems in your organization',
      'Understand what it feels like to build Machine Learning & Data projects',
      'Work effectively with an AI team and build an enterprise AI strategy',
      'Navigate ethical, societal, and economic discussions surrounding AI'
    ],
    fullDescription: `AI is not only for engineers. If you want your organization to become better at using AI, this is the course to tell everyone—especially your non-technical colleagues—to take.

Taught by AI pioneer Andrew Ng, AI For Everyone will help you understand AI technologies like Machine Learning and Deep Learning, spot AI opportunities, navigate societal impacts, and work collaboratively with technical AI teams.`,
    targetAudience: [
      'Non-technical managers and business leaders wanting to leverage AI',
      'Engineers looking to understand executive AI strategy',
      'Students and professionals seeking a clear introduction to AI'
    ],
    requirements: [
      'No programming or math background required',
      'Curiosity about Artificial Intelligence'
    ],
    instructorBio: 'Andrew Ng is Co-founder of Coursera, Founder of DeepLearning.AI, and Adjunct Professor of Computer Science at Stanford University.',
    modules: [
      'Module 1: What is AI? (Machine Learning vs Data Science)',
      'Module 2: Building AI Projects & Data Workflows',
      'Module 3: Building AI In Your Company & Team Roles',
      'Module 4: AI and Society (Ethics, Bias, & Jobs)'
    ]
  },
  {
    id: 'c_coursera_2',
    title: 'Machine Learning Specialization',
    description: 'Break into AI with the Machine Learning Specialization! Learn foundational ML algorithms, Supervised Learning (Linear Regression, Logistic Regression, Neural Networks), and Unsupervised Learning.',
    category: 'AI & ML',
    instructor: 'Andrew Ng, Eddy Shyu & Aarti Bagul',
    provider: 'Stanford University & DeepLearning.AI',
    duration: '3 Months (9 hrs/wk)',
    rating: '4.9 ⭐',
    ratingCount: '120,000+',
    students: '750,000+',
    platform: 'Coursera',
    courseUrl: 'https://www.coursera.org/specializations/machine-learning-introduction',
    udemyUrl: 'https://www.coursera.org/specializations/machine-learning-introduction',
    level: 'Beginner to Intermediate',
    prerequisites: 'Basic Python & High School Math',
    whatYouWillLearn: [
      'Build Machine Learning models in Python using NumPy & Scikit-Learn',
      'Implement Linear Regression & Logistic Regression from scratch',
      'Train multi-layer Artificial Neural Networks with TensorFlow',
      'Master Decision Trees, Random Forests, & XGBoost ensemble algorithms',
      'Deploy Unsupervised Learning: K-Means clustering, Anomaly Detection, & Recommender Systems',
      'Apply ML best practices: Train/Dev/Test splits, Bias/Variance, & Regularization'
    ],
    fullDescription: `The Machine Learning Specialization is a foundational online program created by Andrew Ng in collaboration with Stanford University and DeepLearning.AI.

Reimagined with modern Python code, NumPy, Scikit-Learn, and TensorFlow, this 3-course specialization will teach you the core concepts and practical skills needed to build state-of-the-art machine learning models.`,
    targetAudience: [
      'Aspiring Machine Learning Engineers and Data Scientists',
      'Software Developers expanding into Artificial Intelligence',
      'Students looking for Stanford-backed ML foundations'
    ],
    requirements: [
      'Basic Python programming (loops, functions, lists)',
      'High school algebra & basic matrix operations'
    ],
    instructorBio: 'Andrew Ng is the founding lead of Google Brain and former Chief Scientist at Baidu.',
    modules: [
      'Course 1: Supervised Machine Learning: Regression and Classification',
      'Course 2: Advanced Learning Algorithms (Neural Networks & Decision Trees)',
      'Course 3: Unsupervised Learning, Recommenders, & Reinforcement Learning'
    ]
  },
  {
    id: 'c_coursera_3',
    title: 'Generative AI with Large Language Models',
    description: 'Gain foundational knowledge of Generative AI, transformer architectures, LLM lifecycle, fine-tuning (PEFT/LoRA), RLHF, and deploying LLM apps on AWS.',
    category: 'GenAI',
    instructor: 'Antje Barth, Chris Fregly & Shelbee Eigenbrode',
    provider: 'DeepLearning.AI & AWS',
    duration: '3 Weeks (5 hrs/wk)',
    rating: '4.8 ⭐',
    ratingCount: '14,000+',
    students: '220,000+',
    platform: 'Coursera',
    courseUrl: 'https://www.coursera.org/learn/generative-ai-with-llms',
    udemyUrl: 'https://www.coursera.org/learn/generative-ai-with-llms',
    level: 'Intermediate',
    prerequisites: 'Python & Deep Learning Fundamentals',
    whatYouWillLearn: [
      'Deeply understand Transformer architecture (Attention Is All You Need)',
      'Master LLM pre-training, scaling laws, and context window optimization',
      'Instruction fine-tuning and Parameter-Efficient Fine-Tuning (PEFT / LoRA)',
      'Align LLMs with human feedback using RLHF & DPO techniques',
      'Implement RAG architectures and LLM reasoning agents',
      'Deploy scalable LLM inference pipelines on AWS SageMaker'
    ],
    fullDescription: `Developed jointly by DeepLearning.AI and AWS experts, Generative AI with LLMs teaches you the technical foundation and practical skills needed to train, fine-tune, and deploy Large Language Models.

Learn how Transformers work under the hood, how to fine-tune open-weights models like Llama 3 with LoRA, and how to build production RAG applications.`,
    targetAudience: [
      'Developers & Data Scientists building Generative AI applications',
      'Machine Learning Engineers optimizing LLM fine-tuning pipelines',
      'Cloud architects designing LLM infrastructure on AWS'
    ],
    requirements: [
      'Intermediate Python knowledge',
      'Basic understanding of PyTorch or TensorFlow neural networks'
    ],
    instructorBio: 'Antje Barth & Chris Fregly are Principal Developer Advocates for AI and Machine Learning at AWS.',
    modules: [
      'Week 1: Generative AI Use Cases & Transformer Architecture',
      'Week 2: Fine-tuning LLMs & Parameter-Efficient PEFT/LoRA',
      'Week 3: Reinforcement Learning from Human Feedback (RLHF) & Application Deployment'
    ]
  },
  {
    id: 'c_coursera_4',
    title: 'Deep Learning Specialization',
    description: 'Master Deep Learning, build neural networks, train CNNs for computer vision, LSTMs/Transformers for NLP, and optimize models using Adam and Dropout.',
    category: 'AI & ML',
    instructor: 'Andrew Ng, Younes Bensouda & Kian Katanforoosh',
    provider: 'DeepLearning.AI',
    duration: '5 Months (4 hrs/wk)',
    rating: '4.9 ⭐',
    ratingCount: '165,000+',
    students: '820,000+',
    platform: 'Coursera',
    courseUrl: 'https://www.coursera.org/specializations/deep-learning',
    udemyUrl: 'https://www.coursera.org/specializations/deep-learning',
    level: 'Intermediate',
    prerequisites: 'Python & Linear Algebra',
    whatYouWillLearn: [
      'Build & train Deep Neural Networks with vectorized backpropagation',
      'Implement Hyperparameter tuning, Batch Normalization, & Dropout regularization',
      'Construct Convolutional Neural Networks (CNN) for image recognition (YOLO, ResNet)',
      'Develop Recurrent Neural Networks (RNN), LSTMs, & Attention Transformers for NLP',
      'Structure Machine Learning projects & diagnose error analysis',
      'Use Python & TensorFlow/Keras to build industrial AI models'
    ],
    fullDescription: `The Deep Learning Specialization is one of the most famous AI programs in history. Created by Andrew Ng, it has helped over 800,000 students break into Deep Learning and AI research.

You will build neural networks step-by-step from scratch in Python, then scale them up using TensorFlow to solve computer vision, audio processing, and NLP challenges.`,
    targetAudience: [
      'Engineers wanting to master Deep Learning & Neural Networks',
      'AI Researchers preparing for cutting-edge computer vision & NLP roles',
      'Software developers seeking comprehensive PyTorch/TensorFlow training'
    ],
    requirements: [
      'Python programming experience',
      'Basic linear algebra & calculus'
    ],
    instructorBio: 'Andrew Ng is Adjunct Professor at Stanford University and Founder of DeepLearning.AI.',
    modules: [
      'Course 1: Neural Networks and Deep Learning',
      'Course 2: Improving Deep Neural Networks: Hyperparameter Tuning & Regularization',
      'Course 3: Structuring Machine Learning Projects',
      'Course 4: Convolutional Neural Networks (CNNs)',
      'Course 5: Sequence Models (RNNs, LSTMs, & Transformers)'
    ]
  },
  {
    id: 'c_coursera_5',
    title: 'IBM Data Science Professional Certificate',
    description: 'Kickstart your career in Data Science & Machine Learning. Build data science skills, write Python code, wrangle data with Pandas, build SQL queries, and construct ML models.',
    category: 'Data Science',
    instructor: 'Rav Ahuja & Romeo Kienzler',
    provider: 'IBM',
    duration: '5 Months (3 hrs/wk)',
    rating: '4.6 ⭐',
    ratingCount: '110,000+',
    students: '480,000+',
    platform: 'Coursera',
    courseUrl: 'https://www.coursera.org/professional-certificates/ibm-data-science',
    udemyUrl: 'https://www.coursera.org/professional-certificates/ibm-data-science',
    level: 'Beginner',
    prerequisites: 'None',
    whatYouWillLearn: [
      'Master Data Science tools: Jupyter Notebooks, RStudio, & IBM Watson Studio',
      'Write Python code for Data Analysis using Pandas, NumPy, & SciPy',
      'Query databases using SQL & Relational Database concepts',
      'Visualize complex datasets with Matplotlib, Seaborn, & Folium maps',
      'Build Machine Learning models with Scikit-Learn',
      'Complete a Capstone Project analyzing real-world spaceflight & financial data'
    ],
    fullDescription: `Data Science is one of the hottest professions. This Professional Certificate from IBM will give you job-ready skills to launch a career in Data Science or Data Analytics.

No prior experience in computer science or programming is required. Through 10 hands-on courses, you will learn Python, SQL, Data Visualization, Exploratory Data Analysis, and Machine Learning.`,
    targetAudience: [
      'Beginners seeking an entry-level Data Science career credential',
      'Career changers transitioning into tech & analytics',
      'Business analysts seeking Python & SQL skills'
    ],
    requirements: [
      'No prior programming or computer science experience needed',
      'Internet connection and web browser'
    ],
    instructorBio: 'IBM Data Science Network team consists of senior data scientists, architects, and curriculum engineers at IBM.',
    modules: [
      'Course 1: What is Data Science?',
      'Course 2: Tools for Data Science',
      'Course 3: Data Science Methodology',
      'Course 4: Python for Data Science, AI & Development',
      'Course 5: Python Project for Data Science',
      'Course 6: Databases and SQL for Data Science with Python',
      'Course 7: Data Analysis with Python',
      'Course 8: Data Visualization with Python',
      'Course 9: Machine Learning with Python',
      'Course 10: Applied Data Science Capstone'
    ]
  },
  {
    id: 'c_coursera_6',
    title: 'Google Cybersecurity Professional Certificate',
    description: 'Prepare for an entry-level cybersecurity role with Google. Learn Python, Linux, SQL, SIEM tools (Chronicle, Splunk), and network security defense strategies.',
    category: 'Security',
    instructor: 'Google Career Certificates Staff',
    provider: 'Google',
    duration: '6 Months (7 hrs/wk)',
    rating: '4.8 ⭐',
    ratingCount: '32,000+',
    students: '310,000+',
    platform: 'Coursera',
    courseUrl: 'https://www.coursera.org/professional-certificates/google-cybersecurity',
    udemyUrl: 'https://www.coursera.org/professional-certificates/google-cybersecurity',
    level: 'Beginner',
    prerequisites: 'None',
    whatYouWillLearn: [
      'Understand cybersecurity foundations and threat landscape',
      'Protect networks, devices, people, and data from cyberattacks',
      'Master Security Information and Event Management (SIEM) tools like Chronicle & Splunk',
      'Gain hands-on experience with Linux command line and SQL database queries',
      'Automate cybersecurity tasks using Python scripts',
      'Prepare for the CompTIA Security+ industry certification'
    ],
    fullDescription: `Designed by Google cybersecurity experts, this certificate program will prepare you for an entry-level role in cybersecurity—in under 6 months with no prior experience needed.

Learn how to analyze network traffic, inspect packet captures, use SIEM tools to detect security incidents, and write Python scripts to automate incident response.`,
    targetAudience: [
      'Anyone looking to break into Cybersecurity',
      'IT professionals upgrading to SOC Analyst roles',
      'Students preparing for CompTIA Security+ certification'
    ],
    requirements: [
      'No prior cybersecurity or IT experience required',
      'Basic computer literacy'
    ],
    instructorBio: 'Google Career Certificates are created by top cybersecurity engineers at Google.',
    modules: [
      'Course 1: Foundations of Cybersecurity',
      'Course 2: Play It Safe: Manage Security Risks',
      'Course 3: Connect and Protect: Networks and Network Security',
      'Course 4: Tools of the Trade: Linux and SQL',
      'Course 5: Assets, Threats, and Vulnerabilities',
      'Course 6: Sound the Alarm: Detection and Response',
      'Course 7: Automate Cybersecurity Tasks with Python',
      'Course 8: Put It to Work: Prepare for Cybersecurity Jobs'
    ]
  },
  {
    id: 'c_coursera_7',
    title: 'Prompt Engineering for ChatGPT',
    description: 'Learn how to write effective prompts for ChatGPT and Large Language Models. Master prompt patterns like Persona, Meta Language, Recipe, and Refinement to automate daily work.',
    category: 'GenAI',
    instructor: 'Dr. Jules White',
    provider: 'Vanderbilt University',
    duration: '18 Hours',
    rating: '4.8 ⭐',
    ratingCount: '22,000+',
    students: '390,000+',
    platform: 'Coursera',
    courseUrl: 'https://www.coursera.org/learn/prompt-engineering',
    udemyUrl: 'https://www.coursera.org/learn/prompt-engineering',
    level: 'Beginner',
    prerequisites: 'None',
    whatYouWillLearn: [
      'Write highly efficient prompts for LLMs like ChatGPT & Claude',
      'Apply advanced prompt design patterns (Persona, Question Refinement, Cognitive Verifier)',
      'Use ChatGPT for automated document analysis, summarization, and data extraction',
      'Create custom instructions and system prompts for specialized domains'
    ],
    fullDescription: `Taught by Professor Jules White of Vanderbilt University, this course teaches you how to unleash the full potential of Large Language Models through Prompt Engineering.`,
    targetAudience: ['Professionals, students, and developers wanting to master prompt techniques'],
    requirements: ['No programming required'],
    instructorBio: 'Dr. Jules White is Associate Dean and Associate Professor of Computer Science at Vanderbilt University.',
    modules: [
      'Module 1: Introduction to Prompt Engineering & Basic Patterns',
      'Module 2: Advanced Prompt Patterns (Meta Language & Recipe)',
      'Module 3: Complex Reasoning & Task Decomposition',
      'Module 4: Domain-Specific AI Integration'
    ]
  },
  {
    id: 'c_coursera_8',
    title: 'Mathematics for Machine Learning Specialization',
    description: 'Master the prerequisite mathematics for Data Science and Machine Learning: Linear Algebra, Multivariate Calculus, and Principal Component Analysis (PCA).',
    category: 'AI & ML',
    instructor: 'Dr. David Dye & Dr. Sam Cooper',
    provider: 'Imperial College London',
    duration: '2 Months (10 hrs/wk)',
    rating: '4.7 ⭐',
    ratingCount: '19,000+',
    students: '310,000+',
    platform: 'Coursera',
    courseUrl: 'https://www.coursera.org/specializations/mathematics-machine-learning',
    udemyUrl: 'https://www.coursera.org/specializations/mathematics-machine-learning',
    level: 'Intermediate',
    prerequisites: 'High School Algebra',
    whatYouWillLearn: [
      'Understand vectors, matrices, eigenvalues, and eigenvectors in Linear Algebra',
      'Calculate gradients, partial derivatives, and Jacobians for neural network optimization',
      'Implement Principal Component Analysis (PCA) for dimensionality reduction in Python'
    ],
    fullDescription: `For a lot of higher-level courses in Machine Learning and Data Science, you find yourself needing to refresh your math. This specialization fills that gap, teaching the core mathematics of ML.`,
    targetAudience: ['Data Science students needing strong mathematical foundations'],
    requirements: ['High School algebra'],
    instructorBio: 'Dr. David Dye is Professor of Metallurgy at Imperial College London.',
    modules: [
      'Course 1: Mathematics for Machine Learning: Linear Algebra',
      'Course 2: Mathematics for Machine Learning: Multivariate Calculus',
      'Course 3: Mathematics for Machine Learning: PCA'
    ]
  },

  // --- UDEMY REAL-TIME COURSES ---
  {
    id: 'c_udemy_1',
    title: 'Machine Learning A-Z™: AI, Python & R + ChatGPT',
    description: 'Learn to create Machine Learning Algorithms in Python and R from two Data Science experts. Includes hands-on ChatGPT integration, classification, regression, NLP, and Deep Learning.',
    category: 'AI & ML',
    instructor: 'Kirill Eremenko & Hadelin de Ponteves',
    provider: 'SuperDataScience',
    duration: '42.5 Hours',
    rating: '4.8 ⭐',
    ratingCount: '175,000+',
    students: '980,000+',
    platform: 'Udemy',
    courseUrl: 'https://www.udemy.com/course/machinelearning/',
    udemyUrl: 'https://www.udemy.com/course/machinelearning/',
    level: 'All Levels',
    prerequisites: 'High School Math',
    whatYouWillLearn: [
      'Master Machine Learning on Python & R with hands-on coding exercises',
      'Build accurate Linear, Logistic, Polynomial, & Decision Tree regression models',
      'Make robust predictions using Random Forests, XGBoost, & Ensemble Methods',
      'Handle missing data, feature scaling, and categorical encoding like a pro',
      'Integrate ChatGPT to auto-generate ML boilerplate code and debug scripts',
      'Implement K-Means, Hierarchical Clustering, and Apriori Association Rules',
      'Evaluate models using K-Fold Cross Validation and Grid Search hyperparameter tuning'
    ],
    fullDescription: `Interested in the field of Machine Learning? Then this course is for you! Designed by two professional Data Scientists, Kirill Eremenko & Hadelin de Ponteves, this course helps you master complex ML algorithms, theory, and implementation in Python & R.

Packed with practical exercises based on real-life examples, you won't just learn the theory—you will get hands-on practice building your own models. Now upgraded with ChatGPT AI code generation techniques to boost your productivity by 10x!`,
    targetAudience: [
      'Anyone interested in Machine Learning & Data Science',
      'Students with high school math level who want to break into AI engineering',
      'Programmers wanting to transition into Machine Learning roles'
    ],
    requirements: [
      'High School Mathematics knowledge (basic algebra & functions)',
      'No prior AI or Machine Learning experience required'
    ],
    instructorBio: 'Kirill Eremenko & Hadelin de Ponteves are leading Data Science educators on Udemy with over 2 Million students worldwide.',
    modules: [
      'Module 1: Data Preprocessing & Exploratory Data Analysis',
      'Module 2: Regression (Linear, Polynomial, SVR, Decision Tree)',
      'Module 3: Classification (Logistic, KNN, SVM, Naive Bayes)',
      'Module 4: Clustering & Reinforcement Learning (UCB, Thompson)',
      'Module 5: Deep Learning & ChatGPT AI Code Generation'
    ]
  },
  {
    id: 'c_udemy_2',
    title: 'Artificial Intelligence A-Z 2024: Build 7 AI + LLMs & Agents',
    description: 'Combine the power of Data Science, Deep Learning, and Reinforcement Learning to build autonomous AI agents, Self-Driving Car AI, and LLM applications.',
    category: 'GenAI',
    instructor: 'Hadelin de Ponteves & Luka Anicin',
    provider: 'SuperDataScience',
    duration: '17 Hours',
    rating: '4.7 ⭐',
    ratingCount: '45,000+',
    students: '350,000+',
    platform: 'Udemy',
    courseUrl: 'https://www.udemy.com/course/artificial-intelligence-az/',
    udemyUrl: 'https://www.udemy.com/course/artificial-intelligence-az/',
    level: 'Beginner to Advanced',
    prerequisites: 'Python Basics',
    whatYouWillLearn: [
      'Build 7 Real-World AI applications and autonomous agents from scratch',
      'Master Deep Q-Learning (DQN) and Convolutional Q-Learning',
      'Understand Actor-Critic models (A3C) for complex environments',
      'Construct Autonomous AI Agents using LLMs and ReAct frameworks',
      'Fine-tune open-source LLMs like Llama 3 using QLoRA',
      'Build a Virtual Self-Driving Car simulation using PyTorch'
    ],
    fullDescription: `Combine the power of Data Science, Machine Learning, Deep Learning, and Large Language Models to create powerful AI for real-world applications.

This course covers state-of-the-art Deep Reinforcement Learning along with modern LLM Autonomous Agent architectures. You will build a Virtual Self-Driving Car, solve Atari games, and build AI agents that plan, tool-use, and self-correct.`,
    targetAudience: [
      'Developers looking to master modern AI & Autonomous Agents',
      'Data Scientists wanting to add Reinforcement Learning and LLMs to their toolkit',
      'AI enthusiasts interested in building self-learning systems'
    ],
    requirements: [
      'Python programming basics',
      'A computer capable of running Anaconda or Google Colab'
    ],
    instructorBio: 'Hadelin de Ponteves is an AI entrepreneur and author who has trained over 1.5 million students in artificial intelligence.',
    modules: [
      'Module 1: Deep Q-Learning (DQN) & OpenAI Gym',
      'Module 2: Convolutional Q-Learning for Atari Games',
      'Module 3: A3C (Asynchronous Advantage Actor-Critic)',
      'Module 4: Autonomous LLM Agents & ReAct Prompting',
      'Module 5: Fine-tuning Open-Source Models (Llama 3)'
    ]
  },
  {
    id: 'c_udemy_3',
    title: 'LangChain & LLMs: Master Generative AI & AI Agents',
    description: 'Build enterprise Generative AI apps using LangChain, OpenAI GPT-4o, Llama 3, Vector DBs (ChromaDB, Pinecone), RAG architecture, and Multi-Agent flows.',
    category: 'GenAI',
    instructor: 'Dr. Ryan Ahmed & Mitchell Hibbard',
    provider: 'AI Engineering Academy',
    duration: '14 Hours',
    rating: '4.9 ⭐',
    ratingCount: '12,000+',
    students: '65,000+',
    platform: 'Udemy',
    courseUrl: 'https://www.udemy.com/course/generative-ai-langchain-llms/',
    udemyUrl: 'https://www.udemy.com/course/generative-ai-langchain-llms/',
    level: 'All Levels',
    prerequisites: 'Python Basics',
    whatYouWillLearn: [
      'Architect production-grade Generative AI applications with LangChain & OpenAI',
      'Build Retrieval Augmented Generation (RAG) pipelines over custom documents',
      'Master Vector Databases: ChromaDB, Pinecone, FAISS, and Weaviate',
      'Develop Autonomous Multi-Agent Workflows with CrewAI & LangGraph',
      'Implement Conversation Memory, Chains, and Custom Tools',
      'Deploy LLM microservices to cloud environments with rate-limiting and telemetry'
    ],
    fullDescription: `Generative AI and Large Language Models are revolutionizing software development. This course is your complete roadmap to mastering LangChain, vector embeddings, RAG, and multi-agent systems.

You will build enterprise chatbots, document Q&A systems, and autonomous research agents that use tools like web search, code execution, and SQL databases.`,
    targetAudience: [
      'Software engineers wanting to build GenAI applications',
      'Product managers & architects designing AI features',
      'Data engineers building RAG search systems'
    ],
    requirements: [
      'Python programming fundamentals',
      'Basic familiarity with REST APIs'
    ],
    instructorBio: 'Dr. Ryan Ahmed is an AI Professor & Engineer with over 500,000 students on Udemy.',
    modules: [
      'Module 1: LLM Fundamentals & Prompt Engineering Patterns',
      'Module 2: Document Loaders, Text Splitters & Vector Embeddings',
      'Module 3: Retrieval Augmented Generation (RAG) Systems',
      'Module 4: Custom LangChain Agents, Tools & Memory',
      'Module 5: Multi-Agent Collaboration with CrewAI'
    ]
  },
  {
    id: 'c_udemy_4',
    title: 'PyTorch for Deep Learning & Machine Learning Bootcamp',
    description: 'Learn PyTorch from scratch! Build Computer Vision, Natural Language Processing, and Transformer models using industry-standard PyTorch code.',
    category: 'AI & ML',
    instructor: 'Daniel Bourke',
    provider: 'ZTM Academy',
    duration: '26 Hours',
    rating: '4.9 ⭐',
    ratingCount: '9,500+',
    students: '55,000+',
    platform: 'Udemy',
    courseUrl: 'https://www.udemy.com/course/pytorch-for-deep-learning/',
    udemyUrl: 'https://www.udemy.com/course/pytorch-for-deep-learning/',
    level: 'Beginner',
    prerequisites: 'Python Fundamentals',
    whatYouWillLearn: [
      'Write clean, idiomatic PyTorch code from scratch',
      'Understand PyTorch Tensors, Autograd, and GPU acceleration with CUDA',
      'Build Computer Vision models with CNNs and PyTorch Torchvision',
      'Implement Transfer Learning using pre-trained ResNet and EfficientNet',
      'Construct Custom Datasets, DataLoaders, and Data Augmentation pipelines',
      'Track experiments using Weights & Biases and TensorBoard'
    ],
    fullDescription: `PyTorch is the framework of choice for AI researchers and top tech companies like Meta, Tesla, and OpenAI.

Created by Daniel Bourke, this course takes you from zero to building state-of-the-art Deep Learning models in PyTorch. You will learn by writing code line-by-line, solving exercises, and building computer vision models.`,
    targetAudience: [
      'Python programmers wanting to master PyTorch',
      'Data Scientists moving from Scikit-Learn to Deep Learning',
      'AI researchers looking for a comprehensive PyTorch guide'
    ],
    requirements: [
      'Basic Python programming skills',
      'No previous PyTorch or Deep Learning experience required'
    ],
    instructorBio: 'Daniel Bourke is a Machine Learning engineer, YouTube creator, and author of popular PyTorch learning resources.',
    modules: [
      'Module 1: PyTorch Workflow & Tensors Fundamentals',
      'Module 2: PyTorch Neural Network Classification',
      'Module 3: Computer Vision & Convolutional Neural Networks',
      'Module 4: Custom Datasets, DataLoaders & Augmentation',
      'Module 5: Transfer Learning & Model Deployment'
    ]
  },
  {
    id: 'c_udemy_5',
    title: 'Python for Data Science and Machine Learning Bootcamp',
    description: 'Learn NumPy, Pandas, Seaborn, Matplotlib, Plotly, Scikit-Learn, Machine Learning, TensorFlow, and more from top Udemy instructor Jose Portilla.',
    category: 'Data Science',
    instructor: 'Jose Portilla',
    provider: 'Pierian Training',
    duration: '25 Hours',
    rating: '4.7 ⭐',
    ratingCount: '140,000+',
    students: '650,000+',
    platform: 'Udemy',
    courseUrl: 'https://www.udemy.com/course/python-for-data-science-and-machine-learning-bootcamp/',
    udemyUrl: 'https://www.udemy.com/course/python-for-data-science-and-machine-learning-bootcamp/',
    level: 'Beginner to Intermediate',
    prerequisites: 'Basic Math',
    whatYouWillLearn: [
      'Use Python for Data Science, Data Cleaning, and Statistical Analysis',
      'Master Pandas for data manipulation & wrangling',
      'Create publication-ready charts using Seaborn, Matplotlib, and Plotly',
      'Build ML models using Scikit-Learn (K-Means, Random Forest, SVM)',
      'Perform Natural Language Processing and Sentiment Analysis',
      'Introduction to Neural Networks and Deep Learning with TensorFlow'
    ],
    fullDescription: `This comprehensive course is designed for both beginners with no programming experience and seasoned developers looking to make the jump to Data Science.

Taught by Jose Portilla, Head of Data Science at Pierian Training, this course covers the full spectrum of data analysis, visualization, and machine learning with Python.`,
    targetAudience: [
      'Beginners wanting to learn Python for Data Science',
      'Analysts upgrading from Excel to Python & Pandas',
      'Engineers moving into Data Science & Machine Learning'
    ],
    requirements: [
      'A computer with internet access',
      'Basic math concepts (averages, basic algebra)'
    ],
    instructorBio: 'Jose Portilla has taught over 3 million students on Udemy and holds BS and MS degrees in Mechanical Engineering from Santa Clara University.',
    modules: [
      'Module 1: Data Analysis with Pandas & NumPy',
      'Module 2: Data Visualization with Seaborn & Matplotlib',
      'Module 3: Machine Learning with Scikit-Learn',
      'Module 4: Natural Language Processing & Text Mining',
      'Module 5: Introduction to Neural Networks & TensorFlow'
    ]
  },
  {
    id: 'c_udemy_6',
    title: 'AWS Certified Machine Learning Specialty - Hands On!',
    description: 'Pass the AWS Certified Machine Learning Specialty MLS-C01 exam with hands-on labs on SageMaker, Rekognition, Comprehend, Transcribe, and MLOps.',
    category: 'DevOps & Cloud',
    instructor: 'Stephane Maarek & Frank Kane',
    provider: 'Sundog Education',
    duration: '14.5 Hours',
    rating: '4.8 ⭐',
    ratingCount: '16,000+',
    students: '95,000+',
    platform: 'Udemy',
    courseUrl: 'https://www.udemy.com/course/aws-machine-learning/',
    udemyUrl: 'https://www.udemy.com/course/aws-machine-learning/',
    level: 'Advanced',
    prerequisites: 'AWS Fundamentals',
    whatYouWillLearn: [
      'Pass the AWS Certified Machine Learning Specialty (MLS-C01) exam',
      'Prepare & transform data using AWS Glue, Kinesis, Athena, and EMR',
      'Master Amazon SageMaker: Built-in algorithms, Hyperparameter Tuning, & Endpoints',
      'Utilize High-Level AI Services: Amazon Rekognition, Polly, Transcribe, Comprehend',
      'Implement MLOps, CI/CD pipelines, Model Monitoring, and Security best practices',
      'Solve 100+ exam practice questions with detailed explanations'
    ],
    fullDescription: `Pass the AWS Certified Machine Learning Specialty exam on your first attempt!

AWS Experts Stephane Maarek and Frank Kane guide you through all four exam domains: Data Engineering, Exploratory Data Analysis, Modeling, and Machine Learning Implementation & Operations. Packed with hands-on AWS SageMaker labs and full exam practice tests.`,
    targetAudience: [
      'Developers & Data Scientists preparing for AWS ML Specialty Certification',
      'Cloud Engineers building ML pipelines on AWS',
      'Solutions Architects designing enterprise AI systems'
    ],
    requirements: [
      'Basic understanding of Machine Learning concepts',
      'Familiarity with AWS Cloud fundamentals'
    ],
    instructorBio: 'Stephane Maarek & Frank Kane are AWS Certified experts who have helped over 2 million students achieve AWS certifications.',
    modules: [
      'Module 1: Data Engineering & AWS Glue / Kinesis',
      'Module 2: Exploratory Data Analysis & AWS Athena',
      'Module 3: Modeling & Amazon SageMaker Algorithms',
      'Module 4: High Level AI Services (Rekognition, Polly, Transcribe)',
      'Module 5: MLOps, Model Monitoring & Security'
    ]
  },
  {
    id: 'c_udemy_7',
    title: 'The Complete Web Development Bootcamp 2024',
    description: 'Become a Full-Stack Web Developer with just ONE course. HTML, CSS, JavaScript, Node.js, React, PostgreSQL, Web3, and OpenAI integration.',
    category: 'Web Dev',
    instructor: 'Dr. Angela Yu',
    provider: 'App Brewery',
    duration: '62 Hours',
    rating: '4.7 ⭐',
    ratingCount: '380,000+',
    students: '1,250,000+',
    platform: 'Udemy',
    courseUrl: 'https://www.udemy.com/course/the-complete-web-development-bootcamp/',
    udemyUrl: 'https://www.udemy.com/course/the-complete-web-development-bootcamp/',
    level: 'All Levels',
    prerequisites: 'None',
    whatYouWillLearn: [
      'Build full-stack web applications with React, Node.js, Express, & PostgreSQL',
      'Integrate OpenAI API to build AI-powered web applications',
      'Master modern CSS Grid, Flexbox, and glassmorphism UI design',
      'Deploy applications to production with version control & Git'
    ],
    fullDescription: `Welcome to the Complete Web Development Bootcamp, the highest-rated web development course on Udemy! Taught by Dr. Angela Yu, lead instructor at the London App Brewery.`,
    targetAudience: ['Anyone wanting to learn web development and build full-stack AI web apps'],
    requirements: ['No prior programming experience required'],
    instructorBio: 'Dr. Angela Yu is the lead instructor at the London App Brewery.',
    modules: [
      'Module 1: Frontend Web Development (HTML5, CSS3, Flexbox, Grid)',
      'Module 2: JavaScript ES6 & DOM Manipulation',
      'Module 3: Backend Web Development with Node.js & Express',
      'Module 4: React.js & Full-Stack AI API Integration'
    ]
  },
  {
    id: 'c_udemy_8',
    title: 'Natural Language Processing with Deep Learning in Python',
    description: 'Complete guide to NLP in Python, Transformers, BERT, GPT, Sentiment Analysis, Spam Detection, Vector Embeddings, and Semantic Search.',
    category: 'GenAI',
    instructor: 'Lazy Programmer Team',
    provider: 'Deep Learning Courses',
    duration: '12 Hours',
    rating: '4.7 ⭐',
    ratingCount: '11,000+',
    students: '80,000+',
    platform: 'Udemy',
    courseUrl: 'https://www.udemy.com/course/data-science-natural-language-processing-in-python/',
    udemyUrl: 'https://www.udemy.com/course/data-science-natural-language-processing-in-python/',
    level: 'Intermediate',
    prerequisites: 'Python & Linear Algebra',
    whatYouWillLearn: [
      'Build NLP pipelines: Tokenization, Stemming, Lemmatization, & Stopwords',
      'Implement Word Embeddings: Word2Vec, GloVe, and FastText',
      'Construct Sentiment Analyzers, Spam Filters, and Text Classifiers',
      'Master Recurrent Neural Networks (RNN), LSTMs, and GRUs for sequence data',
      'Understand Self-Attention mechanisms and Transformer architectures'
    ],
    fullDescription: `Natural Language Processing (NLP) powers search engines, spam filters, machine translation, voice assistants, and large language models like ChatGPT.`,
    targetAudience: ['Data Scientists and Developers specializing in NLP'],
    requirements: ['Python programming proficiency'],
    instructorBio: 'Lazy Programmer is a senior Machine Learning engineer and data scientist.',
    modules: [
      'Module 1: TF-IDF & Naive Bayes NLP',
      'Module 2: Word2Vec & Vector Embeddings',
      'Module 3: Recurrent Networks & Sequence-to-Sequence NLP',
      'Module 4: Attention Mechanisms & Transformer Architecture'
    ]
  },

  // --- edX REAL-TIME COURSES ---
  {
    id: 'c_edx_1',
    title: "CS50's Introduction to Artificial Intelligence with Python",
    description: 'Explore the concepts and algorithms at the foundation of modern artificial intelligence, diving into the ideas that give rise to technologies like game-playing engines, handwriting recognition, and machine translation.',
    category: 'AI & ML',
    instructor: 'Prof. David J. Malan & Brian Yu',
    provider: 'Harvard University',
    duration: '7 Weeks (10 hrs/wk)',
    rating: '4.9 ⭐',
    ratingCount: '48,000+',
    students: '680,000+',
    platform: 'edX',
    courseUrl: 'https://www.edx.org/learn/artificial-intelligence/harvard-university-cs50-s-introduction-to-artificial-intelligence-with-python',
    udemyUrl: 'https://www.edx.org/learn/artificial-intelligence/harvard-university-cs50-s-introduction-to-artificial-intelligence-with-python',
    level: 'Intermediate',
    prerequisites: 'CS50x or Python experience',
    whatYouWillLearn: [
      'Graph search algorithms (Minimax, Alpha-Beta Pruning, A* Search)',
      'Knowledge representation and propositional logic',
      'Probabilistic reasoning and Bayesian Networks',
      'Machine Learning: Markov Models, Neural Networks, & Natural Language Processing'
    ],
    fullDescription: `CS50's Introduction to Artificial Intelligence with Python explores the concepts and algorithms at the foundation of modern AI, diving into the ideas that power modern game engines, natural language processing, and automated reasoning.`,
    targetAudience: ['Students wanting a rigorous Harvard introduction to AI theory and Python algorithms'],
    requirements: ['Python programming experience'],
    instructorBio: 'Prof. David J. Malan is Gordon McKay Professor of the Practice of Computer Science at Harvard University.',
    modules: [
      'Module 1: Search & Optimization (A*, Minimax)',
      'Module 2: Knowledge & Logic',
      'Module 3: Uncertainty & Probability',
      'Module 4: Learning & Neural Networks',
      'Module 5: Language & NLP'
    ]
  },
  {
    id: 'c_edx_2',
    title: 'Columbia MicroMasters® in Artificial Intelligence',
    description: 'Gain advanced expertise in Artificial Intelligence, Machine Learning, Neural Networks, and Robotics through Columbia University’s flagship online program.',
    category: 'AI & ML',
    instructor: 'Prof. Ansaf Salleb-Aouissi',
    provider: 'Columbia University',
    duration: '1 Year (12 hrs/wk)',
    rating: '4.8 ⭐',
    ratingCount: '15,000+',
    students: '190,000+',
    platform: 'edX',
    courseUrl: 'https://www.edx.org/masters/micromasters/columbiax-artificial-intelligence',
    udemyUrl: 'https://www.edx.org/masters/micromasters/columbiax-artificial-intelligence',
    level: 'Advanced',
    prerequisites: 'Calculus, Linear Algebra, & Python',
    whatYouWillLearn: [
      'Master fundamental AI representations and search algorithms',
      'Deep dive into Machine Learning for data analysis',
      'Build Neural Networks for Computer Vision and Natural Language Processing',
      'Program physical and virtual Autonomous Robotics systems'
    ],
    fullDescription: `Earn a credential from Columbia University to advance your AI career with deep theoretical and hands-on rigor.`,
    targetAudience: ['Engineers and researchers seeking master-level AI credentialing'],
    requirements: ['College-level math and strong programming skills'],
    instructorBio: 'Prof. Ansaf Salleb-Aouissi is Senior Lecturer in Computer Science at Columbia University.',
    modules: [
      'Course 1: Artificial Intelligence (AI)',
      'Course 2: Machine Learning',
      'Course 3: Animation and CGI Motion',
      'Course 4: Robotics'
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
