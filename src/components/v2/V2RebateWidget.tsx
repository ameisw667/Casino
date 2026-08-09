import React from 'react';
import { V2_KPIS } from './v2-data';

export function V2RebateWidget() {
  return (
    <div className="v2-kpi-card">
      {V2_KPIS.map((kpi, i) => (
        <React.Fragment key={kpi.label}>
          {i > 0 && <div className="v2-kpi-divider" />}
          <div className="v2-kpi-tile">
            <span className="v2-kpi-value">{kpi.value}</span>
            <span className="v2-kpi-label">{kpi.label}</span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}
