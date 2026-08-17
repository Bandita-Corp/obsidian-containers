import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import { RegisterContainerRequestDto } from '@workspace/shared';

export const CONTAINER_KEYS = {
  all: ['containers'] as const,
  lists: () => [...CONTAINER_KEYS.all, 'list'] as const,
  detail: (id: string) => [...CONTAINER_KEYS.all, 'detail', id] as const,
  tree: (id: string) => [...CONTAINER_KEYS.all, 'tree', id] as const,
  files: (id: string) => [...CONTAINER_KEYS.all, 'files', id] as const,
  file: (id: string, path: string) => [...CONTAINER_KEYS.all, 'file', id, path] as const,
  status: (id: string) => [...CONTAINER_KEYS.all, 'status', id] as const,
};

export function useContainersList() {
  return useQuery({
    queryKey: CONTAINER_KEYS.lists(),
    queryFn: () => api.listContainers(),
    refetchInterval: 15000,
  });
}

export function useContainerSummary(id: string | null) {
  return useQuery({
    queryKey: id ? CONTAINER_KEYS.detail(id) : ['null'],
    queryFn: () => (id ? api.getContainer(id) : Promise.reject('No ID')),
    enabled: !!id,
  });
}

export function useContainerTree(id: string | null) {
  return useQuery({
    queryKey: id ? CONTAINER_KEYS.tree(id) : ['null'],
    queryFn: () => (id ? api.getTree(id) : Promise.reject('No ID')),
    enabled: !!id,
  });
}

export function useContainerFile(id: string | null, filePath: string | null) {
  return useQuery({
    queryKey: id && filePath ? CONTAINER_KEYS.file(id, filePath) : ['null'],
    queryFn: () => (id && filePath ? api.readFile(id, filePath) : Promise.reject('No file')),
    enabled: !!id && !!filePath,
  });
}

export function useSaveFile(containerId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ path, content }: { path: string; content: string }) => {
      if (!containerId) throw new Error('No container selected');
      return api.writeFile(containerId, path, content);
    },
    onSuccess: (_, variables) => {
      if (containerId) {
        queryClient.invalidateQueries({ queryKey: CONTAINER_KEYS.file(containerId, variables.path) });
        queryClient.invalidateQueries({ queryKey: CONTAINER_KEYS.tree(containerId) });
        queryClient.invalidateQueries({ queryKey: CONTAINER_KEYS.detail(containerId) });
      }
    },
  });
}

export function useDeleteFile(containerId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (filePath: string) => {
      if (!containerId) throw new Error('No container selected');
      return api.deleteFile(containerId, filePath);
    },
    onSuccess: () => {
      if (containerId) {
        queryClient.invalidateQueries({ queryKey: CONTAINER_KEYS.tree(containerId) });
        queryClient.invalidateQueries({ queryKey: CONTAINER_KEYS.detail(containerId) });
      }
    },
  });
}

export function useRegisterContainer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterContainerRequestDto) => api.registerContainer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTAINER_KEYS.lists() });
    },
  });
}

export function useDeleteContainer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.deleteContainer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTAINER_KEYS.lists() });
    },
  });
}
