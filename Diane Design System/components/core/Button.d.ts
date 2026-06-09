import * as React from 'react';

/**
 * Primary action control for Diane. Phosphor-green primary for the main CTA
 * ("Iniciar doblaje"), bordered secondary, quiet ghost, and a danger variant
 * for destructive/abort actions.
 *
 * @startingPoint section="Core" subtitle="Button with phosphor primary, secondary, ghost, danger" viewport="700x180"
 */
export interface ButtonProps {
  children?: React.ReactNode;
  /** Visual style. @default "secondary" */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  /** Size. @default "md" */
  size?: 'sm' | 'md' | 'lg';
  /** Stretch to full width. @default false */
  block?: boolean;
  /** Show a spinner and disable. @default false */
  loading?: boolean;
  disabled?: boolean;
  /** Icon node placed before the label. */
  leadingIcon?: React.ReactNode;
  /** Icon node placed after the label. */
  trailingIcon?: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export function Button(props: ButtonProps): JSX.Element;
