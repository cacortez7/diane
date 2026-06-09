import * as React from 'react';

/**
 * Text input / textarea with an uppercase mono label, phosphor focus glow, and
 * optional inline prefix. Diane uses it for the editable translation-instructions
 * box (multiline) and the optional Gemini API-key field (prefix + error states).
 *
 * @startingPoint section="Forms" subtitle="Input & textarea with focus glow" viewport="700x220"
 */
export interface TextFieldProps {
  label?: React.ReactNode;
  value?: string;
  onChange?: (value: string, e?: React.ChangeEvent) => void;
  placeholder?: string;
  /** Render a multi-line textarea. @default false */
  multiline?: boolean;
  /** Textarea rows. @default 4 */
  rows?: number;
  /** Inline prefix shown before the input (e.g. "$" or "key:"). */
  prefix?: React.ReactNode;
  type?: string;
  required?: boolean;
  disabled?: boolean;
  /** Error message; turns the field red. */
  error?: string;
  /** Helper text below the field. */
  help?: string;
  id?: string;
  className?: string;
}

export function TextField(props: TextFieldProps): JSX.Element;
