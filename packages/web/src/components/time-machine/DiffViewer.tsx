import React from 'react';

interface DiffViewerProps {
  patch?: string;
  maxHeight?: string;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({
  patch,
  maxHeight = 'max-h-96',
}) => {
  if (!patch) {
    return (
      <div className="p-4 text-xs text-gray-500 font-mono text-center bg-bg-input rounded-lg border border-border-subtle">
        No diff output available for this file.
      </div>
    );
  }

  const lines = patch.split('\n');

  return (
    <div
      className={`overflow-x-auto overflow-y-auto ${maxHeight} bg-bg-input rounded-lg border border-border-subtle p-2 font-mono text-[11.5px] leading-relaxed select-text`}
    >
      {lines.map((line, idx) => {
        let style = 'text-gray-300';
        let bgStyle = '';

        if (line.startsWith('+') && !line.startsWith('+++')) {
          style = 'text-emerald-300';
          bgStyle = 'bg-emerald-500/10';
        } else if (line.startsWith('-') && !line.startsWith('---')) {
          style = 'text-rose-300';
          bgStyle = 'bg-rose-500/10';
        } else if (line.startsWith('@@')) {
          style = 'text-cyan-400 font-semibold';
          bgStyle = 'bg-cyan-500/10';
        } else if (line.startsWith('diff ') || line.startsWith('index ')) {
          style = 'text-gray-500 font-semibold';
        }

        return (
          <div
            key={idx}
            className={`px-2 py-0.2 rounded-sm whitespace-pre font-mono ${style} ${bgStyle}`}
          >
            {line || ' '}
          </div>
        );
      })}
    </div>
  );
};
