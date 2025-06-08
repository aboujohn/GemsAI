'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface AudioVisualizerProps {
  audioLevel: number;
  isRecording: boolean;
  isPaused: boolean;
  className?: string;
  style?: 'bars' | 'circle' | 'wave';
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function AudioVisualizer({
  audioLevel,
  isRecording,
  isPaused,
  className,
  style = 'bars',
  color = 'primary',
  size = 'md',
}: AudioVisualizerProps) {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-12',
    lg: 'h-16',
  };

  const colorClasses = {
    primary: 'bg-primary',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
  };

  if (style === 'bars') {
    return (
      <div className={cn('flex items-end justify-center gap-1', sizeClasses[size], className)}>
        {Array.from({ length: 5 }, (_, i) => {
          const barHeight = Math.max(0.1, audioLevel * (0.5 + Math.random() * 0.5));
          const delay = i * 0.1;

          return (
            <div
              key={i}
              className={cn(
                'w-1 rounded-full transition-all duration-150 ease-out',
                isRecording && !isPaused ? colorClasses[color] : 'bg-muted',
                isRecording && !isPaused && 'animate-pulse'
              )}
              style={{
                height: isRecording && !isPaused ? `${barHeight * 100}%` : '20%',
                animationDelay: `${delay}s`,
              }}
            />
          );
        })}
      </div>
    );
  }

  if (style === 'circle') {
    const circumference = 2 * Math.PI * 20;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - audioLevel * circumference;

    return (
      <div className={cn('relative', className)}>
        <svg className={cn(sizeClasses[size], 'w-12')} viewBox="0 0 50 50">
          {/* Background circle */}
          <circle
            cx="25"
            cy="25"
            r="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="text-muted"
          />
          {/* Audio level circle */}
          <circle
            cx="25"
            cy="25"
            r="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            className={cn(
              'transition-all duration-150 ease-out transform -rotate-90 origin-center',
              isRecording && !isPaused ? colorClasses[color] : 'text-muted'
            )}
            style={{
              strokeDasharray,
              strokeDashoffset: isRecording && !isPaused ? strokeDashoffset : circumference,
            }}
          />
        </svg>
        {/* Center dot */}
        <div
          className={cn(
            'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-150',
            isRecording && !isPaused ? colorClasses[color] : 'bg-muted',
            isRecording && !isPaused && 'animate-pulse'
          )}
          style={{
            width: isRecording && !isPaused ? `${Math.max(4, audioLevel * 8)}px` : '4px',
            height: isRecording && !isPaused ? `${Math.max(4, audioLevel * 8)}px` : '4px',
          }}
        />
      </div>
    );
  }

  if (style === 'wave') {
    return (
      <div className={cn('flex items-center justify-center gap-px', sizeClasses[size], className)}>
        {Array.from({ length: 20 }, (_, i) => {
          const waveHeight = Math.sin((i / 20) * Math.PI * 2 + Date.now() * 0.005) * audioLevel;

          return (
            <div
              key={i}
              className={cn(
                'w-0.5 rounded-full transition-all duration-100 ease-out',
                isRecording && !isPaused ? colorClasses[color] : 'bg-muted'
              )}
              style={{
                height:
                  isRecording && !isPaused ? `${Math.max(10, Math.abs(waveHeight) * 100)}%` : '10%',
              }}
            />
          );
        })}
      </div>
    );
  }

  return null;
}

// Audio level indicator component
interface AudioLevelIndicatorProps {
  level: number;
  isActive: boolean;
  className?: string;
}

export function AudioLevelIndicator({ level, isActive, className }: AudioLevelIndicatorProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="text-sm text-muted-foreground">Level:</span>
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full transition-all duration-150 ease-out rounded-full',
            isActive ? 'bg-primary' : 'bg-muted-foreground',
            level > 0.8 && 'bg-red-500',
            level > 0.6 && level <= 0.8 && 'bg-yellow-500',
            level <= 0.6 && 'bg-green-500'
          )}
          style={{ width: `${level * 100}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground w-8">{Math.round(level * 100)}%</span>
    </div>
  );
}

// Recording timer component
interface RecordingTimerProps {
  seconds: number;
  maxDuration?: number;
  className?: string;
}

export function RecordingTimer({ seconds, maxDuration = 300, className }: RecordingTimerProps) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const maxMinutes = Math.floor(maxDuration / 60);
  const maxRemainingSeconds = maxDuration % 60;

  const isNearLimit = seconds > maxDuration * 0.9;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className={cn(
          'font-mono text-lg font-medium tabular-nums',
          isNearLimit && 'text-red-500 animate-pulse'
        )}
      >
        {String(minutes).padStart(2, '0')}:{String(remainingSeconds).padStart(2, '0')}
      </div>
      <div className="text-sm text-muted-foreground">
        / {String(maxMinutes).padStart(2, '0')}:{String(maxRemainingSeconds).padStart(2, '0')}
      </div>
    </div>
  );
}
