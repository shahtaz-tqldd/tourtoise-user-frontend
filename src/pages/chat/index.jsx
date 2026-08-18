import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import {
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import useDebounce from "@/hooks/useDebounce";
import useMobileBottomNavbar from "@/hooks/useMobileBottomNavbar";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import PreviewContent from "@/components/shared/preview-content";
import { Button } from "@/components/ui/button";
import { destinationApiSlice } from "@/features/destination/destinationApiSlice";
import {
  chatApiSlice,
  useAskChatQuestionMutation,
  useChatMessageListQuery,
  useChatSessionListQuery,
  useCreateChatSessionMutation,
  useDeleteChatSessionMutation,
} from "@/features/chat/chatApiSlice";
import ChatInterface from "./components/chat-interface";
import ChatSessionList from "./components/session-list";
import { Container } from "@/components/ui/container";
import TripPlanningDrawer from "@/pages/trips/trip-create";

const SESSION_QUERY_PARAM = "session_id";

const toDisplayMessage = (message) => ({
  id: message.id,
  role: message.sender === "user" ? "user" : "assistant",
  message: message.content,
  metadata: message.metadata || {},
  meta: message.sender === "user" ? "You" : "turtle",
  created_at: message.created_at,
});

const AgentChatPage = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedSessionId = searchParams.get(SESSION_QUERY_PARAM) || null;
  const initialMessage =
    typeof location.state?.initialMessage === "string"
      ? location.state.initialMessage.trim()
      : "";
  const forwardedMessageSentRef = useRef(false);
  const messagesEndRef = useRef(null);
  const messageSearchInputRef = useRef(null);
  const composerRef = useRef(null);
  const pendingMessageIdRef = useRef(1);
  const tripPlanningContextIdRef = useRef(1);
  const shouldRefocusComposerRef = useRef(false);

  const [closedMobileSessionId, setClosedMobileSessionId] = useState(null);
  const [sessionSearch, setSessionSearch] = useState("");
  const [isMessageSearchOpen, setIsMessageSearchOpen] = useState(false);
  const [isSessionSearchOpen, setIsSessionSearchOpen] = useState(false);
  const [messageSearch, setMessageSearch] = useState("");
  const [message, setMessage] = useState("");
  const [pendingMessage, setPendingMessage] = useState(null);
  const [isReconcilingMessage, setIsReconcilingMessage] = useState(false);
  const [activeSessionSnapshot, setActiveSessionSnapshot] = useState(null);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] =
    useState(false);
  const [tripPlanningContext, setTripPlanningContext] = useState(null);
  const [isTripPlanningOpen, setIsTripPlanningOpen] = useState(false);
  const isMobileConversationOpen =
    Boolean(selectedSessionId) && closedMobileSessionId !== selectedSessionId;
  useMobileBottomNavbar({ hidden: isMobileConversationOpen });

  const debouncedSessionSearch = useDebounce(sessionSearch.trim(), 350);
  const trimmedMessageSearch = messageSearch.trim();
  const debouncedMessageSearch = useDebounce(trimmedMessageSearch, 350);

  const {
    data: sessionListResponse,
    isFetching: isFetchingSessions,
    isError: isSessionListError,
    refetch: refetchSessions,
  } = useChatSessionListQuery({
    page: 1,
    page_size: 20,
    search: debouncedSessionSearch,
  });

  const sessions = useMemo(
    () => sessionListResponse?.data || [],
    [sessionListResponse?.data],
  );
  const listedActiveSession = sessions.find(
    (session) => session.id === selectedSessionId,
  );
  const activeSession =
    listedActiveSession ||
    (activeSessionSnapshot?.id === selectedSessionId
      ? activeSessionSnapshot
      : null);

  const {
    currentData: currentMessageListResponse,
    isFetching: isFetchingMessages,
    isError: isMessageListError,
    refetch: refetchMessages,
  } = useChatMessageListQuery(
    {
      session_id: selectedSessionId,
      page: 1,
      page_size: 100,
      search: debouncedMessageSearch || undefined,
    },
    { skip: !selectedSessionId },
  );

  const messageListResponse = currentMessageListResponse;

  const [createChatSession, { isLoading: isCreatingSession }] =
    useCreateChatSessionMutation();
  const [deleteChatSession, { isLoading: isDeletingSession }] =
    useDeleteChatSessionMutation();
  const [askChatQuestion, { isLoading: isSendingMessage }] =
    useAskChatQuestionMutation();
  const isChatBusy = isSendingMessage || isReconcilingMessage;

  const selectSession = useCallback(
    (sessionId) => {
      setSearchParams(
        (currentParams) => {
          const nextParams = new URLSearchParams(currentParams);

          if (sessionId) {
            nextParams.set(SESSION_QUERY_PARAM, sessionId);
          } else {
            nextParams.delete(SESSION_QUERY_PARAM);
          }

          return nextParams;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const openTripPlanning = useCallback(
    async ({ destination: handoffDestination, handoff }) => {
      const destinationReference =
        handoff?.destination_slug || handoff?.destination_id;

      if (!destinationReference) {
        toast.error("The destination is missing from this planning summary.");
        return;
      }

      try {
        const response = await dispatch(
          destinationApiSlice.endpoints.destinationDetail.initiate(
            destinationReference,
            { subscribe: false },
          ),
        ).unwrap();
        const destination = response?.data || response;

        if (!destination?.id && !destination?.slug) {
          throw new Error("Destination details are unavailable.");
        }

        setTripPlanningContext({
          id: tripPlanningContextIdRef.current,
          destination: { ...handoffDestination, ...destination },
          handoff,
        });
        tripPlanningContextIdRef.current += 1;
        setIsTripPlanningOpen(true);
      } catch {
        toast.error("Could not load this destination for trip planning.");
      }
    },
    [dispatch],
  );

  const messages = useMemo(() => {
    const serverMessages = (messageListResponse?.data || [])
      .slice()
      .sort((a, b) => (a.sequence || 0) - (b.sequence || 0))
      .map(toDisplayMessage);

    if (!pendingMessage) return serverMessages;
    if (
      isMessageSearchOpen &&
      debouncedMessageSearch &&
      !String(pendingMessage.message || "")
        .toLowerCase()
        .includes(debouncedMessageSearch.toLowerCase())
    ) {
      return serverMessages;
    }

    return [...serverMessages, pendingMessage];
  }, [
    debouncedMessageSearch,
    isMessageSearchOpen,
    messageListResponse?.data,
    pendingMessage,
  ]);

  const messageResultCount =
    messageListResponse?.meta?.count ??
    messageListResponse?.meta?.total ??
    messages.length;

  const openMessageSearch = () => {
    setIsMessageSearchOpen(true);
    window.requestAnimationFrame(() => messageSearchInputRef.current?.focus());
  };

  const closeMessageSearch = () => {
    setIsMessageSearchOpen(false);
    setMessageSearch("");
  };

  const closeSessionSearch = () => {
    setIsSessionSearchOpen(false);
    setSessionSearch("");
  };

  const createNewSession = async () => {
    try {
      const response = await createChatSession({
        title: "New travel chat",
      }).unwrap();
      const session = response?.data;

      if (session?.id) {
        setActiveSessionSnapshot(session);
        selectSession(session.id);
      }
      setSessionSearch("");
      setClosedMobileSessionId(null);
      setMessage("");
      toast.success(response?.message || "Chat session created.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not create chat session."));
    }
  };

  const deleteActiveSession = async () => {
    if (!selectedSessionId) {
      setIsDeleteConfirmationOpen(false);
      return;
    }

    try {
      const deletingId = selectedSessionId;
      const response = await deleteChatSession(deletingId).unwrap();
      const nextSession = sessions.find((session) => session.id !== deletingId);

      setActiveSessionSnapshot(nextSession || null);
      selectSession(nextSession?.id || null);
      setClosedMobileSessionId(null);
      setMessage("");
      setIsDeleteConfirmationOpen(false);
      toast.success(response?.message || "Chat session deleted.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not delete this session."));
    }
  };

  const downloadActiveSession = () => {
    if (!activeSession) return;

    const sessionLines = [
      activeSession.title,
      "",
      ...messages.map((item) => `${item.meta}: ${item.message}`),
    ];
    const file = new Blob([sessionLines.join("\n\n")], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${
      activeSession.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") || "travel-chat-session"
    }.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const submitMessage = useCallback(
    async (nextMessage) => {
      const trimmedMessage = nextMessage.trim();
      if (!trimmedMessage || isChatBusy) return;

      setMessage("");
      setIsMessageSearchOpen(false);
      setMessageSearch("");
      shouldRefocusComposerRef.current = true;
      setPendingMessage({
        id: `pending-${pendingMessageIdRef.current}`,
        role: "user",
        message: trimmedMessage,
        meta: "You",
      });
      pendingMessageIdRef.current += 1;

      try {
        const payload = selectedSessionId
          ? { session_id: selectedSessionId, message: trimmedMessage }
          : { message: trimmedMessage };
        const response = await askChatQuestion(payload).unwrap();
        const sessionId =
          response?.data?.session?.id ||
          response?.data?.chat_session?.id ||
          response?.data?.session_id ||
          selectedSessionId;

        if (sessionId) {
          const responseSession =
            response?.data?.session || response?.data?.chat_session;

          if (responseSession?.id) {
            setActiveSessionSnapshot(responseSession);
          } else if (!selectedSessionId) {
            setSessionSearch("");
            setActiveSessionSnapshot({
              id: sessionId,
              title: "New travel chat",
              last_message: { content: trimmedMessage },
              updated_at: new Date().toISOString(),
            });
          }

          setIsReconcilingMessage(true);

          try {
            await dispatch(
              chatApiSlice.endpoints.chatMessageList.initiate(
                {
                  session_id: sessionId,
                  page: 1,
                  page_size: 100,
                },
                { forceRefetch: true, subscribe: false },
              ),
            ).unwrap();
          } catch {
            toast.warning(
              "Message sent, but the latest reply could not be refreshed.",
            );
          }

          selectSession(sessionId);
        }
      } catch (error) {
        setMessage(trimmedMessage);
        toast.error(getApiErrorMessage(error, "Could not send message."));
      } finally {
        setIsReconcilingMessage(false);
        setPendingMessage(null);
      }
    },
    [askChatQuestion, dispatch, isChatBusy, selectSession, selectedSessionId],
  );

  useEffect(() => {
    if (!initialMessage || forwardedMessageSentRef.current) return;

    forwardedMessageSentRef.current = true;
    setClosedMobileSessionId(null);
    submitMessage(initialMessage);
    navigate(
      { pathname: location.pathname, search: location.search },
      { replace: true, state: null },
    );
  }, [
    initialMessage,
    location.pathname,
    location.search,
    navigate,
    submitMessage,
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length, selectedSessionId]);

  useEffect(() => {
    if (isChatBusy || !shouldRefocusComposerRef.current) return;

    shouldRefocusComposerRef.current = false;
    window.requestAnimationFrame(() => composerRef.current?.focus());
  }, [isChatBusy]);

  return (
    <Container className="px-0 py-0 md:py-5 md:px-4">
      <section
        className={`relative overflow-hidden md:grid md:h-[calc(100vh-109px)] md:grid-cols-[420px_minmax(0,1fr)] md:gap-5 md:overflow-visible ${
          isMobileConversationOpen
            ? "h-[calc(100dvh-57px)]"
            : "h-[calc(100dvh-112px)]"
        }`}
      >
        <ChatSessionList
          isMobileChatOpen={isMobileConversationOpen}
          isCreatingSession={isCreatingSession}
          isFetchingSessions={isFetchingSessions}
          isSessionListError={isSessionListError}
          isSessionSearchOpen={isSessionSearchOpen}
          onCloseSessionSearch={closeSessionSearch}
          onOpenSessionSearch={() =>
            setIsSessionSearchOpen(!isSessionSearchOpen)
          }
          sessionSearch={sessionSearch}
          sessions={sessions}
          selectedSessionId={selectedSessionId}
          onSessionSearchChange={setSessionSearch}
          onCreateSession={createNewSession}
          onSelectSession={(sessionId) => {
            setActiveSessionSnapshot(
              sessions.find((session) => session.id === sessionId) || null,
            );
            selectSession(sessionId);
            setClosedMobileSessionId(null);
            setMessage("");
            setMessageSearch("");
          }}
          onRetry={refetchSessions}
        />

        <ChatInterface
          activeSession={activeSession}
          composerRef={composerRef}
          debouncedMessageSearch={debouncedMessageSearch}
          hasMessages={Boolean(messages.length)}
          isDeletingSession={isDeletingSession}
          isFetchingMessages={isFetchingMessages}
          isMessageListError={isMessageListError}
          isMessageSearchOpen={isMessageSearchOpen}
          isMobileChatOpen={isMobileConversationOpen}
          isSendingMessage={isChatBusy}
          message={message}
          messageResultCount={messageResultCount}
          messageSearch={messageSearch}
          messageSearchInputRef={messageSearchInputRef}
          messages={messages}
          messagesEndRef={messagesEndRef}
          selectedSessionId={selectedSessionId}
          trimmedMessageSearch={trimmedMessageSearch}
          onBack={() => {
            setClosedMobileSessionId(selectedSessionId);
            closeMessageSearch();
          }}
          onCloseMessageSearch={closeMessageSearch}
          onDeleteSession={() => setIsDeleteConfirmationOpen(true)}
          onDownloadSession={downloadActiveSession}
          onMessageChange={setMessage}
          onMessageSearchChange={setMessageSearch}
          onOpenMessageSearch={openMessageSearch}
          onRefetchMessages={refetchMessages}
          onStartPlanning={openTripPlanning}
          onSubmitMessage={submitMessage}
        />
      </section>

      {tripPlanningContext && (
        <TripPlanningDrawer
          key={tripPlanningContext.id}
          destination={tripPlanningContext.destination}
          planningHandoff={tripPlanningContext.handoff}
          open={isTripPlanningOpen}
          onOpenChange={setIsTripPlanningOpen}
        />
      )}

      <PreviewContent
        open={isDeleteConfirmationOpen}
        onOpenChange={(open) => {
          if (!isDeletingSession) setIsDeleteConfirmationOpen(open);
        }}
        title="Delete chat session?"
        description="This permanently deletes the chat session and all of its messages."
        className="h-fit p-6 !max-w-lg md:p-8"
      >
        <h2 className="mt-2 text-lg font-bold text-slate-950 md:mt-0">
          Delete chat session?
        </h2>
        <p className="mt-4 text-slate-500">
          {`This permanently deletes ${
            activeSession?.title ? `“${activeSession.title}”` : "this chat"
          } and all of its messages. This action cannot be undone.`}
        </p>
        <div className="mt-8 flex w-full flex-col gap-3 md:flex-row md:justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={isDeletingSession}
            onClick={() => setIsDeleteConfirmationOpen(false)}
            className="w-full md:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={isDeletingSession}
            onClick={deleteActiveSession}
            className="w-full md:w-auto"
          >
            {isDeletingSession ? "Deleting..." : "Delete session"}
          </Button>
        </div>
      </PreviewContent>
    </Container>
  );
};

export default AgentChatPage;
