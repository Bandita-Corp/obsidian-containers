import React from 'react';
import {
  Box,
  Clock,
  FileText,
  Plus,
  Radio,
  GitBranch,
  ChevronDown,
  RefreshCw,
  FolderGit2,
} from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ContainerSummaryDto } from '@workspace/shared';
import { SSEConnectionStatus } from '../../api/useSyncEvents';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

interface NavbarProps {
  containers: ContainerSummaryDto[];
  activeContainerId: string | null;
  onSelectContainer: (id: string) => void;
  activeView: 'editor' | 'timemachine';
  onSelectView: (view: 'editor' | 'timemachine') => void;
  onOpenNewContainerModal: () => void;
  sseStatus: SSEConnectionStatus;
  isSyncing?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  containers,
  activeContainerId,
  onSelectContainer,
  activeView,
  onSelectView,
  onOpenNewContainerModal,
  sseStatus,
  isSyncing,
}) => {
  const activeContainer = containers.find((c) => c.id === activeContainerId);

  return (
    <header className="bg-bg-surface/80 backdrop-blur-md border-b border-border-subtle sticky top-0 z-40 px-4 py-2.5 flex items-center justify-between gap-4 select-none">
      {/* Brand & Container Selector */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5 cursor-pointer">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 p-0.5 shadow-glow flex items-center justify-center">
            <Box className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-bold text-sm text-white tracking-tight">
              <span>Obsidian</span>
              <span className="text-brand-purple">Containers</span>
            </div>
          </div>
        </div>

        <div className="h-4 w-px bg-border-subtle" />

        {/* Container Dropdown */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-card hover:bg-bg-card-hover border border-border-subtle text-xs font-medium text-gray-200 transition-colors focus:outline-none">
              <FolderGit2 className="w-3.5 h-3.5 text-brand-purple" />
              <span className="max-w-[140px] truncate">
                {activeContainer ? activeContainer.name : 'Select Container...'}
              </span>
              {activeContainer?.isGit && (
                <span className="text-[10px] px-1 py-0.2 bg-purple-500/20 text-purple-300 rounded font-mono">
                  git
                </span>
              )}
              <ChevronDown className="w-3 h-3 text-gray-400 ml-1" />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="z-50 min-w-[220px] bg-bg-surface border border-border-subtle rounded-xl p-1.5 shadow-card animate-fade-in text-xs"
              align="start"
              sideOffset={6}
            >
              <div className="px-2 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Containers ({containers.length})
              </div>
              <div className="max-h-60 overflow-y-auto space-y-0.5">
                {containers.map((c) => (
                  <DropdownMenu.Item
                    key={c.id}
                    onClick={() => onSelectContainer(c.id)}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors focus:outline-none ${
                      c.id === activeContainerId
                        ? 'bg-purple-500/20 text-white font-medium'
                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FolderGit2 className="w-3.5 h-3.5 text-gray-400" />
                      <span className="truncate">{c.name}</span>
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono">
                      {c.isGit ? 'git' : 'simple'}
                    </span>
                  </DropdownMenu.Item>
                ))}
              </div>

              <DropdownMenu.Separator className="h-px bg-border-subtle my-1" />

              <DropdownMenu.Item
                onClick={onOpenNewContainerModal}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer text-brand-purple hover:bg-purple-500/10 transition-colors focus:outline-none font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New Container...</span>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        {/* Quick container metadata */}
        {activeContainer && (
          <div className="hidden md:flex items-center gap-2 text-xs text-gray-400">
            <Badge variant="gray" size="sm">
              <FileText className="w-3 h-3 text-gray-400" />
              {activeContainer.totalFiles} files
            </Badge>
            {activeContainer.currentCommit && (
              <Badge variant="purple" size="sm">
                <GitBranch className="w-3 h-3" />
                {activeContainer.currentCommit.substring(0, 7)}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Center: View Switcher */}
      <div className="flex items-center bg-bg-card p-1 rounded-lg border border-border-subtle">
        <button
          onClick={() => onSelectView('editor')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
            activeView === 'editor'
              ? 'bg-brand-purple text-white shadow-sm'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Explorer & Editor</span>
        </button>

        <button
          onClick={() => onSelectView('timemachine')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
            activeView === 'timemachine'
              ? 'bg-brand-purple text-white shadow-sm shadow-purple-500/30'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>Visual Time Machine</span>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
        </button>
      </div>

      {/* Right Actions: SSE status & New Container */}
      <div className="flex items-center gap-2.5">
        {/* SSE Live Pulse */}
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-bg-card border border-border-subtle text-[11px] font-mono text-gray-400"
          title={`Real-Time SSE Sync: ${sseStatus}`}
        >
          <Radio
            className={`w-3 h-3 ${
              sseStatus === 'connected'
                ? 'text-emerald-400 animate-pulse-subtle'
                : sseStatus === 'connecting'
                ? 'text-amber-400 animate-spin'
                : 'text-rose-400'
            }`}
          />
          <span className="hidden sm:inline capitalize">
            {sseStatus === 'connected' ? 'Live Sync' : sseStatus}
          </span>
        </div>

        {isSyncing && (
          <RefreshCw className="w-3.5 h-3.5 text-brand-purple animate-spin" />
        )}

        <Button
          variant="primary"
          size="sm"
          onClick={onOpenNewContainerModal}
          className="hidden sm:inline-flex"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Container</span>
        </Button>
      </div>
    </header>
  );
};
