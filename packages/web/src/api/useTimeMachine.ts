import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import { RestoreFileVersionRequestDto } from '@workspace/shared';
import { CONTAINER_KEYS } from './useContainers';

export const TIME_MACHINE_KEYS = {
  commits: (containerId: string) => ['timemachine', containerId, 'commits'] as const,
  commitDetail: (containerId: string, commitHash: string) =>
    ['timemachine', containerId, 'commit', commitHash] as const,
  fileHistory: (containerId: string, filePath: string) =>
    ['timemachine', containerId, 'fileHistory', filePath] as const,
  fileVersion: (containerId: string, filePath: string, commitHash: string) =>
    ['timemachine', containerId, 'fileVersion', filePath, commitHash] as const,
};

export function useContainerCommits(containerId: string | null, limit = 50) {
  return useQuery({
    queryKey: containerId ? TIME_MACHINE_KEYS.commits(containerId) : ['null'],
    queryFn: () => (containerId ? api.getCommits(containerId, limit) : Promise.reject('No ID')),
    enabled: !!containerId,
  });
}

export function useCommitDetail(containerId: string | null, commitHash: string | null) {
  return useQuery({
    queryKey:
      containerId && commitHash
        ? TIME_MACHINE_KEYS.commitDetail(containerId, commitHash)
        : ['null'],
    queryFn: () =>
      containerId && commitHash
        ? api.getCommitDetail(containerId, commitHash)
        : Promise.reject('No commit specified'),
    enabled: !!containerId && !!commitHash,
  });
}

export function useFileHistory(containerId: string | null, filePath: string | null) {
  return useQuery({
    queryKey:
      containerId && filePath
        ? TIME_MACHINE_KEYS.fileHistory(containerId, filePath)
        : ['null'],
    queryFn: () =>
      containerId && filePath
        ? api.getFileHistory(containerId, filePath)
        : Promise.reject('No file specified'),
    enabled: !!containerId && !!filePath,
  });
}

export function useFileVersion(
  containerId: string | null,
  filePath: string | null,
  commitHash: string | null
) {
  return useQuery({
    queryKey:
      containerId && filePath && commitHash
        ? TIME_MACHINE_KEYS.fileVersion(containerId, filePath, commitHash)
        : ['null'],
    queryFn: () =>
      containerId && filePath && commitHash
        ? api.getFileVersion(containerId, filePath, commitHash)
        : Promise.reject('Missing arguments'),
    enabled: !!containerId && !!filePath && !!commitHash,
  });
}

export function useRestoreFileVersion(containerId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RestoreFileVersionRequestDto) => {
      if (!containerId) throw new Error('No container selected');
      return api.restoreFileVersion(containerId, data);
    },
    onSuccess: (_, variables) => {
      if (containerId) {
        queryClient.invalidateQueries({ queryKey: CONTAINER_KEYS.file(containerId, variables.path) });
        queryClient.invalidateQueries({ queryKey: CONTAINER_KEYS.tree(containerId) });
        queryClient.invalidateQueries({ queryKey: TIME_MACHINE_KEYS.commits(containerId) });
        queryClient.invalidateQueries({ queryKey: TIME_MACHINE_KEYS.fileHistory(containerId, variables.path) });
      }
    },
  });
}
