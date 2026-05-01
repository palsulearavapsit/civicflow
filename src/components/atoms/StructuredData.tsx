import React from 'react';

interface StructuredDataProps {
  data: Record<string, any>;
}

/**
 * GOOGLE-25: Structured Data (JSON-LD) for SEO.
 * Injects a script tag with the provided JSON-LD object.
 */
export const StructuredData: React.FC<StructuredDataProps> = ({ data }) => {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
};
