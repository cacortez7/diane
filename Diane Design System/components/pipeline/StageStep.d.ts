import * as React from 'react';

/**
 * One row of Diane's pipeline progress list — a stage that turns green as it
 * completes. The left rail color + icon encode status: pending (faint dot),
 * running (cyan spinner), done (green check), error (red ✕), cached (violet
 * skip arrow, hash-cache hit). Shows the GPU/CPU device tag and stage duration.
 *
 * @startingPoint section="Pipeline" subtitle="Pipeline stage row with status" viewport="700x300"
 */
export interface StageStepProps {
  /** Stage name, e.g. "transcribe". */
  name: string;
  status?: 'pending' | 'running' | 'done' | 'error' | 'cached';
  /** Device the stage runs on. */
  device?: 'GPU' | 'CPU' | null;
  /** 1-based index, zero-padded in display. */
  index?: number | null;
  /** Secondary line — model, VRAM delta, output file, error msg. */
  detail?: React.ReactNode;
  /** Elapsed time, e.g. "1.2s". */
  duration?: React.ReactNode;
  className?: string;
}

export function StageStep(props: StageStepProps): JSX.Element;
