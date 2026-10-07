import React from 'react';

export default function PageContainer({ title, subtitle, children }) {
  return (
    <div className="page-container page-canvas">
      <section className="page-header shell-panel rounded-3xl px-5 py-4 md:px-6 md:py-5">
        <div>
          <h1>{title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
      </section>
      <div className="page-content">{children}</div>
    </div>
  );
}
