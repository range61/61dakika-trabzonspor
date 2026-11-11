import { useState } from "react";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Provider headshot when available; otherwise a neutral jersey-number badge. */
export function PlayerAvatar({
  name,
  jersey,
  photo,
  size = 44,
  className,
}: {
  name: string;
  jersey: string | null;
  photo: string | null;
  size?: number;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (photo && !failed) {
    return (
      <img
        src={photo}
        alt=""
        width={size}
        height={size}
        loading="lazy"
        onError={() => setFailed(true)}
        style={{ width: size, height: size }}
        className={cn("shrink-0 rounded-full bg-muted object-cover object-[center_18%]", className)}
      />
    );
  }
  return (
    <span
      aria-hidden
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      className={cn(
        "relative inline-grid shrink-0 place-items-center overflow-hidden rounded-full bg-navy font-display font-semibold text-navy-foreground",
        className,
      )}
    >
      {jersey ?? initials(name)}
      <span className="absolute inset-x-0 bottom-0 h-[14%] bg-primary" />
    </span>
  );
}