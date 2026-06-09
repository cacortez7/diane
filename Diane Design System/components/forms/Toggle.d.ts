import * as React from 'react';

/**
 * Binary switch with a phosphor-green "on" state. Diane uses it for boolean
 * config flags (e.g. FP16 fallback `tts_half`, lip-sync on/off, cache reuse).
 *
 * @startingPoint section="Forms" subtitle="Switch / toggle" viewport="700x110"
 */
export interface ToggleProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  /** Optional inline label to the right of the track. */
  label?: React.ReactNode;
  disabled?: boolean;
  id?: string;
  className?: string;
}

export function Toggle(props: ToggleProps): JSX.Element;
