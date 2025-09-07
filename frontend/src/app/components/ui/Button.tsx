'use client';
import { Link } from '@/i18n/navigation';
import { cn } from '@/app/lib/cn';
import { ButtonProps, ButtonVariant, Size } from '@/types/index';
import { HoveringAnimation } from '@/app/components/animations/animations';

// --- estilos base ---
const base =
  'w-auto px-9  inline-flex items-center justify-center select-none ' +
  'font-medium rounded-md transition-colors duration-200 ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ' +
  'disabled:opacity-50 disabled:pointer-events-none ';

const byVariant: Record<ButtonVariant, string> = {
  primary:
    'text-white bg-primary hover:opacity-90 ' +
    'focus-visible:ring-[var(--color-primary)]',
  secondary:
    'text-white bg-secondary hover:opacity-90 ' +
    'focus-visible:ring-[var(--color-secondary)]',
  outline:
    'text-[var(--color-foreground)] border border-current bg-transparent ' +
    'hover:bg-black/5 focus-visible:ring-[var(--color-primary)]',
};

const bySize: Record<Size, string> = {
  sm: 'h-9 px-3 gap-2 text-sm',
  md: 'h-10 px-4 gap-2 text-sm',
  lg: 'h-12 px-6 gap-3 text-base',
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
}

// --- Componente principal ---
export function Button(props: ButtonProps) {
  const {
    variant = 'primary',
    size = 'md',
    loading = false,
    leftIcon,
    rightIcon,
    className,
    children
  } = props;

  const classes = cn(base, byVariant[variant], bySize[size], className);

  // --- Caso 1: <Link> interno ---
  if (props.as === 'link') {
    const { as: _ignore, ...linkProps } = props;
    return (
      <HoveringAnimation className="w-1/3 flex flex-col sm:flex-row items-center justify-center my-4 mb-10 mx-auto sm:mx-0 ">
        <Link {...linkProps} className={classes} aria-busy={loading || undefined}>
          {loading ? <Spinner /> : leftIcon && <span className="mr-1.5">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="ml-1.5">{rightIcon}</span>}
        </Link>
      </HoveringAnimation>
    );
  }

  // --- Caso 2: <a> nativo ---
  if (props.as === 'a') {
    const { as: _ignore, ...anchorProps } = props;
    return (
      <HoveringAnimation className="w-1/3 flex flex-col sm:flex-row items-center justify-center my-4 mb-10 mx-auto sm:mx-0 ">
        <a {...anchorProps} className={classes} aria-busy={loading || undefined}>
          {loading ? <Spinner /> : leftIcon && <span className="mr-1.5">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="ml-1.5">{rightIcon}</span>}
        </a>
      </HoveringAnimation>
    );
  }

  // --- Caso 3: <button> real (default) ---
  const { as: _ignore, ...buttonProps } = props;

 return (
    <HoveringAnimation className="w-1/3 flex flex-col sm:flex-row items-center justify-center my-4 mb-10 mx-auto sm:mx-0">
      <button
        {...buttonProps}
        type={buttonProps.type ?? "button"}
        className={classes}
        disabled={buttonProps.disabled || loading}
        aria-busy={loading || undefined}
      >
        {loading ? <Spinner /> : leftIcon && <span className="mr-1.5">{leftIcon}</span>}
        <span>{children}</span>
        {rightIcon && <span className="ml-1.5">{rightIcon}</span>}
      </button>
    </HoveringAnimation>
  );
}
