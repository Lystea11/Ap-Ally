"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import ReactMarkdown from "react-markdown"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"

import { cn } from "@/lib/utils"

// Function to preprocess mathematical expressions for tabs content
const preprocessMathContent = (content: string) => {
  if (!content) return content;
  
  // Common mathematical patterns that need LaTeX formatting
  const mathPatterns = [
    // Superscripts like ^2, ^3
    { pattern: /\^(\d+)/g, replacement: '^{$1}' },
    { pattern: /\^(\([^)]+\))/g, replacement: '^{$1}' },
    // Subscripts like _2, _3
    { pattern: /_(\d+)/g, replacement: '_{$1}' },
    { pattern: /_(\([^)]+\))/g, replacement: '_{$1}' },
    // Fractions like a/b (only if not already in LaTeX)
    { pattern: /(\w+)\/(\w+)/g, replacement: '\\frac{$1}{$2}' },
    // Integrals
    { pattern: /∫/g, replacement: '\\int' },
    // Greek letters
    { pattern: /π/g, replacement: '\\pi' },
    { pattern: /α/g, replacement: '\\alpha' },
    { pattern: /β/g, replacement: '\\beta' },
    { pattern: /γ/g, replacement: '\\gamma' },
    { pattern: /δ/g, replacement: '\\delta' },
    { pattern: /Δ/g, replacement: '\\Delta' },
    { pattern: /θ/g, replacement: '\\theta' },
    { pattern: /λ/g, replacement: '\\lambda' },
    { pattern: /μ/g, replacement: '\\mu' },
    { pattern: /σ/g, replacement: '\\sigma' },
    { pattern: /φ/g, replacement: '\\phi' },
    { pattern: /ω/g, replacement: '\\omega' },
    // Special symbols
    { pattern: /∞/g, replacement: '\\infty' },
    { pattern: /±/g, replacement: '\\pm' },
    { pattern: /≤/g, replacement: '\\leq' },
    { pattern: /≥/g, replacement: '\\geq' },
    { pattern: /≠/g, replacement: '\\neq' },
    { pattern: /×/g, replacement: '\\times' },
    { pattern: /÷/g, replacement: '\\div' },
    { pattern: /√/g, replacement: '\\sqrt' },
  ];
  
  let processed = content;
  
  // Check if content already has LaTeX delimiters
  const hasLatexDelimiters = /\$[^$]+\$/.test(processed) || /\$\$[^$]+\$\$/.test(processed);
  
  if (!hasLatexDelimiters) {
    // Apply mathematical pattern replacements
    mathPatterns.forEach(({ pattern, replacement }) => {
      processed = processed.replace(pattern, replacement);
    });
    
    // Wrap in LaTeX delimiters if we made any changes and it contains math symbols
    if (processed !== content && /[\\^_{}]/.test(processed)) {
      processed = `$${processed}$`;
    }
  }
  
  return processed;
};

// Custom renderers for inline content
const renderers = {
  p: (props: any) => <span {...props} className="inline" />
};

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

// Math-enabled tab trigger
interface MathTabsTriggerProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> {
  mathContent?: string;
}

const MathTabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  MathTabsTriggerProps
>(({ className, mathContent, children, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
      className
    )}
    {...props}
  >
    {mathContent ? (
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={renderers}
        className="inline"
      >
        {preprocessMathContent(mathContent)}
      </ReactMarkdown>
    ) : (
      children
    )}
  </TabsPrimitive.Trigger>
))
MathTabsTrigger.displayName = "MathTabsTrigger"

// Math-enabled tab content
interface MathTabsContentProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content> {
  mathContent?: string;
}

const MathTabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  MathTabsContentProps
>(({ className, mathContent, children, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  >
    {mathContent ? (
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={renderers}
        className="prose prose-sm max-w-none dark:prose-invert"
      >
        {preprocessMathContent(mathContent)}
      </ReactMarkdown>
    ) : (
      children
    )}
  </TabsPrimitive.Content>
))
MathTabsContent.displayName = "MathTabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent, MathTabsTrigger, MathTabsContent }
