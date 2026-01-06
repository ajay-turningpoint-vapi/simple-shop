// const API_BASE_URL = 'http://3.7.46.178/simple/api/v1';
const API_BASE_URL = 'http://localhost:5023/api/v1';

// Token management
let authToken: string | null = null;

// Initialize token from localStorage on module load
if (typeof window !== 'undefined') {
  authToken = localStorage.getItem('auth_token');
}

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
};

// Always read from localStorage to ensure we have the latest token
// This is important after page refreshes
export const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('auth_token');
    if (stored !== authToken) {
      authToken = stored;
    }
  }
  return authToken;
};

const getHeaders = (includeAuth = true): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (includeAuth) {
    const token = getAuthToken(); // Always get fresh token from localStorage
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
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
    // Be permissive about response shape as APIs may nest token/user under data
    const data = await handleResponse<any>(response);
    const token = data?.token || data?.data?.token || data?.accessToken || data?.data?.accessToken || data?.authToken || data?.data?.authToken;
    const refreshToken = data?.refreshToken || data?.data?.refreshToken;
    const user = data?.user || data?.data?.user;

    if (token) {
      setAuthToken(token);
    }

    return {
      success: data?.success ?? true,
      token,
      refreshToken,
      user,
    } as AuthResponse;
  },

  getProfile: async (): Promise<{ success: boolean; user: User }> => {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'GET',
      headers: getHeaders(),
    });
    // Store status code for error handling
    if (!response.ok) {
      const error: any = await response.json().catch(() => ({ message: 'Request failed' }));
      error.status = response.status;
      throw error;
    }
    // Be permissive about response shape as APIs may nest user under data
    const data = await response.json();
    const user = data?.user || data?.data?.user;
    const success = data?.success ?? true;
    
    return {
      success,
      user,
    } as { success: boolean; user: User };
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
  image?: string | {
    detail?: { filename?: string; url?: string; reused?: boolean };
    thumb?: { filename?: string; url?: string; reused?: boolean };
    filename?: string;
    alt?: string;
    uploadedAt?: string;
  };
  icon?: string;
  parentCategory?: string | null | {
    _id: string;
    name: string;
    displayName: string;
    id?: string;
  };
  level: number;
  order: number;
  isActive: boolean;
  meta?: Record<string, string>;
  productCount: number;
  createdAt: string;
  updatedAt: string;
  subcategories?: ApiCategory[];
}

export interface CategoryInput {
  name: string;
  displayName: string;
  description?: string;
  image?: string | {
    detail?: { filename?: string; url?: string; reused?: boolean };
    thumb?: { filename?: string; url?: string; reused?: boolean };
    filename?: string;
    alt?: string;
    uploadedAt?: string;
  };
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

// ============= UPLOADS API =============
export interface UploadResponseItem {
  ok: boolean;
  originalName?: string;
  filename?: string;
  detail?: { filename?: string; url?: string; reused?: boolean };
  thumb?: { filename?: string; url?: string; reused?: boolean };
  url?: string; // legacy support
}

export const uploadApi = {
  /**
   * Upload one or more files to the upload service.
   * Returns an array of objects with `detailUrl` and `thumbUrl` when available.
   */
  uploadFiles: async (
    files: FileList | File[]
  ): Promise<Array<{ detailUrl?: string; thumbUrl?: string; filename?: string; originalName?: string; reused?: boolean }>> => {
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append('images', file));

    // Build headers but do NOT set Content-Type when sending FormData
    const headers: HeadersInit = {};
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

    // Use the same API base URL as the rest of the backend
    const response = await fetch(`${API_BASE_URL}/uploads`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const err = await response.text().catch(() => response.statusText);
      throw new Error(err || `Upload failed: ${response.status}`);
    }

    const data = await response.json().catch(() => ({}));
    const results: UploadResponseItem[] = Array.isArray(data?.results) ? data.results : [];

    return results.map((r) => ({
      detailUrl: r?.detail?.url || r?.url,
      thumbUrl: r?.thumb?.url || null,
      filename: r?.detail?.filename || r?.thumb?.filename || r?.filename || undefined,
      originalName: r?.originalName,
      reused: r?.detail?.reused || r?.thumb?.reused || false,
    }));
  },
};

// ============= PRODUCT API =============
export interface ApiImage {
  filename?: string;
  detail?: { filename?: string; url?: string };
  thumb?: { filename?: string; url?: string };
  alt?: string;
  isPrimary?: boolean;
  uploadedAt?: string;
}

export interface ApiProductVariant {
  color: string;
  colorCode?: string;
  stock: number;
  images: ApiImage[] | string[];
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
  images: ApiImage[] | string[];
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
  images: ApiImage[] | string[];
  variants: ApiProductVariant[];
  specifications?: Record<string, string>;
  tags?: string[];
  isActive?: boolean;
}

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc' | string;
  brand?: string;
  inStock?: boolean;
  color?: string;
  isActive?: boolean;
}

export const productApi = {
  /**
   * Fetch products with support for pagination, filtering and sorting.
   */
  getAll: async (params?: ProductQueryParams): Promise<{ success: boolean; data: ApiProduct[]; count: number }> => {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      brand,
      inStock,
      color,
      isActive,
    } = params || {};

    /* debug log removed */




    const searchParams = new URLSearchParams();
    if (page !== undefined) searchParams.append('page', String(page));
    if (limit !== undefined) searchParams.append('limit', String(limit));
    if (search) searchParams.append('search', search);
    if (category) searchParams.append('category', category);
    if (minPrice !== undefined) searchParams.append('minPrice', String(minPrice));
    if (maxPrice !== undefined) searchParams.append('maxPrice', String(maxPrice));
    if (sortBy) searchParams.append('sortBy', sortBy);
    if (sortOrder) searchParams.append('sortOrder', sortOrder);
    if (brand) searchParams.append('brand', brand);
    if (inStock !== undefined) searchParams.append('inStock', String(inStock));
    if (color) searchParams.append('color', color);
    if (isActive !== undefined) searchParams.append('isActive', String(isActive));

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
    const body = await handleResponse(response);
    return body as { success: boolean; data: ApiProduct };
  },

  update: async (id: string, product: Partial<ProductInput>): Promise<{ success: boolean; data: ApiProduct }> => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(product),
    });
    const body = await handleResponse(response);
    return body as { success: boolean; data: ApiProduct };
  },

  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const body = await handleResponse(response);
    return body as { success: boolean; message: string };
  },
};
