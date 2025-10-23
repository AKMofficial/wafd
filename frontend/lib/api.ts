import { transformPilgrimToBackend } from './transformers/pilgrim';
import { transformHallToBackend } from './transformers/hall';

type QueryParams = Record<string, string | number | boolean | undefined>;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

const buildQueryString = (params?: QueryParams): string => {
  if (!params) return '';
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    searchParams.append(key, String(value));
  });
  const query = searchParams.toString();
  return query ? `?${query}` : '';
};

interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

interface ApiRequestOptions extends RequestInit {
  skipAuthHandling?: boolean;
}

async function fetchAPI(endpoint: string, options?: ApiRequestOptions) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  const { skipAuthHandling, ...fetchOptions } = options ?? {};

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...fetchOptions.headers,
    },
    credentials: 'include',
    ...fetchOptions,
  });

  if (response.status === 401) {
    const isLoginRequest = endpoint === '/auth/login';
    if (skipAuthHandling || isLoginRequest) {
      let errorMessage = 'Unauthorized';
      try {
        const error: ApiError = await response.json();
        errorMessage = error.message || errorMessage;
      } catch {
        // swallow parsing errors, keep default message
      }
      throw new Error(errorMessage);
    }

    const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
    if (refreshToken) {
      const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', data.accessToken);
        }

        const retryResponse = await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${data.accessToken}`,
            ...fetchOptions.headers,
          },
          credentials: 'include',
          ...fetchOptions,
        });

        if (!retryResponse.ok) {
          let errorMessage = `API Error: ${retryResponse.statusText}`;
          try {
            const error: ApiError = await retryResponse.json();
            errorMessage = error.message || errorMessage;
          } catch {
            // If JSON parsing fails, use status text
          }
          throw new Error(errorMessage);
        }

        const retryText = await retryResponse.text();
        if (!retryText) return null;
        try {
          return JSON.parse(retryText);
        } catch {
          return retryText;
        }
      }
    }

    if (typeof window !== 'undefined') {
      window.location.href = '/ar/login';
    }
    throw new Error('Session expired');
  }

  if (!response.ok) {
    let errorMessage = `API Error: ${response.statusText}`;
    try {
      const error: ApiError = await response.json();
      errorMessage = error.message || errorMessage;
    } catch {
      // If JSON parsing fails, use status text
    }
    throw new Error(errorMessage);
  }

  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

type GroupPayload = {
  name: string;
  code?: string;
  country?: string;
  status?: string;
  maxPilgrim?: number;
  notes?: string;
  managerName: string;
  managerEmail: string;
  managerPhone: string;
  managerPassword?: string;
};

// Group API (backed by /api/v1/agency endpoints)
export const groupAPI = {
  getAll: () => fetchAPI('/agency/get/all'),
  getById: (id: number) => fetchAPI(`/agency/get/${id}`),
  create: (data: GroupPayload) => fetchAPI('/agency/add', {
    method: 'POST',
    body: JSON.stringify({
      ...data,
      country: data.country ?? 'SA',
      status: data.status ?? 'Registered',
      maxPilgrim: data.maxPilgrim,
    }),
  }),
  update: (id: number, data: GroupPayload) => fetchAPI(`/agency/update/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: number) => fetchAPI(`/agency/delete/${id}`, {
    method: 'DELETE',
  }),
  getPilgrims: (id: number) => fetchAPI(`/agency/get/${id}/pilgrims`),
};


// Pilgrim API (matches backend /api/v1/pilgrim endpoints)
export const pilgrimAPI = {
  getAll: (params?: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: 'ASC' | 'DESC';
  }) => {
    const query = buildQueryString(params);
    return fetchAPI(`/pilgrim/get/all${query}`);
  },
  getById: (id: number) => fetchAPI(`/pilgrim/get/${id}`),
  create: (data: unknown) => fetchAPI('/pilgrim/add', {
    method: 'POST',
    body: JSON.stringify(transformPilgrimToBackend(data as Partial<any>)),
  }),
  update: (id: number, data: unknown) => fetchAPI(`/pilgrim/update/${id}`, {
    method: 'PUT',
    body: JSON.stringify(transformPilgrimToBackend(data as Partial<any>)),
  }),
  delete: (id: number) => fetchAPI(`/pilgrim/delete/${id}`, {
    method: 'DELETE',
  }),
  assignToGroup: (pilgrimId: number, groupId: number) =>
    fetchAPI(`/pilgrim/assign/pilgrim/${pilgrimId}/group/${groupId}`, {
      method: 'PUT',
    }),
  getStats: () => fetchAPI('/pilgrim/stats'),
};

// Building/Hall API (maps to backend tent endpoints)
export const buildingAPI = {
  getAll: () => fetchAPI('/tent/get/all'),
  getById: (id: number) => fetchAPI(`/tent/get/${id}`),
  create: (data: unknown) => fetchAPI('/tent/add', {
    method: 'POST',
    body: JSON.stringify(transformHallToBackend(data as Partial<any>)),
  }),
  update: (id: number, data: unknown) => fetchAPI(`/tent/update/${id}`, {
    method: 'PUT',
    body: JSON.stringify(transformHallToBackend(data as Partial<any>)),
  }),
  delete: (id: number) => fetchAPI(`/tent/delete/${id}`, {
    method: 'DELETE',
  }),
};

// Hall API (alias for building API with better naming)
export const hallAPI = buildingAPI;

// Bed API (for bed operations)
export const bedAPI = {
  getAll: () => fetchAPI('/bed/get/all'),
  assignBed: (pilgrimId: number, bedId: number) => fetchAPI('/bed/assign', {
    method: 'POST',
    body: JSON.stringify({ pilgrimId, bedId }),
  }),
  vacateBed: (bedId: number) => fetchAPI(`/bed/vacate/${bedId}`, {
    method: 'PUT',
  }),
  updateBedStatus: (bedId: number, status: string) => fetchAPI(`/bed/status/${bedId}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  }),
};

// Booking API
export const bookingAPI = {
  getAll: () => fetchAPI('/booking/get/all'),
  create: (userEmail: string, data: any) => fetchAPI(`/booking/add/${userEmail}`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateBed: (bedId: number, userEmail: string) => fetchAPI(`/booking/update-bed/${bedId}/${userEmail}`, {
    method: 'PUT',
  }),
  delete: (id: number) => fetchAPI(`/booking/delete/${id}`, {
    method: 'DELETE',
  }),
};

// User API (matches backend /api/v1/user endpoints)
export const userAPI = {
  getAll: () => fetchAPI('/user/get/all'),
  getById: (id: string) => fetchAPI(`/user/get/${id}`),
  create: (data: unknown) => fetchAPI('/user/add', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: unknown) => fetchAPI(`/user/update/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => fetchAPI(`/user/delete/${id}`, {
    method: 'DELETE',
  }),
  changePassword: (id: string, data: unknown) => fetchAPI(`/user/change-password/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
};

// Auth API
export const authAPI = {
  login: (email: string, password: string) => fetchAPI('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }),
};
