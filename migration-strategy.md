# استراتيجية الترحيل من Supabase إلى البنية التحتية المحلية

## المرحلة الأولى: إعداد البنية التحتية (4-6 أسابيع)

### 1. إعداد AWS السعودية
```bash
# إنشاء VPC آمن
aws ec2 create-vpc --cidr-block 10.0.0.0/16 --region me-south-1

# إعداد RDS PostgreSQL
aws rds create-db-instance \
  --db-instance-identifier spsa-prod-db \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --engine-version 15.4 \
  --allocated-storage 100 \
  --storage-encrypted \
  --vpc-security-group-ids sg-xxxxxxxxx \
  --db-subnet-group-name spsa-db-subnet-group \
  --backup-retention-period 30 \
  --multi-az \
  --region me-south-1
```

### 2. إعداد خادم التطبيق
```yaml
# docker-compose.yml للإنتاج
version: '3.8'
services:
  app:
    build: .
    ports:
      - "443:443"
      - "80:80"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@rds-endpoint:5432/spsa
      - REDIS_URL=redis://elasticache-endpoint:6379
    volumes:
      - ./ssl:/etc/ssl/certs
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl/certs
    depends_on:
      - app
```

### 3. تطوير Backend API
```javascript
// src/backend/server.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Pool } from 'pg';

const app = express();

// إعدادات الأمان
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});
app.use('/api/', limiter);

// CORS للمجالات المحددة فقط
app.use(cors({
  origin: ['https://sapsa.org', 'https://www.sapsa.org'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// اتصال قاعدة البيانات
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Middleware للمصادقة
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    // التحقق من صحة الـ JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// APIs الأساسية
app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, name, role FROM users WHERE id = $1',
      [req.user.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // التحقق من المستخدم
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    
    // التحقق من كلمة المرور (مع bcrypt)
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // إنشاء JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // تسجيل عملية الدخول
    await pool.query(
      'UPDATE users SET last_login_at = NOW() WHERE id = $1',
      [user.id]
    );
    
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## المرحلة الثانية: ترحيل البيانات (2-3 أسابيع)

### 1. تصدير البيانات من Supabase
```javascript
// scripts/export-from-supabase.js
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const exportTable = async (tableName) => {
  console.log(`Exporting ${tableName}...`);
  
  let allData = [];
  let from = 0;
  const batchSize = 1000;
  
  while (true) {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .range(from, from + batchSize - 1);
    
    if (error) {
      console.error(`Error exporting ${tableName}:`, error);
      break;
    }
    
    if (data.length === 0) break;
    
    allData = allData.concat(data);
    from += batchSize;
    
    console.log(`Exported ${allData.length} records from ${tableName}`);
  }
  
  // حفظ البيانات
  fs.writeFileSync(
    `./exports/${tableName}.json`,
    JSON.stringify(allData, null, 2)
  );
  
  console.log(`✅ ${tableName} exported: ${allData.length} records`);
  return allData.length;
};

const exportAllTables = async () => {
  const tables = [
    'users', 'content', 'categories', 'tags', 'events',
    'memberships', 'inquiries', 'media', 'banners',
    'advertisements', 'page_templates'
  ];
  
  for (const table of tables) {
    await exportTable(table);
  }
  
  console.log('🎉 All data exported successfully!');
};

exportAllTables();
```

### 2. استيراد البيانات إلى PostgreSQL المحلي
```javascript
// scripts/import-to-local.js
import { Pool } from 'pg';
import fs from 'fs';

const pool = new Pool({
  connectionString: process.env.LOCAL_DATABASE_URL
});

const importTable = async (tableName) => {
  console.log(`Importing ${tableName}...`);
  
  const data = JSON.parse(
    fs.readFileSync(`./exports/${tableName}.json`, 'utf8')
  );
  
  if (data.length === 0) {
    console.log(`No data to import for ${tableName}`);
    return;
  }
  
  // إنشاء query للإدراج
  const columns = Object.keys(data[0]);
  const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
  const query = `
    INSERT INTO ${tableName} (${columns.join(', ')})
    VALUES (${placeholders})
    ON CONFLICT (id) DO UPDATE SET
    ${columns.map(col => `${col} = EXCLUDED.${col}`).join(', ')}
  `;
  
  let imported = 0;
  for (const row of data) {
    try {
      const values = columns.map(col => row[col]);
      await pool.query(query, values);
      imported++;
    } catch (error) {
      console.error(`Error importing row in ${tableName}:`, error);
    }
  }
  
  console.log(`✅ ${tableName} imported: ${imported}/${data.length} records`);
};

const importAllTables = async () => {
  const tables = [
    'users', 'categories', 'tags', 'content', 'events',
    'memberships', 'inquiries', 'media', 'banners',
    'advertisements', 'page_templates'
  ];
  
  for (const table of tables) {
    await importTable(table);
  }
  
  console.log('🎉 All data imported successfully!');
  await pool.end();
};

importAllTables();
```

## المرحلة الثالثة: تحديث التطبيق (3-4 أسابيع)

### 1. إنشاء خدمة API جديدة
```javascript
// src/services/localApiService.js
class LocalApiService {
  constructor() {
    this.baseURL = process.env.VITE_API_URL || 'https://api.sapsa.org';
    this.token = localStorage.getItem('auth_token');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // المصادقة
  async login(email, password) {
    const response = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.token) {
      this.token = response.token;
      localStorage.setItem('auth_token', response.token);
    }
    
    return response;
  }

  async logout() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  // المستخدمين
  async getUser() {
    return this.request('/api/users');
  }

  async updateUser(userData) {
    return this.request('/api/users', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // المحتوى
  async getContent(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/api/content?${params}`);
  }

  async createContent(contentData) {
    return this.request('/api/content', {
      method: 'POST',
      body: JSON.stringify(contentData),
    });
  }

  async updateContent(id, contentData) {
    return this.request(`/api/content/${id}`, {
      method: 'PUT',
      body: JSON.stringify(contentData),
    });
  }

  async deleteContent(id) {
    return this.request(`/api/content/${id}`, {
      method: 'DELETE',
    });
  }
}

export default new LocalApiService();
```

### 2. تحديث Context للمصادقة
```javascript
// src/context/AuthContext.jsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import localApiService from '../services/localApiService';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        loading: false,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
      };
    case 'LOGIN_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'LOGOUT':
      return { ...state, user: null, token: null, isAuthenticated: false };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    token: localStorage.getItem('auth_token'),
    isAuthenticated: false,
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (state.token) {
      // التحقق من صحة الـ token
      localApiService.getUser()
        .then(user => {
          dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token: state.token } });
        })
        .catch(() => {
          dispatch({ type: 'LOGOUT' });
          localStorage.removeItem('auth_token');
        });
    }
  }, [state.token]);

  const login = async (email, password) => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      const response = await localApiService.login(email, password);
      dispatch({ type: 'LOGIN_SUCCESS', payload: response });
      return response;
    } catch (error) {
      dispatch({ type: 'LOGIN_ERROR', payload: error.message });
      throw error;
    }
  };

  const logout = async () => {
    await localApiService.logout();
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```
