const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

async function fetchAPI(endpoint: string, options?: RequestInit) {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    credentials: 'include',
    ...options,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `API Error: ${response.statusText}`);
  }

  return response.json();
}

export const agencyAPI = {
  getAll: () => fetchAPI('/agency/get/all'),
  getById: (id: number) => fetchAPI(`/agency/get/${id}`),
  create: (data: any) => fetchAPI('/agency/add', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: number, data: any) => fetchAPI(`/agency/update/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: number) => fetchAPI(`/agency/delete/${id}`, {
    method: 'DELETE',
  }),
};

export const pilgrimAPI = {
  getAll: () => fetchAPI('/pilgrim/get/all'),
  getById: (id: number) => fetchAPI(`/pilgrim/get/${id}`),
  create: (data: any) => fetchAPI('/pilgrim/add', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: number, data: any) => fetchAPI(`/pilgrim/update/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: number) => fetchAPI(`/pilgrim/delete/${id}`, {
    method: 'DELETE',
  }),
  assignToAgency: (pilgrimId: number, agencyId: number) =>
    fetchAPI(`/pilgrim/assign/pilgrim/${pilgrimId}/agency/${agencyId}`, {
      method: 'PUT',
    }),
};

// Backend uses "tent" instead of "building", mapping to tent endpoints
export const buildingAPI = {
  getAll: () => fetchAPI('/tent/get/all'),
  getById: (id: number) => fetchAPI(`/tent/get/${id}`),
  create: (data: any) => fetchAPI('/tent/add', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: number, data: any) => fetchAPI(`/tent/update/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: number) => fetchAPI(`/tent/delete/${id}`, {
    method: 'DELETE',
  }),
};

export const bedAPI = {
  getAll: () => fetchAPI('/bed/get/all'),
  create: (data: any) => fetchAPI('/bed/add', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  delete: (id: number) => fetchAPI(`/bed/delete/${id}`, {
    method: 'DELETE',
  }),
};

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

export const userAPI = {
  getAll: () => fetchAPI('/user/get/all'),
  create: (data: any) => fetchAPI('/user/add', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  delete: (id: number) => fetchAPI(`/user/delete/${id}`, {
    method: 'DELETE',
  }),
};

export const authAPI = {
  login: (email: string, password: string) => fetchAPI('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }),
};