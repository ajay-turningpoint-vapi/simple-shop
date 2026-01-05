import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Extract array from various possible API response shapes
export function extractArrayFromResponse(response: any): any[] {
  const d = response?.data;
  if (Array.isArray(d)) return d;

  const keysToCheck = ['docs', 'items', 'results', 'products', 'categories', 'list', 'rows', 'payload', 'records', 'data'];
  for (const key of keysToCheck) {
    if (d && Array.isArray(d[key])) {
      console.warn(`Using array from response.data.${key}`);
      return d[key];
    }
  }

  if (d && typeof d === 'object') {
    for (const val of Object.values(d)) {
      if (Array.isArray(val)) {
        console.warn('Using first array found inside response.data');
        return val as any[];
      }
    }
  }

  // also check top-level array fields on response
  for (const key of keysToCheck) {
    if (Array.isArray(response?.[key])) {
      console.warn(`Using array from response.${key}`);
      return response[key];
    }
  }

  return [];
}

/**
 * Get a primary image URL from the images array. Returns the first non-empty image or a fallback.
 */
export function getPrimaryImage(images?: any[], fallback = '/placeholder.svg') {
  if (!images || !Array.isArray(images)) return fallback;
  // support both string arrays and ImageItem arrays
  const first = images.find((i) => !!(typeof i === 'string' ? i : (i?.detail?.url || i?.thumb?.url)));
  if (!first) return fallback;
  if (typeof first === 'string') return first;
  return first.detail?.url || first.thumb?.url || fallback;
}

export function getImageUrl(image?: any, fallback = '/placeholder.svg') {
  if (!image) return fallback;
  if (typeof image === 'string') return image;
  return image.detail?.url || image.thumb?.url || fallback;
}

