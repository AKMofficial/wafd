import { useState, useEffect } from 'react';

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'Admin' | 'Supervisor';
  agencyId?: number | null;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          setUser(JSON.parse(userStr));
        } catch (error) {
          console.error('Failed to parse user data:', error);
          setUser(null);
        }
      }
    }
  }, []);

  const isAdmin = () => user?.role === 'Admin';
  const isSupervisor = () => user?.role === 'Supervisor';
  const canEdit = () => user?.role === 'Admin';
  const canDelete = () => user?.role === 'Admin';
  const canAddHall = () => user?.role === 'Admin';
  const canEditHall = () => user?.role === 'Admin';
  const canSetMaintenance = () => user?.role === 'Admin';

  return {
    user,
    isAdmin,
    isSupervisor,
    canEdit,
    canDelete,
    canAddHall,
    canEditHall,
    canSetMaintenance,
  };
}
