import type { Icon } from "@phosphor-icons/react";
import type { ReactElement, ReactNode } from "react";

type MetaChipProps = { icon: Icon; children: ReactNode };

export const MetaChip = ({ icon: Icon, children }: MetaChipProps): ReactElement => (
  <span className="inline-flex items-center gap-1.5 text-[13px] text-slate-500">
    <Icon size={16} className="text-slate-400" />
    <span className="font-medium text-slate-600">{children}</span>
  </span>
);
