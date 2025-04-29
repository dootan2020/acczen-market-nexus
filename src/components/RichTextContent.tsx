
import React from 'react';
import DOMPurify from 'dompurify';
import { cn } from "@/lib/utils";

interface RichTextContentProps {
  content: string;
  className?: string;
}

const RichTextContent = ({ content, className = '' }: RichTextContentProps) => {
  // Return null for empty content
  if (!content) return null;

  // Configure DOMPurify
  DOMPurify.addHook('afterSanitizeAttributes', function(node) {
    // Add rel attributes to all links
    if (node.tagName === 'A' && node.getAttribute('target') === '_blank') {
      node.setAttribute('rel', 'noopener noreferrer');
    }
    
    // Add title attributes to images that don't have them
    if (node.tagName === 'IMG' && !node.getAttribute('title')) {
      const alt = node.getAttribute('alt');
      if (alt) {
        node.setAttribute('title', alt);
      }
    }
  });
  
  // Sanitize the HTML content
  const sanitizedContent = DOMPurify.sanitize(content, {
    ADD_ATTR: ['target'],
    ADD_TAGS: ['iframe'],
    ALLOWED_ATTR: ['src', 'alt', 'href', 'target', 'class', 'style', 'id', 'width', 'height'],
    USE_PROFILES: { html: true }  // Ensure HTML entities are properly handled
  });

  return (
    <div 
      className={cn(
        "prose prose-sm md:prose-base max-w-none",
        "prose-headings:text-foreground prose-headings:font-semibold prose-headings:font-poppins",
        "prose-p:text-foreground prose-p:font-inter",
        "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
        "prose-img:rounded-md prose-img:mx-auto",
        "prose-strong:text-foreground",
        "prose-code:text-foreground prose-code:bg-muted prose-code:px-1 prose-code:rounded",
        "prose-blockquote:text-muted-foreground prose-blockquote:border-l-primary",
        "prose-li:marker:text-primary",
        "prose-table:border-collapse",
        "prose-th:bg-muted prose-th:px-3 prose-th:py-2 prose-th:text-foreground",
        "prose-td:px-3 prose-td:py-2 prose-td:border",
        className
      )}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }} 
    />
  );
};

export default RichTextContent;
