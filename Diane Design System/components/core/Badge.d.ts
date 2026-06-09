import * as React from 'react';

/**
 * Compact monospace status token. Used everywhere in Diane: GPU/CPU stage tags,
 * model precision (BF16), backend names, exit codes (rc=0), VRAM deltas, counts.
 * Tone maps to the ANSI accent set.
 *
 * @startingPoint section="Core" subtitle="Status badge — ANSI tones, dot, pulse" viewport="700x140"
 */
export interface BadgeProps {
  children?: React.ReactNode;
  /** Color/semantic tone. @default "neutral" */
  tone?: 'neutral' | 'green' | 'cyan' | 'amber' | 'red' | 'violet' | 'blue';
  /** Show a leading status dot. @default false */
  dot?: boolean;
  /** Pulse the dot (for "running"). @default false */
  pulse?: boolean;
  /** Transparent background, keep border. @default false */
  outline?: boolean;
  /** Uppercase + wide tracking. @default false */
  uppercase?: boolean;
  className?: string;
}

export function Badge(props: BadgeProps): JSX.Element;
