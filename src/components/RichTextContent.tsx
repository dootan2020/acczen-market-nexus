
import React from 'react';
import DOMPurify from 'dompurify';

interface RichTextContentProps {
  content: string;
  className?: string;
}

const RichTextContent = ({ content, className = '' }: RichTextContentProps) => {
  // Return null for empty content
  if (!content) return null;

  // Sanitize the HTML content
  const sanitizedContent = DOMPurify.sanitize(content);

  return (
    <div 
      className={`prose prose-sm md:prose-base lg:prose-lg max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }} 
    />
  );
};

export default RichTextContent;
