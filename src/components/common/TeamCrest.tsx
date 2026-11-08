import { useState } from "react";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Club crest as supplied by the data provider; falls back to a neutral initials
 * badge. We never draw or fabricate official marks.
 */
export function TeamCrest({
  name,
  logo,
  size = 28,
  className,
}: {
  name: string;
  logo: string | null;
  size?: number;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (!logo || failed) {
    return (
      <span
        aria-hidden
        style={{ width: size, height: size, fontSize: Math.max(9, size * 0.36) }}
        className={cn(
          "inline-grid shrink-0 place-items-center rounded-full border border-border bg-muted font-display font-semibold text-muted-foreground",
          className,
        )}
      >
        {initials(name)}
      </span>
    );
  }
  return (
    <img
      src={logo}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      onError={() => setFailed(true)}
      style={{ width: size, height: size }}
      className={cn("shrink-0 object-contain", className)}
    />
  );
}