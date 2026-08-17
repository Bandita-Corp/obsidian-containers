import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  GitBranch,
  X,
  History,
} from 'lucide-react';
import { useContainerCommits } from '../../api/useTimeMachine';
import { TimelineScrubber } from './TimelineScrubber';
import { CompactChangeCard } from './CompactChangeCard';
import { FileVersionModal } from './FileVersionModal';

interface TimeMachineViewProps {
  containerId: string;
  containerName?: string;
}

export const TimeMachineView: React.FC<TimeMachineViewProps> = ({
  containerId,
}) => {
  const { data: commits = [], isLoading } = useContainerCommits(containerId, 100);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  // File snapshot modal state
  const [inspectModal, setInspectModal] = useState<{
    open: boolean;
    filePath: string;
    commitHash: string;
  }>({
    open: false,
    filePath: '',
    commitHash: '',
  });

  // Auto-play timer for scrubber
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    if (isPlaying && commits.length > 0) {
      timer = setInterval(() => {
        setSelectedIndex((prev) => {
          if (prev <= 0) {
            setIsPlaying(false);
            return 0;
          }
          return prev - 1;
        });
      }, 2000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, commits.length]);

  // Filter commits by search query
  const filteredCommits = useMemo(() => {
    if (!searchFilter.trim()) return commits;
    const q = searchFilter.toLowerCase();
    return commits.filter(
      (c) =>
        c.message.toLowerCase().includes(q) ||
        c.author.toLowerCase().includes(q) ||
        c.shortHash.toLowerCase().includes(q) ||
        (c.body && c.body.toLowerCase().includes(q))
    );
  }, [commits, searchFilter]);

  const cardsContainerRef = useRef<HTMLDivElement>(null);

  const handleSelectIndex = (idx: number) => {
    setSelectedIndex(idx);
    // Scroll selected card into view if needed
  };

  const handleInspectFile = (filePath: string, commitHash: string) => {
    setInspectModal({
      open: true,
      filePath,
      commitHash,
    });
  };

  return (
    <div className="h-full flex flex-col bg-bg-base overflow-hidden select-none">
      {/* Time Machine Timeline Scrubber */}
      <TimelineScrubber
        commits={commits}
        selectedIndex={selectedIndex}
        onSelectIndex={handleSelectIndex}
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
      />

      {/* Subheader with Filter & Stats */}
      <div className="bg-bg-surface/50 border-b border-border-subtle px-4 py-2.5 flex items-center justify-between gap-4 select-none">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-semibold text-white tracking-tight">
            Container Evolution History ({commits.length} commits)
          </span>
        </div>

        {/* Search filter for commits */}
        <div className="relative w-64">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search commits by message, author, hash..."
            className="w-full pl-8 pr-7 py-1 bg-bg-input rounded-lg border border-border-subtle text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-brand-purple transition-colors font-sans"
          />
          {searchFilter && (
            <button
              onClick={() => setSearchFilter('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Main Stream of Compact Change Cards */}
      <div
        ref={cardsContainerRef}
        className="flex-1 overflow-y-auto p-4 max-w-4xl w-full mx-auto space-y-3"
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500 text-xs gap-2">
            <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <span>Loading Time Machine history...</span>
          </div>
        ) : filteredCommits.length > 0 ? (
          filteredCommits.map((commit) => {
            const isSelected = commits[selectedIndex]?.hash === commit.hash;
            return (
              <CompactChangeCard
                key={commit.hash}
                commit={commit}
                containerId={containerId}
                isSelected={isSelected}
                onSelect={() => {
                  const originalIdx = commits.findIndex((c) => c.hash === commit.hash);
                  if (originalIdx !== -1) setSelectedIndex(originalIdx);
                }}
                onInspectFile={handleInspectFile}
              />
            );
          })
        ) : (
          <div className="text-center py-16 text-xs text-gray-500">
            <GitBranch className="w-10 h-10 text-gray-600 mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium text-gray-400">
              No commit history available.
            </p>
            <p className="mt-1 text-gray-500">
              This container is either a Simple filesystem container or has no Git commits yet.
            </p>
          </div>
        )}
      </div>

      {/* File Version Inspection & Restore Modal */}
      {inspectModal.open && (
        <FileVersionModal
          open={inspectModal.open}
          onOpenChange={(open) =>
            setInspectModal((prev) => ({ ...prev, open }))
          }
          containerId={containerId}
          filePath={inspectModal.filePath}
          commitHash={inspectModal.commitHash}
        />
      )}
    </div>
  );
};
