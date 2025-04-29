
import { DetailedHTMLProps, AnchorHTMLAttributes } from 'react';

declare global {
  namespace React {
    // Define proper type for Link components to avoid nesting errors
    interface AnchorElement extends DetailedHTMLProps<AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement> {}
    
    // Ensure compatibility with breadcrumb components
    interface BreadcrumbLinkProps {
      asChild?: boolean;
      className?: string;
    }
  }
}
