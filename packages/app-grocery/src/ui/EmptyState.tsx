import { PlusIcon, ShoppingCartIcon } from "@phosphor-icons/react";
import type { ReactElement } from "react";

export const EmptyState = (): ReactElement => (
  <div className="flex flex-1 items-center justify-center bg-white px-10">
    <div className="-mt-16 text-center">
      <div className="mx-auto mb-5 grid size-14 place-items-center rounded-2xl bg-slate-100">
        <ShoppingCartIcon size={34} weight="duotone" className="text-slate-400" />
      </div>
      <div className="font-semibold text-lg text-slate-900">Nothing to buy</div>
      <div className="mt-1 text-slate-500 text-sm leading-relaxed">
        Tap{" "}
        <span className="mx-0.5 inline-flex size-5 items-center justify-center rounded-full bg-slate-900 align-middle text-white">
          <PlusIcon size={11} weight="bold" />
        </span>{" "}
        to start the list.
      </div>
    </div>
  </div>
);
