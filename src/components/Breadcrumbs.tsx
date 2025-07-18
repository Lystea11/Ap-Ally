import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BreadcrumbItem, generateBreadcrumbStructuredData } from '@/lib/seo';
import { StructuredData } from './StructuredData';

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  const allItems = [
    { label: 'Home', href: '/' },
    ...items,
  ];

  const structuredData = generateBreadcrumbStructuredData(allItems);

  return (
    <>
      <StructuredData data={structuredData} />
      <nav
        className={cn(
          'flex items-center space-x-1 text-sm text-muted-foreground',
          className
        )}
        aria-label="Breadcrumb"
      >
        <ol className="flex items-center space-x-1">
          {allItems.map((item, index) => (
            <li key={item.href} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="mx-1 h-4 w-4 text-muted-foreground/50" />
              )}
              {index === allItems.length - 1 ? (
                <span
                  className="text-foreground font-medium"
                  aria-current="page"
                >
                  {index === 0 && <Home className="mr-1 h-4 w-4 inline" />}
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-foreground transition-colors"
                >
                  {index === 0 && <Home className="mr-1 h-4 w-4 inline" />}
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}