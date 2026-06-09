import * as React from 'react';

export interface RadioCardOption {
  value: string;
  label: React.ReactNode;
  /** Secondary description line. */
  description?: React.ReactNode;
  /** Optional trailing node next to the label (e.g. a <Badge/>). */
  badge?: React.ReactNode;
  disabled?: boolean;
}

/**
 * Radio group rendered as selectable cards with a title + description line.
 * Diane uses it for the translation-backend choice (Gemini API vs local Qwen 35B).
 * The selected card gets a green fill + phosphor glow.
 *
 * @startingPoint section="Forms" subtitle="Radio cards — backend selector" viewport="700x200"
 */
export interface RadioCardsProps {
  options: RadioCardOption[];
  value: string;
  onChange?: (value: string) => void;
  /** Lay cards side-by-side instead of stacked. @default false */
  row?: boolean;
  className?: string;
}

export function RadioCards(props: RadioCardsProps): JSX.Element;
