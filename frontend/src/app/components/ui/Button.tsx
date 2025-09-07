'use client';
import { Link } from '@/i18n/navigation';
import { cn } from '@/app/lib/cn';
import { ButtonVariant, Size, ButtonAsButton, ButtonProps } from '@/types/index';
import {HoveringAnimation} from '@/app/components/animations/animations'

const base =
    'w-auto px-9  inline-flex items-center justify-center select-none ' +
    'font-medium rounded-md transition-colors duration-200 ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ' +
    'disabled:opacity-50 disabled:pointer-events-none ';

const byVariant: Record<ButtonVariant, string> = {
    primary:
        'text-white bg-primary ' +
        'hover:opacity-90 ' +
        'focus-visible:ring-[var(--color-primary)]',
    secondary:
        'text-white bg-secondary ' +
        'hover:opacity-90 ' +
        'focus-visible:ring-[var(--color-secondary)]',
    outline:
        'text-[var(--color-foreground)] border border-current bg-transparent ' +
        'hover:bg-black/5 ' +
        'focus-visible:ring-[var(--color-primary)]',
};


const bySize: Record<Size, string> = {
    sm: 'h-9 px-3 gap-2 text-sm',   
    md: 'h-10 px-4 gap-2 text-sm',  
    lg: 'h-12 px-6 gap-3 text-base' 
};


// --- Spinner ---
function Spinner() {
    return (
        <svg
            className="animate-spin h-4 w-4 shrink-0"
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
            />
            <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
        </svg>
    );
};

// --- Implementación principal ---
export function Button(props: ButtonProps) {
    const {
        variant = 'primary',
        size = 'md',
        loading = false,
        leftIcon,
        rightIcon,
        className,
        children,
        ...rest
    } = props;

    const classes = cn(base, byVariant[variant], bySize[size], className);

    // Si es Link (href)
  if ('href' in props && typeof props.href === 'string') {
    const { href, prefetch, replace, scroll, shallow, locale } = props;
    return (
       <HoveringAnimation className="w-1/3 flex flex-col  sm:flex-row items-center justify-center my-4 mb-10  mx-auto sm:mx-0 ">
      <Link
        href={href}
        prefetch={prefetch}
        replace={replace}
        scroll={scroll}
        shallow={shallow}
        className={classes}
        aria-busy={loading || undefined}
      >
        {loading ? <Spinner /> : leftIcon ? <span className="mr-1.5">{leftIcon}</span> : null}
        <span>{children}</span>
        {rightIcon ? <span className="ml-1.5">{rightIcon}</span> : null}
      </Link>
       </HoveringAnimation>
    );
  }

  // Si es <button>
  const { type = 'button', disabled, ...buttonRest } = rest as ButtonAsButton;

  return (
           <HoveringAnimation className="w-1/3 flex flex-col  sm:flex-row items-center justify-center my-4 mb-10  mx-auto ">
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...buttonRest}
    >
      {loading ? <Spinner /> : leftIcon ? <span className="mr-1.5">{leftIcon}</span> : null}
      <span>{children}</span>
      {rightIcon ? <span className="ml-1.5">{rightIcon}</span> : null}
    </button>
    </HoveringAnimation>
  );
}