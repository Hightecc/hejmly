import type { CreateItemInput, GroceryItem, GroceryItemId } from "@onehouse/app-grocery/shared";
import { isPurchased, parseGroceryItemId } from "@onehouse/app-grocery/shared";
import {
  AddItemForm,
  BottomNav,
  EmptyState,
  Fab,
  type ItemSyncState,
  ListBody,
  ListSkeleton,
  OfflineBanner,
  TopBar,
} from "@onehouse/app-grocery/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type ReactElement, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from "@/components/ui/drawer";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useSession } from "@/lib/auth-client";
import { createItem, fetchItems, togglePurchased } from "@/lib/grocery-api";

const ITEMS_QUERY_KEY = ["grocery", "items"] as const;
const TEMP_ID_PREFIX = "tmp_";

const isTempId = (id: GroceryItemId): boolean => id.startsWith(TEMP_ID_PREFIX);

type Identity = {
  id: string;
  name: string;
  initial: string;
};

const useIdentity = (): Identity => {
  const session = useSession();
  const user = session.data?.user;
  if (user === undefined) return { id: "me", name: "You", initial: "·" };
  const name = user.name?.trim() ?? user.email ?? "You";
  const initial = name.charAt(0).toUpperCase() || "·";
  return { id: user.id, name, initial };
};

export const GroceryScreen = (): ReactElement => {
  const qc = useQueryClient();
  const online = useOnlineStatus();
  const identity = useIdentity();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pending, setPending] = useState<ReadonlyMap<GroceryItemId, ItemSyncState>>(
    () => new Map(),
  );

  const items = useQuery({ queryKey: ITEMS_QUERY_KEY, queryFn: fetchItems });

  const setSync = (id: GroceryItemId, state: ItemSyncState | null): void => {
    setPending((prev) => {
      const next = new Map(prev);
      if (state === null) next.delete(id);
      else next.set(id, state);
      return next;
    });
  };

  const create = useMutation({
    mutationFn: createItem,
    onMutate: async (input: CreateItemInput) => {
      await qc.cancelQueries({ queryKey: ITEMS_QUERY_KEY });
      const tempId = parseGroceryItemId(`${TEMP_ID_PREFIX}${Date.now().toString(36)}`);
      const optimistic: GroceryItem = {
        id: tempId,
        name: input.name,
        description: input.description ?? null,
        status: { kind: "pending" },
        createdAt: Date.now(),
        updatedAt: Date.now(),
        addedBy: { id: identity.id, name: identity.name, initial: identity.initial },
      };
      const previous = qc.getQueryData<GroceryItem[]>(ITEMS_QUERY_KEY) ?? [];
      qc.setQueryData<GroceryItem[]>(ITEMS_QUERY_KEY, [optimistic, ...previous]);
      setSync(tempId, "queued");
      return { tempId, previous };
    },
    onError: (_e, _vars, ctx) => {
      if (ctx) {
        qc.setQueryData<GroceryItem[]>(ITEMS_QUERY_KEY, ctx.previous);
        setSync(ctx.tempId, null);
      }
      toast.error("Could not add item");
    },
    onSuccess: (saved, _vars, ctx) => {
      if (!ctx) return;
      qc.setQueryData<GroceryItem[]>(ITEMS_QUERY_KEY, (current) =>
        (current ?? []).map((i) => (i.id === ctx.tempId ? saved : i)),
      );
      setSync(ctx.tempId, null);
    },
  });

  const toggle = useMutation({
    mutationFn: ({ id, purchased }: { id: GroceryItemId; purchased: boolean }) =>
      togglePurchased(id, purchased),
    onMutate: async ({ id, purchased }) => {
      await qc.cancelQueries({ queryKey: ITEMS_QUERY_KEY });
      const previous = qc.getQueryData<GroceryItem[]>(ITEMS_QUERY_KEY) ?? [];
      qc.setQueryData<GroceryItem[]>(ITEMS_QUERY_KEY, (current) =>
        (current ?? []).map((i) =>
          i.id === id
            ? {
                ...i,
                status: purchased
                  ? { kind: "purchased", purchasedAt: Date.now(), purchasedBy: identity.id }
                  : { kind: "pending" },
                updatedAt: Date.now(),
              }
            : i,
        ),
      );
      setSync(id, "queued");
      return { previous, id };
    },
    onError: (_e, _vars, ctx) => {
      if (ctx) {
        qc.setQueryData<GroceryItem[]>(ITEMS_QUERY_KEY, ctx.previous);
        setSync(ctx.id, "error");
      }
      toast.error("Could not update item");
    },
    onSuccess: (saved, _vars, ctx) => {
      if (!ctx) return;
      qc.setQueryData<GroceryItem[]>(ITEMS_QUERY_KEY, (current) =>
        (current ?? []).map((i) => (i.id === ctx.id ? saved : i)),
      );
      setSync(ctx.id, null);
    },
  });

  const visibleItems = items.data ?? [];

  const counts = useMemo(() => {
    const total = visibleItems.length;
    const done = visibleItems.filter((i) => isPurchased(i.status)).length;
    const queued = Array.from(pending.values()).filter((s) => s === "queued").length;
    return { total, done, queued };
  }, [visibleItems, pending]);

  useEffect(() => {
    if (online) {
      void qc.invalidateQueries({ queryKey: ITEMS_QUERY_KEY });
    }
  }, [online, qc]);

  const handleToggle = (id: GroceryItemId, purchased: boolean): void => {
    if (isTempId(id)) return;
    toggle.mutate({ id, purchased });
  };

  const handleRetry = (id: GroceryItemId): void => {
    const item = visibleItems.find((i) => i.id === id);
    if (item === undefined) return;
    toggle.mutate({ id, purchased: !isPurchased(item.status) });
  };

  const handleCreate = (input: CreateItemInput): void => {
    create.mutate(input);
    setDrawerOpen(false);
  };

  if (items.isPending) {
    return (
      <main className="flex min-h-dvh flex-col bg-slate-50">
        <ListSkeleton />
        <BottomNav active="grocery" />
      </main>
    );
  }

  return (
    <main className="flex min-h-dvh flex-col bg-slate-50">
      <TopBar
        count={counts.total}
        doneCount={counts.done}
        online={online}
        queuedCount={counts.queued}
      />
      {!online && <OfflineBanner queuedCount={counts.queued} />}
      {visibleItems.length === 0 ? (
        <EmptyState />
      ) : (
        <ListBody
          items={visibleItems}
          syncStates={pending}
          onToggle={handleToggle}
          onRetry={handleRetry}
        />
      )}
      <Fab onClick={() => setDrawerOpen(true)} />
      <BottomNav active="grocery" />

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="rounded-t-3xl bg-white">
          <DrawerTitle className="sr-only">Add a grocery item</DrawerTitle>
          <DrawerDescription className="sr-only">
            Name the item, optionally add a description.
          </DrawerDescription>
          <div className="flex max-h-[70dvh] flex-col pt-3 pb-2">
            <AddItemForm onSubmit={handleCreate} onCancel={() => setDrawerOpen(false)} />
          </div>
        </DrawerContent>
      </Drawer>
    </main>
  );
};
