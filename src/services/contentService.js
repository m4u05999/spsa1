/**
 * Content Service - Handles all content-related API operations
 * src/services/contentService.js
 */
import localStorageService from './localStorageService';

// Storage keys
const CONTENT_STORAGE_KEY = 'cms_contents';
const CONTENT_CATEGORIES_KEY = 'cms_categories';
const CONTENT_TAGS_KEY = 'cms_tags';

// Mock data for initial development
const initialContents = [
  {
    id: '1',
    title: 'مستقبل العلاقات الدولية في الشرق الأوسط',
    type: 'article',
    author: 'د. محمد العتيبي',
    status: 'published',
    content: 'محتوى المقال هنا...',
    excerpt: 'نظرة تحليلية عميقة حول مستقبل العلاقات الدولية في منطقة الشرق الأوسط والتحديات الجيوسياسية',
    categories: ['العلاقات الدولية', 'الشرق الأوسط'],
    tags: ['دبلوماسية', 'سياسة خارجية', 'أمن إقليمي'],
    createdAt: '2023-04-15',
    updatedAt: '2023-04-20',
    publishedAt: '2023-04-22',
    viewCount: 1254,
    featured: true,
    image: '/assets/images/article1.jpg'
  },
  {
    id: '2',
    title: 'تأثير الاقتصاد السياسي على التنمية المستدامة',
    type: 'research',
    author: 'د. فاطمة الزهراني',
    status: 'published',
    content: 'محتوى البحث هنا...',
    excerpt: 'دراسة تحليلية للعلاقة بين الاقتصاد السياسي وتحقيق أهداف التنمية المستدامة',
    categories: ['اقتصاد سياسي', 'تنمية مستدامة'],
    tags: ['اقتصاد', 'تنمية', 'استدامة', 'سياسات عامة'],
    createdAt: '2023-03-10',
    updatedAt: '2023-03-15',
    publishedAt: '2023-03-20',
    viewCount: 875,
    featured: false,
    image: '/assets/images/research1.jpg'
  },
  {
    id: '3',
    title: 'دور المرأة في صنع السياسات العامة',
    type: 'article',
    author: 'د. نورة العنزي',
    status: 'draft',
    content: 'محتوى المقال هنا...',
    excerpt: 'تحليل لمشاركة المرأة في صنع القرار السياسي وتأثيرها على السياسات العامة',
    categories: ['سياسات عامة', 'دراسات المرأة'],
    tags: ['تمكين المرأة', 'مشاركة سياسية', 'صنع القرار'],
    createdAt: '2023-05-05',
    updatedAt: '2023-05-05',
    publishedAt: null,
    viewCount: 0,
    featured: false,
    image: null
  }
];

const initialCategories = [
  { id: '1', name: 'العلاقات الدولية', slug: 'international-relations', count: 5 },
  { id: '2', name: 'الشرق الأوسط', slug: 'middle-east', count: 7 },
  { id: '3', name: 'اقتصاد سياسي', slug: 'political-economy', count: 3 },
  { id: '4', name: 'تنمية مستدامة', slug: 'sustainable-development', count: 2 },
  { id: '5', name: 'سياسات عامة', slug: 'public-policy', count: 8 },
  { id: '6', name: 'دراسات المرأة', slug: 'women-studies', count: 4 },
];

const initialTags = [
  { id: '1', name: 'دبلوماسية', slug: 'diplomacy', count: 3 },
  { id: '2', name: 'سياسة خارجية', slug: 'foreign-policy', count: 5 },
  { id: '3', name: 'أمن إقليمي', slug: 'regional-security', count: 4 },
  { id: '4', name: 'اقتصاد', slug: 'economics', count: 6 },
  { id: '5', name: 'تنمية', slug: 'development', count: 3 },
  { id: '6', name: 'استدامة', slug: 'sustainability', count: 2 },
  { id: '7', name: 'تمكين المرأة', slug: 'women-empowerment', count: 3 },
];

// Initialize storage if empty
const initializeStorage = () => {
  if (!localStorageService.getItem(CONTENT_STORAGE_KEY)) {
    localStorageService.setItem(CONTENT_STORAGE_KEY, initialContents);
  }
  
  if (!localStorageService.getItem(CONTENT_CATEGORIES_KEY)) {
    localStorageService.setItem(CONTENT_CATEGORIES_KEY, initialCategories);
  }
  
  if (!localStorageService.getItem(CONTENT_TAGS_KEY)) {
    localStorageService.setItem(CONTENT_TAGS_KEY, initialTags);
  }
};

// Content CRUD operations
const contentService = {
  // Get all contents
  getAll: async () => {
    initializeStorage();
    return Promise.resolve(localStorageService.getItem(CONTENT_STORAGE_KEY));
  },

  // Alias for getAll to maintain compatibility with enhancedContentService
  getContents: async (params = {}) => {
    initializeStorage();
    const contents = localStorageService.getItem(CONTENT_STORAGE_KEY);

    // Add metadata to indicate legacy service was used
    return Promise.resolve({
      data: contents,
      metadata: { service: 'legacy' },
      success: true
    });
  },
  
  // Get content by ID
  getById: async (id) => {
    initializeStorage();
    const contents = localStorageService.getItem(CONTENT_STORAGE_KEY);
    const content = contents.find(c => c.id === id);
    
    if (!content) {
      return Promise.reject(new Error('Content not found'));
    }
    
    return Promise.resolve(content);
  },
  
  // Search and filter contents
  search: async (params = {}) => {
    initializeStorage();
    let contents = localStorageService.getItem(CONTENT_STORAGE_KEY);
    
    // Apply filters
    if (params.query) {
      const query = params.query.toLowerCase();
      contents = contents.filter(content => 
        content.title.toLowerCase().includes(query) || 
        content.excerpt.toLowerCase().includes(query) ||
        content.author.toLowerCase().includes(query)
      );
    }
    
    if (params.type) {
      contents = contents.filter(content => content.type === params.type);
    }
    
    if (params.status) {
      contents = contents.filter(content => content.status === params.status);
    }
    
    if (params.category) {
      contents = contents.filter(content => 
        content.categories.includes(params.category)
      );
    }
    
    if (params.tag) {
      // Handle both single tag and multiple tags separated by comma
      if (params.tag.includes(',')) {
        const tagArray = params.tag.split(',');
        contents = contents.filter(content => 
          tagArray.some(tag => content.tags.includes(tag))
        );
      } else {
        contents = contents.filter(content => 
          content.tags.includes(params.tag)
        );
      }
    }
    
    if (params.featured === true) {
      contents = contents.filter(content => content.featured === true);
    }
    
    // Date range filtering
    if (params.dateFrom) {
      const fromDate = new Date(params.dateFrom);
      contents = contents.filter(content => {
        const createdAt = new Date(content.createdAt);
        return createdAt >= fromDate;
      });
    }
    
    if (params.dateTo) {
      const toDate = new Date(params.dateTo);
      // Set time to end of day
      toDate.setHours(23, 59, 59, 999);
      contents = contents.filter(content => {
        const createdAt = new Date(content.createdAt);
        return createdAt <= toDate;
      });
    }
    
    // Sorting
    const sortBy = params.sortBy || 'createdAt';
    const sortOrder = params.sortOrder || 'desc';
    
    contents.sort((a, b) => {
      let valueA = a[sortBy];
      let valueB = b[sortBy];
      
      // Handle dates
      if (['createdAt', 'updatedAt', 'publishedAt'].includes(sortBy)) {
        valueA = valueA ? new Date(valueA).getTime() : 0;
        valueB = valueB ? new Date(valueB).getTime() : 0;
      }
      
      // Handle string fields
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        if (sortOrder === 'asc') {
          return valueA.localeCompare(valueB);
        } else {
          return valueB.localeCompare(valueA);
        }
      }
      
      // Handle numbers and dates
      if (sortOrder === 'asc') {
        return valueA - valueB;
      } else {
        return valueB - valueA;
      }
    });
    
    return Promise.resolve(contents);
  },
  
  // Create new content
  create: async (contentData) => {
    initializeStorage();
    const contents = localStorageService.getItem(CONTENT_STORAGE_KEY);
    
    // Generate a unique ID
    const newId = String(Math.max(0, ...contents.map(c => parseInt(c.id))) + 1);
    
    const newContent = {
      id: newId,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      publishedAt: contentData.status === 'published' ? new Date().toISOString().split('T')[0] : null,
      viewCount: 0,
      ...contentData
    };
    
    contents.push(newContent);
    localStorageService.setItem(CONTENT_STORAGE_KEY, contents);
    
    return Promise.resolve(newContent);
  },
  
  // Update existing content
  update: async (id, contentData) => {
    initializeStorage();
    const contents = localStorageService.getItem(CONTENT_STORAGE_KEY);
    const index = contents.findIndex(c => c.id === id);
    
    if (index === -1) {
      return Promise.reject(new Error('Content not found'));
    }
    
    // Check if content is being published
    const wasPublished = contents[index].status === 'published';
    const isBeingPublished = !wasPublished && contentData.status === 'published';
    
    const updatedContent = {
      ...contents[index],
      ...contentData,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    
    // Set published date if content is being published for the first time
    if (isBeingPublished) {
      updatedContent.publishedAt = new Date().toISOString().split('T')[0];
    }
    
    contents[index] = updatedContent;
    localStorageService.setItem(CONTENT_STORAGE_KEY, contents);
    
    return Promise.resolve(updatedContent);
  },
  
  // Delete content
  delete: async (id) => {
    initializeStorage();
    const contents = localStorageService.getItem(CONTENT_STORAGE_KEY);
    const newContents = contents.filter(c => c.id !== id);
    
    if (newContents.length === contents.length) {
      return Promise.reject(new Error('Content not found'));
    }
    
    localStorageService.setItem(CONTENT_STORAGE_KEY, newContents);
    return Promise.resolve({ success: true });
  },
  
  // Toggle featured status
  toggleFeatured: async (id) => {
    initializeStorage();
    const contents = localStorageService.getItem(CONTENT_STORAGE_KEY);
    const index = contents.findIndex(c => c.id === id);
    
    if (index === -1) {
      return Promise.reject(new Error('Content not found'));
    }
    
    contents[index] = {
      ...contents[index],
      featured: !contents[index].featured,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    
    localStorageService.setItem(CONTENT_STORAGE_KEY, contents);
    return Promise.resolve(contents[index]);
  },
  
  // Get all categories
  getCategories: async () => {
    initializeStorage();
    return Promise.resolve(localStorageService.getItem(CONTENT_CATEGORIES_KEY));
  },
  
  // Get all tags
  getTags: async () => {
    initializeStorage();
    return Promise.resolve(localStorageService.getItem(CONTENT_TAGS_KEY));
  }
};

export { contentService };