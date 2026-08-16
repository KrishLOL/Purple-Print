import type { ReactNode } from "react";

const bracket = "absolute h-2.5 w-2.5 border-accent";

export function CornerCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative border border-border bg-surface p-5 ${className}`}>
      <span className={`${bracket} left-0 top-0 border-l border-t`} aria-hidden />
      <span className={`${bracket} right-0 top-0 border-r border-t`} aria-hidden />
      <span className={`${bracket} bottom-0 left-0 border-b border-l`} aria-hidden />
      <span className={`${bracket} bottom-0 right-0 border-b border-r`} aria-hidden />
      {children}
    </div>
  );
}
