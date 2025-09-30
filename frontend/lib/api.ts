const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

async function fetchAPI(endpoint: string, options?: RequestInit) {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}

export const agencyAPI = {
  getAll: () => fetchAPI('/agencies'),
  getById: (id: number) => fetchAPI(`/agencies/${id}`),
  create: (data: any) => fetchAPI('/agencies', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: number, data: any) => fetchAPI(`/agencies/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: number) => fetchAPI(`/agencies/${id}`, {
    method: 'DELETE',
  }),
};

export const pilgrimAPI = {
  getAll: () => fetchAPI('/pilgrims'),
  getById: (id: number) => fetchAPI(`/pilgrims/${id}`),
  create: (data: any) => fetchAPI('/pilgrims', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: number, data: any) => fetchAPI(`/pilgrims/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: number) => fetchAPI(`/pilgrims/${id}`, {
    method: 'DELETE',
  }),
};

export const buildingAPI = {
  getAll: () => fetchAPI('/buildings'),
  getById: (id: number) => fetchAPI(`/buildings/${id}`),
  create: (data: any) => fetchAPI('/buildings', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: number, data: any) => fetchAPI(`/buildings/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: number) => fetchAPI(`/buildings/${id}`, {
    method: 'DELETE',
  }),
};