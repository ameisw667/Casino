import React from 'react';
import { V2PromoCard } from './V2PromoCard';
import { V2_PROMOS } from './v2-data';

export function V2PromoBento() {
  return (
    <div className="v2-bento">
      {V2_PROMOS.map((promo) => (
        <V2PromoCard key={promo.id} promo={promo} />
      ))}
    </div>
  );
}
