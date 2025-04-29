
import { DetailedHTMLProps, AnchorHTMLAttributes } from 'react';

declare global {
  namespace React {
    interface AnchorElement extends DetailedHTMLProps<AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement> {}
  }
}
