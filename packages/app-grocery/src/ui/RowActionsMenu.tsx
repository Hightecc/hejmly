import {
  ArrowCounterClockwiseIcon,
  CheckCircleIcon,
  DotsThreeVerticalIcon,
  PencilSimpleIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import type { ReactElement } from "react";
import { cn } from "./cn.ts";

type RowActionsMenuProps = {
  itemName: string;
  purchased: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onRemove: () => void;
};

const itemClass =
  "flex min-h-11 w-full cursor-default select-none items-center gap-3 px-3.5 py-2.5 font-medium text-[14px] outline-none data-[highlighted]:bg-slate-50";

export const RowActionsMenu = ({
  itemName,
  purchased,
  onToggle,
  onEdit,
  onRemove,
}: RowActionsMenuProps): ReactElement => (
  <DropdownMenu.Root>
    <DropdownMenu.Trigger asChild>
      <button
        type="button"
        className="grid size-11 shrink-0 place-items-center rounded-full text-slate-400 outline-none transition active:bg-slate-100 data-[state=open]:bg-slate-100"
        aria-label={`Actions for ${itemName}`}
      >
        <DotsThreeVerticalIcon size={18} weight="bold" />
      </button>
    </DropdownMenu.Trigger>
    <DropdownMenu.Portal>
      <DropdownMenu.Content
        align="end"
        sideOffset={4}
        collisionPadding={12}
        className="z-50 w-[200px] overflow-hidden rounded-2xl border border-slate-200/80 bg-white py-1.5 shadow-[0_12px_32px_rgba(15,23,42,0.18),0_2px_6px_rgba(15,23,42,0.06)]"
      >
        <DropdownMenu.Item onSelect={onToggle} className={cn(itemClass, "text-slate-700")}>
          {purchased ? (
            <>
              <ArrowCounterClockwiseIcon size={18} />
              Unmark purchased
            </>
          ) : (
            <>
              <CheckCircleIcon size={18} />
              Mark purchased
            </>
          )}
        </DropdownMenu.Item>
        <DropdownMenu.Item onSelect={onEdit} className={cn(itemClass, "text-slate-700")}>
          <PencilSimpleIcon size={18} />
          Edit
        </DropdownMenu.Item>
        <DropdownMenu.Separator className="mx-3 my-1 h-px bg-slate-100" />
        <DropdownMenu.Item onSelect={onRemove} className={cn(itemClass, "text-rose-600")}>
          <TrashIcon size={18} />
          Remove
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Portal>
  </DropdownMenu.Root>
);
