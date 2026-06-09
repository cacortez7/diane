import * as React from 'react';

/**
 * GPU memory gauge driven by nvidia-smi values (MiB). The fill glows and shifts
 * color by pressure: green under load, amber past ~72%, red past ~90% (OOM risk).
 * Central to Diane's subprocess-per-stage story — VRAM should drop back to idle
 * between stages.
 *
 * @startingPoint section="Pipeline" subtitle="VRAM usage gauge (nvidia-smi)" viewport="700x150"
 */
export interface VramMeterProps {
  /** VRAM used, in MiB. */
  used?: number;
  /** Total VRAM, in MiB. @default 16384 (16 GB) */
  total?: number;
  label?: React.ReactNode;
  /** Display unit suffix. @default "GB" */
  unit?: string;
  className?: string;
}

export function VramMeter(props: VramMeterProps): JSX.Element;
