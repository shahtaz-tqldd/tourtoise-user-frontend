import React, { useCallback, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  BadgeCheck,
  CalendarHeart,
  Coins,
  Gift,
  HandCoins,
  MapPinned,
  MessageCircle,
  MessageSquareDot,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";

import InfiniteScroll from "@/components/shared/infinite-scroll";
import PreviewContent from "@/components/shared/preview-content";
import { EmptyState, SectionHeader } from "@/components/shared/utils";
import { Button } from "@/components/ui/button";
import { PreviewCard } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

import {
  useCreditHistoryInfiniteQuery,
  useCreditRequestMutation,
  useProfileStatesQuery,
} from "@/features/auth/authApiSlice";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import { cn, titleCase } from "@/lib/utils";

const PAGE_SIZE = 20;

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const transactionStyles = {
  refund: {
    icon: RotateCcw,
    iconClassName: "bg-orange-50 text-orange-600",
  },
  initial_grant: {
    icon: Gift,
    iconClassName: "bg-violet-50 text-violet-600",
  },
  monthly_reward: {
    icon: CalendarHeart,
    iconClassName: "bg-amber-50 text-amber-600",
  },
  trip_plan: {
    icon: MapPinned,
    iconClassName: "bg-sky-50 text-sky-600",
  },
  trip_chat: {
    icon: MessageCircle,
    iconClassName: "bg-cyan-50 text-cyan-600",
  },
  agent_chat: {
    icon: MessageSquareDot,
    iconClassName: "bg-primary/10 text-primary",
  },
  admin_adjustment: {
    icon: SlidersHorizontal,
    iconClassName: "bg-slate-100 text-slate-600",
  },
};

const formatTransactionDate = (value) => {
  if (!value) return "Date unavailable";

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : dateFormatter.format(date);
};

const CreditHistory = () => {
  const { user } = useSelector((state) => state.auth);
  const [requestOpen, setRequestOpen] = useState(false);
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const { data: profileStatesData, isLoading: isLoadingProfileStates } =
    useProfileStatesQuery();
  const [requestCredit, { isLoading: isRequestingCredit }] =
    useCreditRequestMutation();
  const {
    data,
    isLoading,
    isFetching,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useCreditHistoryInfiniteQuery({ page_size: PAGE_SIZE });

  const creditHistoryList = useMemo(
    () => data?.pages?.flatMap((page) => page?.data ?? []) ?? [],
    [data],
  );
  const transactionCount = data?.pages?.[0]?.meta?.count;
  const isInitialLoading = isLoading || (isFetching && !data?.pages?.length);
  const profileStates = profileStatesData?.data ?? profileStatesData;
  const hasPendingCreditRequest = Boolean(
    profileStates?.has_pending_credit_request || requestSubmitted,
  );

  const loadMore = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    void fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const handleCreditRequest = async (reason) => {
    try {
      const response = await requestCredit({ payload: { reason } }).unwrap();
      toast.success(response?.message || "Credit request submitted.");
      setRequestSubmitted(true);
      return true;
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Could not submit your credit request."),
      );
      return false;
    }
  };

  return (
    <>
      <PreviewCard className="md:rounded-t-none px-2.5 md:px-0 md:p-8">
        <div>
          <CreditBalancePanel
            credit={user?.credit ?? 0}
            hasPendingRequest={hasPendingCreditRequest}
            isLoadingRequestState={isLoadingProfileStates}
            onRequest={() => setRequestOpen(true)}
          />

          <div className="mt-7 min-w-0">
            <SectionHeader
              title="Credit History"
              description={
                Number.isFinite(transactionCount)
                  ? `${transactionCount} transaction${transactionCount === 1 ? "" : "s"} recorded`
                  : "Review how your credits were earned and used"
              }
            />

            <div className="mt-7">
              {isInitialLoading ? (
                <CreditSkeleton />
              ) : isError && !creditHistoryList.length ? (
                <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-center">
                  <p className="text-sm font-semibold text-red-700">
                    Could not load credit history.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-4"
                    onClick={refetch}
                  >
                    Try again
                  </Button>
                </div>
              ) : creditHistoryList.length ? (
                <div>
                  <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white">
                    {creditHistoryList.map((transaction) => (
                      <CreditCard key={transaction.id} data={transaction} />
                    ))}
                  </div>

                  {isError ? (
                    <div className="mt-4 rounded-xl bg-red-50 p-4 text-center">
                      <p className="text-sm font-medium text-red-700">
                        Could not load more transactions.
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        className="mt-1 text-red-700 hover:text-red-800"
                        onClick={refetch}
                      >
                        Try again
                      </Button>
                    </div>
                  ) : (
                    <InfiniteScroll
                      hasMore={Boolean(hasNextPage)}
                      isLoading={isFetchingNextPage}
                      onLoadMore={loadMore}
                      loadingLabel="Loading more transactions..."
                    />
                  )}
                </div>
              ) : (
                <EmptyState
                  title="No Credit History"
                  description="Your credit activity will appear here."
                  className="min-h-72 py-16 sm:py-20"
                />
              )}
            </div>
          </div>
        </div>
      </PreviewCard>
      <CreditRequestDialog
        open={requestOpen}
        onOpenChange={setRequestOpen}
        onRequest={handleCreditRequest}
        isLoading={isRequestingCredit}
      />
    </>
  );
};

const CreditBalancePanel = ({
  credit,
  hasPendingRequest,
  isLoadingRequestState,
  onRequest,
}) => (
  <aside className="flex items-center gap-3 rounded-2xl border border-primary/30 p-3.5 sm:gap-4 sm:p-4">
    <div className="flex min-w-0 shrink-0 items-center gap-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
        <Coins size={20} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase text-slate-500 sm:text-xs">
          Current balance
        </p>
        <p className="flex items-baseline gap-1.5 leading-none">
          <span className="text-2xl font-bold tracking-tight text-slate-950 tabular-nums">
            {credit}
          </span>
          <span className="text-xs font-semibold text-slate-500">credits</span>
        </p>
      </div>
    </div>

    <div className="hidden h-9 w-px shrink-0 bg-slate-200 sm:block" />

    {hasPendingRequest ? (
      <div className="ml-auto flex min-w-0 items-center gap-2 text-slate-600">
        <BadgeCheck className="size-4 shrink-0" aria-hidden="true" />
        <p className="text-xs font-medium leading-4">
          You've requested for credits, an admin will review it shortly.
        </p>
      </div>
    ) : (
      <>
        <p className="hidden min-w-0 flex-1 text-xs leading-5 text-slate-600 md:block">
          Credits are used for planning trip, trip assistance and turtle chat
          <br />
          Need more for trip planning or travel assistance?
        </p>
        <Button
          type="button"
          variant="outline"
          className="ml-auto shrink-0 border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
          disabled={isLoadingRequestState}
          onClick={onRequest}
        >
          Request credits
        </Button>
      </>
    )}
  </aside>
);

const CreditRequestDialog = ({ open, onOpenChange, onRequest, isLoading }) => {
  const [reason, setReason] = useState("");

  const handleOpenChange = (nextOpen) => {
    if (isLoading) return;
    if (!nextOpen) setReason("");
    onOpenChange(nextOpen);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedReason = reason.trim();
    if (!trimmedReason || isLoading) return;

    const submitted = await onRequest(trimmedReason);
    if (submitted) {
      setReason("");
      onOpenChange(false);
    }
  };

  return (
    <PreviewContent
      open={open}
      onOpenChange={handleOpenChange}
      title="Request credits"
      description="Tell us why you need additional credits."
      className="h-fit p-6 md:max-w-lg md:p-8"
    >
      <form onSubmit={handleSubmit}>
        <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <HandCoins size={21} aria-hidden="true" />
        </span>
        <h2 className="mt-5 text-xl font-bold text-slate-950">
          Request credits
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Explain why you need more credits. An admin will review your request.
        </p>
        <Textarea
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Why do you need additional credits?"
          rows={5}
          autoFocus
          className="mt-5 resize-none rounded-xl bg-white"
        />
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading || !reason.trim()}>
            {isLoading ? "Submitting..." : "Submit request"}
          </Button>
        </div>
      </form>
    </PreviewContent>
  );
};

const CreditCard = ({ data }) => {
  const amount = Number(data?.amount) || 0;
  const isCredit = amount > 0;
  const transactionStyle = transactionStyles[data?.transaction_type] ?? {
    icon: Coins,
    iconClassName: "bg-slate-100 text-slate-600",
  };
  const Icon = transactionStyle.icon;

  return (
    <article className="flex items-center gap-3 border-b border-slate-100 p-4 last:border-b-0 sm:gap-4 sm:px-5">
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl sm:size-11",
          transactionStyle.iconClassName,
        )}
      >
        <Icon size={19} aria-hidden="true" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-slate-900">
              {data?.transaction_type_display ||
                titleCase(data?.transaction_type) ||
                "Credit transaction"}
            </h3>
            <p className="mt-0.5 line-clamp-1 text-xs text-slate-500 sm:text-sm">
              {data?.description || "Credit balance updated"}
            </p>
          </div>

          <p
            className={cn(
              "shrink-0 text-sm font-bold tabular-nums sm:text-base",
              isCredit ? "text-emerald-600" : "text-slate-900",
            )}
          >
            {isCredit ? "+" : ""}
            {amount} <span className="text-xs font-medium">credits</span>
          </p>
        </div>

        <time
          dateTime={data?.created_at}
          className="mt-1.5 block text-[11px] font-medium text-slate-400"
        >
          {formatTransactionDate(data?.created_at)}
        </time>
      </div>
    </article>
  );
};

const CreditSkeleton = () => (
  <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white">
    {Array.from({ length: 5 }).map((_, index) => (
      <div
        key={index}
        className="flex animate-pulse items-center gap-4 border-b border-slate-100 p-4 last:border-b-0 sm:px-5"
      >
        <span className="size-11 shrink-0 rounded-xl bg-slate-100" />
        <span className="min-w-0 flex-1 space-y-2">
          <span className="block h-3.5 w-1/3 rounded-full bg-slate-200" />
          <span className="block h-3 w-2/3 rounded-full bg-slate-100" />
          <span className="block h-2.5 w-1/4 rounded-full bg-slate-100" />
        </span>
        <span className="h-4 w-16 rounded-full bg-slate-100" />
      </div>
    ))}
  </div>
);

export default CreditHistory;
