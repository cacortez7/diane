import * as React from 'react';

export interface TerminalLine {
  /** Message text; supports **bold** spans. */
  msg: React.ReactNode;
  /** Log level → color (rich-style). @default "info" */
  level?: 'info' | 'success' | 'warn' | 'error' | 'debug' | 'stage';
  /** Timestamp string, e.g. "14:32:07" (rendered like rich's [%X]). */
  ts?: string;
}

/**
 * Live log pane mirroring Diane's `rich` stderr output: dim timestamps, a level
 * tag, and color-coded messages (cyan info, green ok, amber warn, red error,
 * violet stage transitions). Optional blinking phosphor cursor for "live".
 *
 * @startingPoint section="Pipeline" subtitle="Live rich-style log terminal" viewport="700x300"
 */
export interface TerminalProps {
  /** Lines as strings or {msg, level, ts}. */
  lines: (string | TerminalLine)[];
  /** Show a blinking cursor after the last line. @default false */
  showCursor?: boolean;
  /** Show the level tag column. @default true */
  showLevel?: boolean;
  /** Max height in px (scrolls past it). @default 260 */
  height?: number;
  className?: string;
}

export function Terminal(props: TerminalProps): JSX.Element;
