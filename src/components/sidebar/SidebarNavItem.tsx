
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { SidebarNavItem as SidebarNavItemType } from '@/types';

interface SidebarNavItemProps {
  item: SidebarNavItemType;
}

export function SidebarNavItem({ item }: SidebarNavItemProps) {
  return (
    <Link
      to={item.href || '#'}
      className={cn(
        "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
        item.disabled && "pointer-events-none opacity-60"
      )}
      target={item.external ? "_blank" : undefined}
      rel={item.external ? "noopener noreferrer" : undefined}
    >
      {item.icon}
      <span>{item.label || item.title}</span>
      {item.label && (
        <span className="ml-auto text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
          {item.label}
        </span>
      )}
    </Link>
  );
}
