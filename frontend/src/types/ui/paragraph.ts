export type ParagraphVariant = 
  | 'primary'
  | 'primaryWhite'
  | 'secondary'
  | 'muted'
  | 'danger'
  | 'success';

export type ParagraphSize = 'sm' | 'md' | 'lg';
export type ParagraphTag = 'p' | 'span' | 'div';

export interface ParagraphProps {
  as?: ParagraphTag;
  variant?: ParagraphVariant;
  size?: ParagraphSize;
  className?: string;
  children: React.ReactNode;
}