import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  User,
  CreateUserDto,
  UpdateUserDto,
  ChangePasswordDto,
  UserFilters,
  UserStatistics,
} from '@/types/user';
import { userAPI } from '@/lib/api';

interface SettingsState {
  users: User[];
  selectedUser: User | null;
  currentUser: User | null;
  filters: UserFilters;
  isLoading: boolean;
  error: string | null;
  stats: UserStatistics;

  setUsers: (users: User[]) => void;
  setSelectedUser: (user: User | null) => void;
  setCurrentUser: (user: User | null) => void;
  setFilters: (filters: UserFilters) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;

  fetchUsers: () => Promise<User[]>;
  fetchUserById: (id: string) => Promise<User | null>;
  createUser: (data: CreateUserDto) => Promise<User>;
  updateUser: (id: string, data: UpdateUserDto) => Promise<User>;
  deleteUser: (id: string) => Promise<boolean>;
  changePassword: (id: string, data: ChangePasswordDto) => Promise<boolean>;
  getStatistics: () => UserStatistics;
  resetFilters: () => void;
}

const initialFilters: UserFilters = {
  search: '',
  role: '',
  status: '',
};

export const useSettingsStore = create<SettingsState>()(
  devtools(
    (set, get) => ({
      users: [],
      selectedUser: null,
      currentUser: null,
      filters: initialFilters,
      isLoading: false,
      error: null,
      stats: {
        totalUsers: 0,
        adminCount: 0,
        supervisorCount: 0,
        pilgrimCount: 0,
        activeUsers: 0,
        inactiveUsers: 0,
      },

      setUsers: (users) => set({ users }),
      setSelectedUser: (user) => set({ selectedUser: user }),
      setCurrentUser: (user) => set({ currentUser: user }),
      setFilters: (filters) => set({ filters }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      fetchUsers: async () => {
        const { setLoading, setError, setUsers } = get();
        setLoading(true);
        setError(null);

        try {
          const users = await userAPI.getAll();
          setUsers(users);
          return users;
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Failed to fetch users');
          throw error;
        } finally {
          setLoading(false);
        }
      },

      fetchUserById: async (id: string) => {
        const { setLoading, setError, setSelectedUser } = get();
        setLoading(true);
        setError(null);

        try {
          const user = await userAPI.getById(id);
          setSelectedUser(user);
          return user;
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Failed to fetch user');
          return null;
        } finally {
          setLoading(false);
        }
      },

      createUser: async (data: CreateUserDto) => {
        const { setLoading, setError, fetchUsers } = get();
        setLoading(true);
        setError(null);

        try {
          const newUser = await userAPI.create(data);
          await fetchUsers();
          return newUser;
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Failed to create user');
          throw error;
        } finally {
          setLoading(false);
        }
      },

      updateUser: async (id: string, data: UpdateUserDto) => {
        const { setLoading, setError, fetchUsers } = get();
        setLoading(true);
        setError(null);

        try {
          const updatedUser = await userAPI.update(id, data);
          await fetchUsers();
          return updatedUser;
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Failed to update user');
          throw error;
        } finally {
          setLoading(false);
        }
      },

      deleteUser: async (id: string) => {
        const { setLoading, setError, fetchUsers } = get();
        setLoading(true);
        setError(null);

        try {
          await userAPI.delete(id);
          await fetchUsers();
          return true;
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Failed to delete user');
          return false;
        } finally {
          setLoading(false);
        }
      },

      changePassword: async (id: string, data: ChangePasswordDto) => {
        const { setLoading, setError } = get();
        setLoading(true);
        setError(null);

        try {
          await userAPI.changePassword(id, data);
          return true;
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Failed to change password');
          return false;
        } finally {
          setLoading(false);
        }
      },

      getStatistics: () => {
        const { users } = get();
        return {
          totalUsers: users.length,
          adminCount: users.filter(u => u.role === 'Admin').length,
          supervisorCount: users.filter(u => u.role === 'Supervisor').length,
          pilgrimCount: users.filter(u => u.role === 'Pilgrim').length,
          activeUsers: users.length, // Assuming all users are active for now
          inactiveUsers: 0,
        };
      },

      resetFilters: () => set({ filters: initialFilters }),
    }),
    {
      name: 'settings-store',
    }
  )
);