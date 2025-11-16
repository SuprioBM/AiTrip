import React from 'react';

const ChartCard = ({ title, children }) => {
  return (
    <div className="bg-card rounded-lg border border-border p-6 hover:shadow-lg transition-all duration-200">
      <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>
      <div>{children}</div>
    </div>
  );
};

export default ChartCard;
