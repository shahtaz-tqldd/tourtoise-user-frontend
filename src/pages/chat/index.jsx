import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import useDebounce from "@/hooks/useDebounce";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import {
  useAskChatQuestionMutation,
  useChatMessageListQuery,
  useChatSessionListQuery,
  useCreateChatSessionMutation,
  useDeleteChatSessionMutation,
} from "@/features/chat/chatApiSlice";
import ChatInterface from "./components/chat-interface";
import ChatSessionList from "./components/session-list";

const toDisplayMessage = (message) => ({
  id: message.id,
  role: message.sender === "user" ? "user" : "assistant",
  message: message.content,
  meta: message.sender === "user" ? "You" : "turtle",
  created_at: message.created_at,
});

const AgentChatPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialMessage =
    typeof location.state?.initialMessage === "string"
      ? location.state.initialMessage.trim()
      : "";
  const forwardedMessageSentRef = useRef(false);
  const messagesEndRef = useRef(null);
  const messageSearchInputRef = useRef(null);
  const composerRef = useRef(null);
  const pendingMessageIdRef = useRef(1);
  const shouldRefocusComposerRef = useRef(false);

  const [activeSessionId, setActiveSessionId] = useState(null);
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const [sessionSearch, setSessionSearch] = useState("");
  const [isMessageSearchOpen, setIsMessageSearchOpen] = useState(false);
  const [messageSearch, setMessageSearch] = useState("");
  const [message, setMessage] = useState("");
  const [pendingMessage, setPendingMessage] = useState(null);
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
  const selectedSessionId = useMemo(() => {
    if (sessions.some((session) => session.id === activeSessionId)) {
      return activeSessionId;
    }

    return sessions[0]?.id || null;
  }, [activeSessionId, sessions]);
  const activeSession = sessions.find(
    (session) => session.id === selectedSessionId,
  );

  const {
    data: messageListResponse,
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

  const [createChatSession, { isLoading: isCreatingSession }] =
    useCreateChatSessionMutation();
  const [deleteChatSession, { isLoading: isDeletingSession }] =
    useDeleteChatSessionMutation();
  const [askChatQuestion, { isLoading: isSendingMessage }] =
    useAskChatQuestionMutation();

  const messages = useMemo(() => {
    const serverMessages = (messageListResponse?.data || [])
      .slice()
      .sort((a, b) => (a.sequence || 0) - (b.sequence || 0))
      .map(toDisplayMessage);

    if (!pendingMessage) return serverMessages;
    if (
      debouncedMessageSearch &&
      !String(pendingMessage.message || "")
        .toLowerCase()
        .includes(debouncedMessageSearch.toLowerCase())
    ) {
      return serverMessages;
    }

    return [...serverMessages, pendingMessage];
  }, [debouncedMessageSearch, messageListResponse?.data, pendingMessage]);

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

  const createNewSession = async () => {
    try {
      const response = await createChatSession({
        title: "New travel chat",
      }).unwrap();
      const session = response?.data;

      if (session?.id) setActiveSessionId(session.id);
      setIsMobileChatOpen(true);
      setMessage("");
      toast.success(response?.message || "Chat session created.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not create chat session."));
    }
  };

  const deleteActiveSession = async () => {
    if (!selectedSessionId) return;

    try {
      const deletingId = selectedSessionId;
      const response = await deleteChatSession(deletingId).unwrap();
      const nextSession = sessions.find((session) => session.id !== deletingId);

      setActiveSessionId(nextSession?.id || null);
      setIsMobileChatOpen(Boolean(nextSession?.id));
      setMessage("");
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
      if (!trimmedMessage || isSendingMessage) return;

      setMessage("");
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
        const sessionId = response?.data?.session_id;

        if (sessionId) setActiveSessionId(sessionId);
      } catch (error) {
        setMessage(trimmedMessage);
        toast.error(getApiErrorMessage(error, "Could not send message."));
      } finally {
        setPendingMessage(null);
      }
    },
    [askChatQuestion, isSendingMessage, selectedSessionId],
  );

  useEffect(() => {
    if (!initialMessage || forwardedMessageSentRef.current) return;

    forwardedMessageSentRef.current = true;
    setIsMobileChatOpen(true);
    submitMessage(initialMessage);
    navigate(location.pathname, { replace: true, state: null });
  }, [initialMessage, location.pathname, navigate, submitMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length, selectedSessionId]);

  useEffect(() => {
    if (isSendingMessage || !shouldRefocusComposerRef.current) return;

    shouldRefocusComposerRef.current = false;
    window.requestAnimationFrame(() => composerRef.current?.focus());
  }, [isSendingMessage]);

  return (
    <section className="-mx-4 mt-0 h-[calc(100dvh-112px)] min-h-0 md:mx-0 md:mt-3 lg:mt-4 lg:grid lg:h-[calc(100vh-100px)] lg:min-h-[560px] lg:grid-cols-[420px_minmax(0,1fr)] lg:gap-5">
      <ChatSessionList
        isMobileChatOpen={isMobileChatOpen}
        isCreatingSession={isCreatingSession}
        isFetchingSessions={isFetchingSessions}
        isSessionListError={isSessionListError}
        sessionSearch={sessionSearch}
        sessions={sessions}
        selectedSessionId={selectedSessionId}
        onSessionSearchChange={setSessionSearch}
        onCreateSession={createNewSession}
        onSelectSession={(sessionId) => {
          setActiveSessionId(sessionId);
          setIsMobileChatOpen(true);
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
        isMobileChatOpen={isMobileChatOpen}
        isSendingMessage={isSendingMessage}
        message={message}
        messageResultCount={messageResultCount}
        messageSearch={messageSearch}
        messageSearchInputRef={messageSearchInputRef}
        messages={messages}
        messagesEndRef={messagesEndRef}
        selectedSessionId={selectedSessionId}
        trimmedMessageSearch={trimmedMessageSearch}
        onBack={() => {
          setIsMobileChatOpen(false);
          closeMessageSearch();
        }}
        onCloseMessageSearch={closeMessageSearch}
        onDeleteSession={deleteActiveSession}
        onDownloadSession={downloadActiveSession}
        onMessageChange={setMessage}
        onMessageSearchChange={setMessageSearch}
        onOpenMessageSearch={openMessageSearch}
        onRefetchMessages={refetchMessages}
        onSubmitMessage={submitMessage}
      />
    </section>
  );
};

export default AgentChatPage;
