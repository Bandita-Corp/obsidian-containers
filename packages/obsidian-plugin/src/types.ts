import { ContainerSummaryDto } from '@workspace/shared';

export interface WorkspaceSyncPluginSettings {
  serverUrl: string;
  activeContainerId: string;
  containers: ContainerSummaryDto[];
  autoSyncIntervalMinutes: number;
  enableAutoSyncOnStartup: boolean;
  lastSyncedCommit: string;
  autoParseTags: boolean;
  showDiffPreview: boolean;
  selectedTagFilter: string | null;
}

export const DEFAULT_SETTINGS: WorkspaceSyncPluginSettings = {
  serverUrl: 'http://localhost:3000',
  activeContainerId: 'main-git-vault',
  containers: [],
  autoSyncIntervalMinutes: 5,
  enableAutoSyncOnStartup: true,
  lastSyncedCommit: '',
  autoParseTags: true,
  showDiffPreview: true,
  selectedTagFilter: null,
};
