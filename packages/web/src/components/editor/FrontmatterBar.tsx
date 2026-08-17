import React, { useState } from 'react';
import { ParsedNoteMetadataDto } from '@workspace/shared';
import { Hash, AlignLeft, FileText, ChevronDown, Tag, Database } from 'lucide-react';
import { Badge } from '../common/Badge';

interface FrontmatterBarProps {
  metadata?: ParsedNoteMetadataDto;
  filePath: string;
  isDirty?: boolean;
}

export const FrontmatterBar: React.FC<FrontmatterBarProps> = ({
  metadata,
  filePath,
  isDirty,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const frontmatterKeys = metadata?.frontmatter
    ? Object.keys(metadata.frontmatter)
    : [];

  return (
    <div className="bg-bg-surface/90 border-b border-border-subtle px-4 py-2 flex flex-col gap-1.5 select-none text-xs">
      <div className="flex items-center justify-between gap-3">
        {/* Note Path & Dirty Pill */}
        <div className="flex items-center gap-2 truncate">
          <FileText className="w-3.5 h-3.5 text-brand-purple shrink-0" />
          <span className="font-mono text-xs font-semibold text-white truncate">
            {filePath}
          </span>
          {isDirty && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-medium border border-amber-500/30">
              Unsaved
            </span>
          )}
        </div>

        {/* Quick Stats: Words & Chars & Details Toggle */}
        <div className="flex items-center gap-2 text-gray-400 shrink-0">
          {metadata && (
            <>
              <Badge variant="gray" size="sm">
                <AlignLeft className="w-3 h-3 text-gray-500" />
                {metadata.wordCount} words
              </Badge>
              <Badge variant="gray" size="sm">
                {metadata.characterCount} chars
              </Badge>
            </>
          )}

          {(frontmatterKeys.length > 0 || (metadata?.headings && metadata.headings.length > 0)) && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-1 px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-gray-300 text-[11px] transition-colors"
            >
              <Database className="w-3 h-3 text-brand-purple" />
              <span>Metadata</span>
              <ChevronDown
                className={`w-3 h-3 transition-transform ${showDetails ? 'rotate-180' : ''}`}
              />
            </button>
          )}
        </div>
      </div>

      {/* Tags Row */}
      {metadata?.tags && metadata.tags.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
          <Tag className="w-3 h-3 text-gray-500 shrink-0" />
          {metadata.tags.map((t) => (
            <Badge key={t} variant="purple" size="sm">
              <Hash className="w-2.5 h-2.5 opacity-70" />
              <span>{t.replace(/^#/, '')}</span>
            </Badge>
          ))}
        </div>
      )}

      {/* Expandable Frontmatter & Headings details */}
      {showDetails && (
        <div className="mt-2 p-3 bg-bg-card rounded-lg border border-border-subtle space-y-2 animate-fade-in text-xs">
          {frontmatterKeys.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-gray-400 mb-1 uppercase tracking-wider">
                Frontmatter YAML
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-bg-input p-2 rounded border border-border-subtle font-mono text-[11px]">
                {frontmatterKeys.map((k) => (
                  <div key={k} className="truncate">
                    <span className="text-purple-400 font-medium">{k}: </span>
                    <span className="text-gray-300">
                      {JSON.stringify(metadata?.frontmatter[k])}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {metadata?.headings && metadata.headings.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-gray-400 mb-1 uppercase tracking-wider">
                Headings ({metadata.headings.length})
              </div>
              <div className="flex flex-wrap gap-1.5">
                {metadata.headings.map((h, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded bg-white/5 text-gray-300 text-[11px] font-mono"
                  >
                    {h}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
