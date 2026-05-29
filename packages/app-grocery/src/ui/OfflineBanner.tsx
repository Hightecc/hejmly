import { CloudSlashIcon } from "@phosphor-icons/react";
import type { ReactElement } from "react";

type OfflineBannerProps = {
  queuedCount: number;
};

export const OfflineBanner = ({ queuedCount }: OfflineBannerProps): ReactElement => (
  <div className="shrink-0 bg-white px-5 pt-1 pb-3">
    <div className="flex items-center gap-2.5 rounded-xl border border-amber-100 bg-amber-50 px-3.5 py-2.5">
      <CloudSlashIcon size={18} weight="fill" className="text-amber-600" />
      <div className="text-[13px] leading-tight">
        <div className="font-medium text-amber-900">You're offline</div>
        <div className="text-[12px] text-amber-700/80">
          {queuedCount === 0
            ? "Changes will sync when you're back."
            : `${queuedCount} change${queuedCount === 1 ? "" : "s"} will sync when you're back.`}
        </div>
      </div>
    </div>
  </div>
);
