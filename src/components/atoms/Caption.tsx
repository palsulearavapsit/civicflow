import React from 'react';

export interface CaptionProps {
  children: React.ReactNode;
  lang?: string;
}

/** Provides text captions for media content (A11Y-10). */
export const Caption: React.FC<CaptionProps> = ({ children, lang }) => (
  <figcaption
    className="mt-2 text-sm text-slate-400 text-center"
    lang={lang}
    aria-live="polite"
  >
    {children}
  </figcaption>
);
