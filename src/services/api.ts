const API_BASE_URL = 'http://3.7.46.178/simple/api/v1';

// Token management
let authToken: string | null = localStorage.getItem('auth_token');

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
};

export const getAuthToken = () => authToken;

const getHeaders = (includeAuth = true): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (includeAuth && authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  return headers;
};

// Response handler
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// ============= AUTH API =============
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  refreshToken?: string;
  user: User;
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify(credentials),
    });
    const data = await handleResponse<AuthResponse>(response);
    if (data.token) {
      setAuthToken(data.token);
    }
    return data;
  },

  getProfile: async (): Promise<{ success: boolean; user: User }> => {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    return handleResponse(response);
  },

  logout: () => {
    setAuthToken(null);
  },
};

// ============= CATEGORY API =============
export interface ApiCategory {
  _id: string;
  name: string;
  displayName: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  parentCategory?: string | null;
  level: number;
  order: number;
  isActive: boolean;
  meta?: Record<string, string>;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryInput {
  name: string;
  displayName: string;
  description?: string;
  image?: string;
  icon?: string;
  parentCategory?: string | null;
  level?: number;
  order?: number;
  isActive?: boolean;
}

export const categoryApi = {
  getAll: async (): Promise<{ success: boolean; data: ApiCategory[]; count: number }> => {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'GET',
      headers: getHeaders(false),
    });
    return handleResponse(response);
  },

  getById: async (id: string): Promise<{ success: boolean; data: ApiCategory }> => {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  create: async (category: CategoryInput): Promise<{ success: boolean; data: ApiCategory }> => {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(category),
    });
    return handleResponse(response);
  },

  update: async (id: string, category: Partial<CategoryInput>): Promise<{ success: boolean; data: ApiCategory }> => {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(category),
    });
    return handleResponse(response);
  },

  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
};

// ============= PRODUCT API =============
export interface ApiProductVariant {
  color: string;
  colorCode?: string;
  stock: number;
  images: string[];
  sku?: string;
  isAvailable: boolean;
}

export interface ApiProduct {
  _id: string;
  name: string;
  description: string;
  mrp: number;
  price: number;
  discountPercent: number;
  category: string | ApiCategory;
  brand?: string;
  images: string[];
  variants: ApiProductVariant[];
  specifications: Record<string, string>;
  tags: string[];
  isActive: boolean;
  user: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductInput {
  name: string;
  description: string;
  mrp: number;
  price: number;
  discountPercent?: number;
  category: string;
  brand?: string;
  images: string[];
  variants: ApiProductVariant[];
  specifications?: Record<string, string>;
  tags?: string[];
  isActive?: boolean;
}

export const productApi = {
  getAll: async (params?: { category?: string; search?: string; isActive?: boolean }): Promise<{ success: boolean; data: ApiProduct[]; count: number }> => {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.append('category', params.category);
    if (params?.search) searchParams.append('search', params.search);
    if (params?.isActive !== undefined) searchParams.append('isActive', String(params.isActive));
    
    const url = `${API_BASE_URL}/products${searchParams.toString() ? `?${searchParams}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(false),
    });
    return handleResponse(response);
  },

  getById: async (id: string): Promise<{ success: boolean; data: ApiProduct }> => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'GET',
      headers: getHeaders(false),
    });
    return handleResponse(response);
  },

  create: async (product: ProductInput): Promise<{ success: boolean; data: ApiProduct }> => {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(product),
    });
    return handleResponse(response);
  },

  update: async (id: string, product: Partial<ProductInput>): Promise<{ success: boolean; data: ApiProduct }> => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(product),
    });
    return handleResponse(response);
  },

  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
};
