import * as React from 'react';

/**
 * Surface container / panel. The optional header bar reads like a terminal
 * window title (monospace title, optional traffic dots, right-aligned actions).
 * Use it for config panels, the log pane, the preview, etc.
 *
 * @startingPoint section="Core" subtitle="Panel with terminal-style title bar" viewport="700x260"
 */
export interface CardProps {
  children?: React.ReactNode;
  /** Header title; pass a string or node (use <b> to emphasize a path). */
  title?: React.ReactNode;
  /** Show three window dots at the left of the bar. @default false */
  terminalDots?: boolean;
  /** Right-aligned header content (buttons, badges). */
  actions?: React.ReactNode;
  /** Remove body padding (for full-bleed content like logs/video). @default false */
  flushBody?: boolean;
  /** Drop the panel shadow. @default true */
  shadow?: boolean;
  className?: string;
  bodyClassName?: string;
}

export function Card(props: CardProps): JSX.Element;
