/**
 * This is a simple seed script to add sample resources to Firestore.
 * Run this once to populate the resources collection with sample data.
 * 
 * To use this script:
 * 1. Make sure you're authenticated in your Firebase project
 * 2. Run this script from your browser console or create a temporary admin page
 */

import { resourceService } from '@/lib/services/resources';

const sampleResources = [
  // Beginner Resources
  {
    title: 'JavaScript Fundamentals',
    description: 'Complete guide to JavaScript basics covering variables, functions, arrays, objects, and ES6+ features. Perfect for beginners starting their web development journey.',
    url: 'https://javascript.info',
    level: 'beginner' as const,
    tags: ['javascript', 'web-development', 'programming-basics', 'tutorial']
  },
  {
    title: 'Python for Beginners',
    description: 'Learn Python programming from scratch with interactive examples, practical exercises, and real-world projects.',
    url: 'https://python.org/about/gettingstarted/',
    level: 'beginner' as const,
    tags: ['python', 'programming-basics', 'tutorial', 'data-science']
  },
  {
    title: 'HTML & CSS Guide',
    description: 'Comprehensive guide to modern HTML and CSS, covering semantic markup, responsive design, and CSS Grid/Flexbox.',
    url: 'https://web.dev/learn/',
    level: 'beginner' as const,
    tags: ['html', 'css', 'web-development', 'responsive-design']
  },
  {
    title: 'Git Version Control',
    description: 'Learn Git fundamentals and collaboration workflows. Essential for any developer working on projects.',
    url: 'https://git-scm.com/docs',
    level: 'beginner' as const,
    tags: ['git', 'version-control', 'collaboration', 'tools']
  },
  {
    title: 'VS Code Tips & Tricks',
    description: 'Productivity tips, keyboard shortcuts, and essential extensions to maximize your coding efficiency in VS Code.',
    url: 'https://code.visualstudio.com/docs',
    level: 'beginner' as const,
    tags: ['vscode', 'productivity', 'tools', 'ide']
  },

  // Intermediate Resources
  {
    title: 'React Documentation',
    description: 'Official React documentation with comprehensive guides, API reference, and practical examples for building user interfaces.',
    url: 'https://reactjs.org/docs/',
    level: 'intermediate' as const,
    tags: ['react', 'frontend', 'javascript', 'web-development', 'ui']
  },
  {
    title: 'Node.js Best Practices',
    description: 'Collection of Node.js best practices, performance optimization techniques, and security guidelines for backend development.',
    url: 'https://nodejs.org/en/docs/',
    level: 'intermediate' as const,
    tags: ['nodejs', 'backend', 'javascript', 'api', 'server']
  },
  {
    title: 'Database Design Principles',
    description: 'Learn relational database design, normalization, indexing strategies, and SQL optimization techniques.',
    url: 'https://www.postgresql.org/docs/',
    level: 'intermediate' as const,
    tags: ['database', 'sql', 'postgresql', 'design-patterns']
  },
  {
    title: 'RESTful API Design',
    description: 'Best practices for designing RESTful APIs, including HTTP methods, status codes, authentication, and documentation.',
    url: 'https://restfulapi.net/',
    level: 'intermediate' as const,
    tags: ['api', 'rest', 'backend', 'web-services', 'architecture']
  },
  {
    title: 'Docker Fundamentals',
    description: 'Introduction to containerization with Docker, including Dockerfile creation, image management, and container orchestration basics.',
    url: 'https://docs.docker.com/get-started/',
    level: 'intermediate' as const,
    tags: ['docker', 'containerization', 'devops', 'deployment']
  },

  // Advanced Resources
  {
    title: 'System Design Interview',
    description: 'Comprehensive guide to system design concepts, scalability patterns, and techniques for designing large-scale distributed systems.',
    url: 'https://github.com/donnemartin/system-design-primer',
    level: 'advanced' as const,
    tags: ['system-design', 'scalability', 'architecture', 'distributed-systems', 'interview-prep']
  },
  {
    title: 'Advanced JavaScript Patterns',
    description: 'Deep dive into advanced JavaScript concepts including closures, prototypes, async patterns, and performance optimization.',
    url: 'https://addyosmani.com/resources/essentialjsdesignpatterns/book/',
    level: 'advanced' as const,
    tags: ['javascript', 'design-patterns', 'performance', 'advanced-concepts']
  },
  {
    title: 'Kubernetes in Production',
    description: 'Production-ready Kubernetes deployment strategies, monitoring, security best practices, and troubleshooting techniques.',
    url: 'https://kubernetes.io/docs/',
    level: 'advanced' as const,
    tags: ['kubernetes', 'devops', 'container-orchestration', 'production', 'cloud-native']
  },
  {
    title: 'Machine Learning with Python',
    description: 'Advanced machine learning techniques using Python, scikit-learn, TensorFlow, and PyTorch for real-world applications.',
    url: 'https://scikit-learn.org/stable/tutorial/',
    level: 'advanced' as const,
    tags: ['machine-learning', 'python', 'data-science', 'tensorflow', 'pytorch']
  },
  {
    title: 'Microservices Architecture',
    description: 'Design patterns and best practices for building, deploying, and managing microservices-based applications.',
    url: 'https://microservices.io/',
    level: 'advanced' as const,
    tags: ['microservices', 'architecture', 'distributed-systems', 'scalability']
  }
];

export async function seedResources(userId: string) {
  console.log('Starting to seed resources...');
  
  try {
    for (const resource of sampleResources) {
      const resourceId = await resourceService.createResource(resource, userId);
      console.log(`Created resource: ${resource.title} (ID: ${resourceId})`);
    }
    
    console.log('✅ All resources have been seeded successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error seeding resources:', error);
    return false;
  }
}

// Export the sample data for reference
export { sampleResources };
