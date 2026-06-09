import * as React from 'react';

export interface SegmentedOption {
  value: string;
  label?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

/**
 * Inline segmented switch for 2–4 mutually-exclusive short options — Diane's
 * preset picker (fast / balanced / quality) and similar. The selected segment
 * gets a phosphor-green inset ring.
 *
 * @startingPoint section="Forms" subtitle="Segmented control — preset switch" viewport="700x120"
 */
export interface SegmentedControlProps {
  /** Options as strings or {value,label,icon,disabled}. */
  options: (string | SegmentedOption)[];
  value: string;
  onChange?: (value: string) => void;
  /** Stretch to full width, segments share space equally. @default false */
  block?: boolean;
  name?: string;
  className?: string;
}

export function SegmentedControl(props: SegmentedControlProps): JSX.Element;
