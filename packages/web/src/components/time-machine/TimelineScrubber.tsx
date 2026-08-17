import React from 'react';
import * as Slider from '@radix-ui/react-slider';
import { ChevronLeft, ChevronRight, Play, Pause, GitCommit } from 'lucide-react';
import { CommitSummaryDto } from '@workspace/shared';
import { formatDistanceToNow } from 'date-fns';

interface TimelineScrubberProps {
  commits: CommitSummaryDto[];
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

export const TimelineScrubber: React.FC<TimelineScrubberProps> = ({
  commits,
  selectedIndex,
  onSelectIndex,
  isPlaying,
  onTogglePlay,
}) => {
  if (commits.length === 0) return null;

  const currentCommit = commits[selectedIndex];
  const max = commits.length - 1;

  const handlePrev = () => {
    if (selectedIndex < max) {
      onSelectIndex(selectedIndex + 1);
    }
  };

  const handleNext = () => {
    if (selectedIndex > 0) {
      onSelectIndex(selectedIndex - 1);
    }
  };

  return (
    <div className="bg-bg-surface/90 backdrop-blur-md border-b border-border-subtle p-3 select-none">
      <div className="max-w-5xl mx-auto flex flex-col gap-2.5">
        {/* Controls & Current Snapshot Info */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-bg-card p-1 rounded-lg border border-border-subtle">
              <button
                onClick={handlePrev}
                disabled={selectedIndex >= max}
                className="p-1.5 rounded text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
                title="Older Commit"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={onTogglePlay}
                className="p-1.5 rounded text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 transition-colors mx-0.5"
                title={isPlaying ? 'Pause Scrubber' : 'Auto Play Scrubber'}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </button>

              <button
                onClick={handleNext}
                disabled={selectedIndex <= 0}
                className="p-1.5 rounded text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
                title="Newer Commit"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Commit Badge & Relative Date */}
            {currentCommit && (
              <div className="flex items-center gap-2 text-xs">
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono font-semibold">
                  <GitCommit className="w-3.5 h-3.5" />
                  {currentCommit.shortHash}
                </span>
                <span className="text-gray-300 font-medium truncate max-w-xs sm:max-w-md">
                  {currentCommit.message}
                </span>
              </div>
            )}
          </div>

          <div className="text-right text-xs text-gray-400 font-mono shrink-0 hidden sm:block">
            {currentCommit?.date && (
              <span>
                {formatDistanceToNow(new Date(currentCommit.date), {
                  addSuffix: true,
                })}
              </span>
            )}
            <span className="mx-2 text-gray-600">|</span>
            <span>
              Commit {commits.length - selectedIndex} of {commits.length}
            </span>
          </div>
        </div>

        {/* Radix Slider Scrubber */}
        <div className="flex items-center gap-3 pt-1">
          <span className="text-[10px] text-gray-500 font-mono shrink-0 uppercase tracking-wider">
            Past
          </span>

          <Slider.Root
            className="relative flex items-center select-none touch-none w-full h-5 cursor-pointer"
            value={[max - selectedIndex]}
            max={max}
            step={1}
            onValueChange={([val]) => onSelectIndex(max - val)}
          >
            <Slider.Track className="bg-bg-input relative grow rounded-full h-2 border border-border-subtle overflow-hidden">
              <Slider.Range className="absolute bg-gradient-to-r from-purple-600 via-amber-500 to-emerald-500 h-full" />
            </Slider.Track>
            <Slider.Thumb className="block w-4 h-4 bg-amber-400 shadow-glow-amber rounded-full hover:bg-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-transform active:scale-125" />
          </Slider.Root>

          <span className="text-[10px] text-gray-500 font-mono shrink-0 uppercase tracking-wider text-emerald-400">
            Latest
          </span>
        </div>
      </div>
    </div>
  );
};
