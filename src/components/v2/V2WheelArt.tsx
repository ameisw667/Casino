import React from 'react';
import { Spade } from 'lucide-react';
import { V2_FLOATING_CHIPS } from './v2-data';

export function V2WheelArt() {
  return (
    <div className="v2-wheel-stage" aria-hidden="true">
      <div className="v2-wheel-glow" />
      <div className="v2-wheel-disc" />
      <div className="v2-wheel-ring" />
      <div className="v2-wheel-hub">
        <Spade size={40} fill="currentColor" />
      </div>
      {V2_FLOATING_CHIPS.map((chip, i) => (
        <div
          key={i}
          className="v2-chip-float"
          style={{ top: chip.top, left: chip.left, animationDelay: chip.delay }}
        />
      ))}
    </div>
  );
}
