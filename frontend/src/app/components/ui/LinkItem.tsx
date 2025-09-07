// components/ui/LinkItem.tsx
import { cn } from "@/app/lib/cn";
import { Link } from "@/i18n/navigation";
import { LinkItemProps, LinkVariant, Size } from "@/types/index";

const base =
  "overflow-hidden whitespace-nowrap text-ellipsis font-body " +
  "w-full tracking-tight leading-none text-end mx-auto " +
  "inline-flex items-center justify-end transition-colors duration-200 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 " +
  "cursor-pointer select-none";

const byVariant: Record<LinkVariant, string> = {
  primary: "text-primary hover:text-primary/80 focus-visible:ring-primary",
  secondary: "text-secondary hover:text-secondary/80 focus-visible:ring-secondary",
  muted:
    "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 " +
    "focus-visible:ring-gray-400",
};

const bySize: Record<Size, string> = {
  sm: "text-sm px-1 py-0.5",
  md: "text-base px-2 py-1",
  lg: "text-lg px-3 py-2",
};

export function LinkItem(props: LinkItemProps) {
  const {
    children,
    variant = "primary",
    size = "md",
    className,
    ...rest
  } = props;

  const classes = cn(base, byVariant[variant], bySize[size], className);

  // Caso 1: forzamos uso de Link
  if (props.as === "link") {
    const { as, ...linkProps } = rest;
    return (
      <Link {...(linkProps as any)} className={classes}>
        {children}
      </Link>
    );
  }

  // Caso 2: as="button" | "span" (o sin `as`, default button/span)
  const { as = "button", ...htmlProps } = rest;
  const Component = as;
  return (
    <Component {...(htmlProps as any)} className={classes}>
      {children}
    </Component>
  );
}
