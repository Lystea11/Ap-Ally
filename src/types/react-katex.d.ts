declare module 'react-katex' {
  import { ReactNode } from 'react';

  interface KatexOptions {
    displayMode?: boolean;
    output?: 'html' | 'mathml' | 'htmlAndMathml';
    leqno?: boolean;
    fleqn?: boolean;
    throwOnError?: boolean;
    errorColor?: string;
    macros?: Record<string, string>;
    minRuleThickness?: number;
    colorIsTextColor?: boolean;
    maxSize?: number;
    maxExpand?: number;
    strict?: boolean | 'ignore' | 'warn' | 'error';
    trust?: boolean | ((context: any) => boolean);
    globalGroup?: boolean;
  }

  interface InlineMathProps {
    math: string;
    renderError?: (error: Error) => ReactNode;
    children?: ReactNode;
  }

  interface BlockMathProps {
    math: string;
    renderError?: (error: Error) => ReactNode;
    children?: ReactNode;
  }

  export const InlineMath: React.FC<InlineMathProps>;
  export const BlockMath: React.FC<BlockMathProps>;
}