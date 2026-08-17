import { useState } from 'react';
import {
  GitCommit,
  User,
  Clock,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  Eye,
  FilePlus,
  FileEdit,
  FileMinus,
} from 'lucide-react';
import { CommitSummaryDto, CommitFileDiffDto } from '@workspace/shared';
import { formatDistanceToNow, format } from 'date-fns';
import { Badge } from '../common/Badge';
import { DiffViewer } from './DiffViewer';
import { useCommitDetail } from '../../api/useTimeMachine';
import clsx from 'clsx';

interface CompactChangeCardProps {
  commit: CommitSummaryDto;
  containerId: string;
  isSelected?: boolean;
  onSelect?: () => void;
  onInspectFile?: (filePath: string, commitHash: string) => void;
}

export const CompactChangeCard: React.FC<CompactChangeCardProps> = ({
  commit,
  containerId,
  isSelected,
  onSelect,
  onInspectFile,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  // Lazy fetch full commit details when card is expanded or selected
  const { data: detail, isLoading: isLoadingDetail } = useCommitDetail(
    isExpanded || isSelected ? containerId : null,
    isExpanded || isSelected ? commit.hash : null
  );

  const handleCopyHash = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(commit.hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'added':
        return <FilePlus className="w-3.5 h-3.5 text-emerald-400" />;
      case 'deleted':
        return <FileMinus className="w-3.5 h-3.5 text-rose-400" />;
      default:
        return <FileEdit className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'added':
        return (
          <Badge variant="emerald" size="sm">
            Added
          </Badge>
        );
      case 'deleted':
        return (
          <Badge variant="rose" size="sm">
            Deleted
          </Badge>
        );
      default:
        return (
          <Badge variant="amber" size="sm">
            Modified
          </Badge>
        );
    }
  };

  return (
    <div
      onClick={onSelect}
      className={clsx(
        'rounded-xl border transition-all duration-200 cursor-pointer overflow-hidden',
        isSelected
          ? 'bg-bg-card border-brand-purple shadow-glow ring-1 ring-brand-purple/50'
          : 'bg-bg-card/70 hover:bg-bg-card border-border-subtle hover:border-gray-600'
      )}
    >
      {/* Top Header Row */}
      <div className="p-3.5 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3 text-xs">
          {/* Commit Hash & Author */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyHash}
              className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 font-mono text-[11px] transition-colors"
              title="Click to copy full commit hash"
            >
              <GitCommit className="w-3 h-3 text-brand-purple" />
              <span>{commit.shortHash}</span>
              {copied ? (
                <Check className="w-2.5 h-2.5 text-emerald-400" />
              ) : (
                <Copy className="w-2.5 h-2.5 text-gray-500" />
              )}
            </button>

            <span className="flex items-center gap-1 text-gray-400 font-medium truncate max-w-[130px]">
              <User className="w-3 h-3 text-gray-500" />
              <span className="truncate">{commit.author}</span>
            </span>
          </div>

          {/* Timestamp */}
          <div
            className="flex items-center gap-1 text-gray-500 text-[11px] font-mono shrink-0"
            title={commit.date ? format(new Date(commit.date), 'PPpp') : ''}
          >
            <Clock className="w-3 h-3" />
            {commit.date ? (
              <span>
                {formatDistanceToNow(new Date(commit.date), {
                  addSuffix: true,
                })}
              </span>
            ) : (
              'Unknown date'
            )}
          </div>
        </div>

        {/* Commit Message */}
        <div className="text-sm font-semibold text-gray-100 leading-snug">
          {commit.message}
        </div>

        {/* Commit Body if present */}
        {commit.body && (
          <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
            {commit.body}
          </p>
        )}

        {/* Files impact summary footer */}
        <div className="flex items-center justify-between pt-1 border-t border-border-subtle/50 text-xs">
          <div className="flex items-center gap-2 text-gray-400 text-[11px]">
            {detail?.files ? (
              <span className="font-mono text-purple-400 font-medium">
                {detail.files.length} file{detail.files.length === 1 ? '' : 's'}{' '}
                changed
              </span>
            ) : (
              <span className="font-mono text-gray-500">
                Click to inspect changes
              </span>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="flex items-center gap-1 text-xs text-brand-purple hover:text-purple-300 font-medium transition-colors"
          >
            <span>{isExpanded ? 'Hide Diffs' : 'View Changes'}</span>
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded File Diffs Panel */}
      {isExpanded && (
        <div className="border-t border-border-subtle bg-bg-surface/80 p-3.5 space-y-3 animate-fade-in text-xs">
          {isLoadingDetail ? (
            <div className="flex items-center justify-center py-4 text-gray-500 text-xs gap-2">
              <div className="w-3.5 h-3.5 border-2 border-brand-purple border-t-transparent rounded-full animate-spin" />
              <span>Loading commit diffs...</span>
            </div>
          ) : detail?.files && detail.files.length > 0 ? (
            <div className="space-y-3">
              {detail.files.map((file: CommitFileDiffDto) => (
                <div
                  key={file.path}
                  className="bg-bg-input/70 rounded-lg border border-border-subtle overflow-hidden"
                >
                  {/* File Header */}
                  <div className="p-2.5 bg-bg-card/90 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 truncate">
                      {getStatusIcon(file.status)}
                      <span className="font-mono text-xs text-gray-200 truncate font-medium">
                        {file.path}
                      </span>
                      {getStatusBadge(file.status)}
                    </div>

                    {onInspectFile && file.status !== 'deleted' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onInspectFile(file.path, commit.hash);
                        }}
                        className="flex items-center gap-1 px-2 py-1 rounded bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-[11px] font-medium transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Inspect Snapshot</span>
                      </button>
                    )}
                  </div>

                  {/* Patch Preview */}
                  {file.patch && (
                    <div className="p-2">
                      <DiffViewer patch={file.patch} maxHeight="max-h-60" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-gray-500 text-center py-3">
              No individual file diffs found for this snapshot.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
