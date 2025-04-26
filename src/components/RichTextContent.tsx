
import React from 'react';
import DOMPurify from 'dompurify';

interface RichTextContentProps {
  content: string;
  className?: string;
}

const RichTextContent = ({ content, className = '' }: RichTextContentProps) => {
  // Sanitize the HTML content
  const sanitizedContent = DOMPurify.sanitize(content);

  return (
    <div 
      className={`prose prose-sm max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }} 
    />
  );
};

export default RichTextContent;
