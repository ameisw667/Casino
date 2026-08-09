import React from 'react';

interface V2ChipProps {
  icon?: React.ReactNode;
  children: React.ReactNode;
  mono?: boolean;
  promo?: boolean;
  className?: string;
}

export function V2Chip({ icon, children, mono, promo, className }: V2ChipProps) {
  const classes = ['v2-chip'];
  if (mono) classes.push('v2-chip-mono');
  if (promo) classes.push('v2-chip-promo');
  if (className) classes.push(className);

  return (
    <span className={classes.join(' ')}>
      {icon}
      {children}
    </span>
  );
}
