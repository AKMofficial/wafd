import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pilgrimAPI } from '@/lib/api';
import { transformPilgrimsFromBackend, transformPilgrimFromBackend } from '@/lib/transformers/pilgrim';
import { CreatePilgrimDto, UpdatePilgrimDto, Pilgrim, PilgrimFilters } from '@/types/pilgrim';
import { useToast } from '@/components/ui/toast';

// Query keys factory
export const pilgrimKeys = {
  all: ['pilgrims'] as const,
  lists: () => [...pilgrimKeys.all, 'list'] as const,
  list: (filters: PilgrimFilters) => [...pilgrimKeys.lists(), filters] as const,
  details: () => [...pilgrimKeys.all, 'detail'] as const,
  detail: (id: string) => [...pilgrimKeys.details(), id] as const,
};

// Fetch all pilgrims with caching
export function usePilgrims(params?: {
  filters?: PilgrimFilters;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}) {
  const filters = params?.filters ?? {};
  const page = params?.page ?? 1;
  const size = params?.size ?? 10;
  const sortBy = params?.sortBy ?? 'id';
  const sortDirection = params?.sortDirection ?? 'DESC';

  return useQuery({
    queryKey: [...pilgrimKeys.list(filters), page, size, sortBy, sortDirection],
    queryFn: async () => {
      const response = await pilgrimAPI.getAll({
        page: Math.max(page - 1, 0),
        size,
        sortBy,
        sortDirection,
      });

      const backendContent = Array.isArray(response?.content)
        ? response.content
        : Array.isArray(response)
          ? response
          : [];

      return {
        data: transformPilgrimsFromBackend(backendContent),
        total: Number(response?.totalElements ?? backendContent.length),
        totalPages: Number(response?.totalPages ?? Math.max(1, Math.ceil(backendContent.length / Math.max(size, 1)))),
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}


// Fetch single pilgrim
export function usePilgrim(id: string) {
  return useQuery({
    queryKey: pilgrimKeys.detail(id),
    queryFn: async () => {
      const response = await pilgrimAPI.getById(parseInt(id, 10));
      return response ? transformPilgrimFromBackend(response) : null;
    },
    enabled: !!id,
  });
}

// Create pilgrim mutation with optimistic update
export function useCreatePilgrim() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: async (data: CreatePilgrimDto) => {
      await pilgrimAPI.create(data);
      // Refetch to get the created pilgrim with server-generated ID
      return pilgrimAPI.getAll();
    },
    onMutate: async (newPilgrim) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: pilgrimKeys.lists() });

      // Snapshot the previous value
      const previousPilgrims = queryClient.getQueryData(pilgrimKeys.lists());

      // Optimistically update to the new value
      const tempPilgrim: Pilgrim = {
        id: `temp-${Date.now()}`,
        registrationNumber: 'PENDING',
        nationalId: newPilgrim.nationalId,
        passportNumber: newPilgrim.passportNumber,
        firstName: newPilgrim.firstName,
        lastName: newPilgrim.lastName,
        fullName: `${newPilgrim.firstName} ${newPilgrim.lastName}`,
        birthDate: newPilgrim.birthDate || new Date(),
        age: newPilgrim.age,
        gender: newPilgrim.gender,
        nationality: newPilgrim.nationality,
        phoneNumber: newPilgrim.phoneNumber,
        hasSpecialNeeds: newPilgrim.hasSpecialNeeds || false,
        specialNeedsType: newPilgrim.specialNeedsType,
        specialNeedsNotes: newPilgrim.specialNeedsNotes,
        status: 'expected',
        groupId: newPilgrim.groupId,
        notes: newPilgrim.notes,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      queryClient.setQueryData(pilgrimKeys.lists(), (old: Pilgrim[] | undefined) => {
        return old ? [...old, tempPilgrim] : [tempPilgrim];
      });

      // Return a context with the previous value
      return { previousPilgrims };
    },
    onError: (err, newPilgrim, context) => {
      // If the mutation fails, use the context to roll back
      if (context?.previousPilgrims) {
        queryClient.setQueryData(pilgrimKeys.lists(), context.previousPilgrims);
      }
      addToast({
        title: 'Error',
        description: 'Failed to create pilgrim',
        variant: 'error',
      });
    },
    onSuccess: (data) => {
      // Refetch to sync with server
      queryClient.invalidateQueries({ queryKey: pilgrimKeys.lists() });
      addToast({
        title: 'Success',
        description: 'Pilgrim created successfully',
        variant: 'success',
      });
    },
  });
}

// Update pilgrim mutation
export function useUpdatePilgrim() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdatePilgrimDto }) => {
      await pilgrimAPI.update(parseInt(id, 10), data);
      return pilgrimAPI.getById(parseInt(id, 10));
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: pilgrimKeys.detail(id) });

      const previousPilgrim = queryClient.getQueryData(pilgrimKeys.detail(id));

      queryClient.setQueryData(pilgrimKeys.detail(id), (old: Pilgrim | undefined) => {
        if (!old) return old;
        return { ...old, ...data };
      });

      return { previousPilgrim };
    },
    onError: (err, variables, context) => {
      if (context?.previousPilgrim) {
        queryClient.setQueryData(pilgrimKeys.detail(variables.id), context.previousPilgrim);
      }
      addToast({
        title: 'Error',
        description: 'Failed to update pilgrim',
        variant: 'error',
      });
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: pilgrimKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: pilgrimKeys.lists() });
      addToast({
        title: 'Success',
        description: 'Pilgrim updated successfully',
        variant: 'success',
      });
    },
  });
}

// Delete pilgrim mutation
export function useDeletePilgrim() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      return pilgrimAPI.delete(parseInt(id, 10));
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: pilgrimKeys.lists() });

      const previousPilgrims = queryClient.getQueryData(pilgrimKeys.lists());

      queryClient.setQueryData(pilgrimKeys.lists(), (old: Pilgrim[] | undefined) => {
        return old ? old.filter((p) => p.id !== id) : [];
      });

      return { previousPilgrims };
    },
    onError: (err, id, context) => {
      if (context?.previousPilgrims) {
        queryClient.setQueryData(pilgrimKeys.lists(), context.previousPilgrims);
      }
      addToast({
        title: 'Error',
        description: 'Failed to delete pilgrim',
        variant: 'error',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pilgrimKeys.lists() });
      addToast({
        title: 'Success',
        description: 'Pilgrim deleted successfully',
        variant: 'success',
      });
    },
  });
}