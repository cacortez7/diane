import * as React from 'react';

export interface SelectOption {
  value: string;
  label?: React.ReactNode;
}

/**
 * Custom dropdown styled to match the dark terminal surfaces (the native control
 * can't be themed this far). Diane uses it for the instruction-template picker
 * (YouTube Tech/AI · Entretenimiento · Documental · Personalizado).
 *
 * @startingPoint section="Forms" subtitle="Themed dropdown / select" viewport="700x160"
 */
export interface SelectProps {
  label?: React.ReactNode;
  options: (string | SelectOption)[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  id?: string;
  className?: string;
}

export function Select(props: SelectProps): JSX.Element;
