import { HeadingVariant, Size, HeadingProps, HeadingTag, HeadingHierarchy } from '@/types/index';
import { cn } from '@/app/lib/cn';

const base =
    'w-auto tracking-tight leading-none block m-0 ';

const byVariant: Record<HeadingVariant, string> = {
    primary: 'text-primary font-heading',
    primaryLight: 'text-foreground-white font-heading',
    secondary: 'text-secondary font-body',
    muted: 'text-gray-500 dark:text-gray-400',
};

const bySize: Record<Size, string> = {
    sm: 'text-[clamp(0.875em,2.5vw,20px)]',
    md: 'text-[clamp(1em,3.3vw,32px)]',
    lg: 'text-[clamp(1.7em,6vw,58px)]'
};

const byTag: Record<HeadingTag, string> = {
    h1: 'font-bold',
    h2: 'text-3xl sm:text-4xl lg:text-5xl font-bold mb-4',
    h3: 'font-medium',
    h4: 'text-xl sm:text-2xl font-semibold'
};

const byHierarchy : Record<HeadingHierarchy, string> = {
    forContent: 'text-center sm:text-left my-1',
    forSection: 'text-center my-15'
}

export function Heading({
    as: Tag = 'h2',
    variant = 'primary',
    className,
    children,
    size = 'md',
    hierarchy = 'forContent'
}: HeadingProps) {
    const tagClasses = byTag[Tag as keyof typeof byTag] || ''; // fallback vacío
    const classes = cn(base, byVariant[variant], bySize[size], byHierarchy[hierarchy], tagClasses, className);

    return <Tag className={classes}>{children}</Tag>;
}