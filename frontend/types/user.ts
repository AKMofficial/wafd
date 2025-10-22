export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'Admin' | 'Supervisor' | 'Pilgrim';
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'Admin' | 'Supervisor' | 'Pilgrim';
}

export interface UpdateUserDto {
  name: string;
  email: string;
  phone: string;
  password?: string;
  role: 'Admin' | 'Supervisor' | 'Pilgrim';
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UserFilters {
  search?: string;
  role?: string;
  status?: string;
}

export interface UserStatistics {
  totalUsers: number;
  adminCount: number;
  supervisorCount: number;
  pilgrimCount: number;
  activeUsers: number;
  inactiveUsers: number;
}