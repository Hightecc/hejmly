import { ImageIcon } from "@phosphor-icons/react";
import type { ReactElement } from "react";
import { cn } from "./cn.ts";

const STRIPE = encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16'><path d='M-4 4 4 -4 M0 16 16 0 M12 20 20 12' stroke='rgba(100,116,139,0.16)' stroke-width='1.5'/></svg>",
);

type PhotoPlaceholderProps = { label?: string; className?: string };

export const PhotoPlaceholder = ({
  label = "recipe photo",
  className,
}: PhotoPlaceholderProps): ReactElement => (
  <div
    className={cn("relative grid place-items-center overflow-hidden bg-slate-100", className)}
    style={{ backgroundImage: `url("data:image/svg+xml,${STRIPE}")` }}
  >
    {label.length > 0 && (
      <div className="flex flex-col items-center gap-1.5 text-slate-400">
        <ImageIcon size={26} weight="duotone" />
        <span className="font-mono text-[10px] lowercase tracking-tight">{label}</span>
      </div>
    )}
  </div>
);
