import React, { useState, useEffect, useCallback } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';
import {
  Save,
  Columns,
  Eye,
  Edit3,
  RotateCcw,
  Clock,
} from 'lucide-react';
import { FileItemDto } from '@workspace/shared';
import { FrontmatterBar } from './FrontmatterBar';
import { MarkdownPreview } from './MarkdownPreview';
import { Button } from '../common/Button';

interface MarkdownEditorProps {
  file: FileItemDto;
  onSave: (content: string) => Promise<void>;
  onOpenFileHistory?: (path: string) => void;
  isSaving?: boolean;
}

type ViewMode = 'edit' | 'split' | 'preview';

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  file,
  onSave,
  onOpenFileHistory,
  isSaving,
}) => {
  const [content, setContent] = useState(file.content);
  const [isDirty, setIsDirty] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('split');

  // Reset when file path or original content changes
  useEffect(() => {
    setContent(file.content);
    setIsDirty(false);
  }, [file.path, file.content]);

  const handleChange = useCallback(
    (value: string) => {
      setContent(value);
      setIsDirty(value !== file.content);
    },
    [file.content]
  );

  const handleSave = useCallback(async () => {
    if (!isDirty && content === file.content) return;
    await onSave(content);
    setIsDirty(false);
  }, [content, file.content, isDirty, onSave]);

  // Handle Ctrl+S / Cmd+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

  return (
    <div className="h-full flex flex-col bg-bg-base overflow-hidden">
      {/* Frontmatter and Metadata bar */}
      <FrontmatterBar
        metadata={file.metadata}
        filePath={file.path}
        isDirty={isDirty}
      />

      {/* Editor Toolbar */}
      <div className="bg-bg-surface/50 border-b border-border-subtle px-4 py-1.5 flex items-center justify-between gap-3 text-xs select-none">
        {/* View Mode Switcher */}
        <div className="flex items-center bg-bg-card p-0.5 rounded-lg border border-border-subtle">
          <button
            onClick={() => setViewMode('edit')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-colors ${
              viewMode === 'edit'
                ? 'bg-purple-500/20 text-white font-medium'
                : 'text-gray-400 hover:text-gray-200'
            }`}
            title="Edit Mode (Source)"
          >
            <Edit3 className="w-3 h-3" />
            <span className="hidden sm:inline">Source</span>
          </button>

          <button
            onClick={() => setViewMode('split')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-colors ${
              viewMode === 'split'
                ? 'bg-purple-500/20 text-white font-medium'
                : 'text-gray-400 hover:text-gray-200'
            }`}
            title="Split Mode (Side-by-side)"
          >
            <Columns className="w-3 h-3" />
            <span className="hidden sm:inline">Split</span>
          </button>

          <button
            onClick={() => setViewMode('preview')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-colors ${
              viewMode === 'preview'
                ? 'bg-purple-500/20 text-white font-medium'
                : 'text-gray-400 hover:text-gray-200'
            }`}
            title="Preview Mode (Rendered)"
          >
            <Eye className="w-3 h-3" />
            <span className="hidden sm:inline">Preview</span>
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {onOpenFileHistory && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onOpenFileHistory(file.path)}
              className="text-xs py-1 px-2.5 h-7 text-amber-300 hover:text-amber-200 border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20"
            >
              <Clock className="w-3 h-3" />
              <span>History</span>
            </Button>
          )}

          {isDirty && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setContent(file.content);
                setIsDirty(false);
              }}
              className="text-xs py-1 px-2 h-7 text-gray-400 hover:text-white"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </Button>
          )}

          <Button
            variant={isDirty ? 'primary' : 'secondary'}
            size="sm"
            onClick={handleSave}
            isLoading={isSaving}
            disabled={!isDirty}
            className="text-xs py-1 px-3 h-7 font-medium"
          >
            <Save className="w-3 h-3" />
            <span>Save</span>
          </Button>
        </div>
      </div>

      {/* Main Workspace Area: Edit / Split / Preview */}
      <div className="flex-1 flex overflow-hidden">
        {/* CodeMirror Source Editor */}
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div
            className={`h-full overflow-hidden flex flex-col bg-bg-base ${
              viewMode === 'split' ? 'w-1/2 border-r border-border-subtle' : 'w-full'
            }`}
          >
            <CodeMirror
              value={content}
              height="100%"
              theme={oneDark}
              extensions={[markdown({ base: markdownLanguage })]}
              onChange={handleChange}
              basicSetup={{
                lineNumbers: true,
                highlightActiveLineGutter: true,
                highlightSpecialChars: true,
                foldGutter: true,
                dropCursor: true,
                allowMultipleSelections: true,
                indentOnInput: true,
                bracketMatching: true,
                closeBrackets: true,
                autocompletion: true,
                rectangularSelection: true,
                crosshairCursor: true,
                highlightActiveLine: true,
                highlightSelectionMatches: true,
                closeBracketsKeymap: true,
                searchKeymap: true,
                foldKeymap: true,
                completionKeymap: true,
                lintKeymap: true,
              }}
            />
          </div>
        )}

        {/* Rendered Markdown Preview */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div
            className={`h-full overflow-y-auto bg-bg-surface/30 ${
              viewMode === 'split' ? 'w-1/2' : 'w-full'
            }`}
          >
            <MarkdownPreview content={content} />
          </div>
        )}
      </div>
    </div>
  );
};
