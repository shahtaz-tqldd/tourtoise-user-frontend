import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Bell, MessageSquareDot } from "lucide-react";
import Card from "@/components/ui/card";
import TabMenu from "@/components/ui/tab";
import { useAskChatQuestionMutation } from "@/features/chat/chatApiSlice";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import ChatInputForm from "@/pages/chat/components/chat-input-form";
import { AuthorMessage } from "@/components/shared/utils";
import { cn } from "@/lib/utils";

const asideTabs = [
  { value: "chat", label: "Trip Assistant", icon: MessageSquareDot },
  { value: "notifications", label: "Notifications", icon: Bell },
];

const TripAgentChat = ({
  messages = [],
  notifications = [],
  showTabs = true,
  activeSection = "chat",
  className = "",
}) => {
  const [activeTab, setActiveTab] = useState("chat");
  const selectedSection = showTabs ? activeTab : activeSection;

  return (
    <Card
      className={cn(
        "flex h-[calc(100vh-7rem)] min-h-[560px] min-w-0 flex-col p-0 md:p-6 bg-transparent md:bg-white rounded-none md:rounded-2xl",
        className,
      )}
    >
      {showTabs && (
        <TabMenu
          tabs={asideTabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          className="-mt-3 shrink-0 -mx-6 px-6 pt-1 md:pt-0"
        />
      )}
      {selectedSection === "chat" && <ChatSection messages={messages} />}
      {selectedSection === "notifications" && (
        <NotificationSection notifications={notifications} />
      )}
    </Card>
  );
};

const ChatSection = ({ messages }) => {
  const [localMessages, setLocalMessages] = useState([]);
  const [message, setMessage] = useState("");
  const composerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [askChatQuestion, { isLoading: isSendingMessage }] =
    useAskChatQuestionMutation();
  const renderedMessages = useMemo(
    () => [...messages, ...localMessages],
    [messages, localMessages],
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: "end" });
  }, [renderedMessages.length, isSendingMessage]);

  const submitMessage = useCallback(
    async (nextMessage) => {
      const trimmedMessage = nextMessage.trim();
      if (!trimmedMessage || isSendingMessage) return;

      const userMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: trimmedMessage,
      };

      setMessage("");
      setLocalMessages((prevMessages) => [...prevMessages, userMessage]);

      try {
        const payload = { session_id: null, message: trimmedMessage };
        const response = await askChatQuestion(payload).unwrap();
        setLocalMessages((prevMessages) => [
          ...prevMessages,
          {
            id: response?.data?.message_id || `response-${Date.now()}`,
            role: "agent",
            content: response?.data?.message || "",
          },
        ]);
      } catch (error) {
        setMessage(trimmedMessage);
        setLocalMessages((prevMessages) =>
          prevMessages.filter((item) => item.id !== userMessage.id),
        );
        toast.error(getApiErrorMessage(error, "Could not send message."));
      }
    },
    [askChatQuestion, isSendingMessage],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="hidden-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain pt-3">
        {renderedMessages.length ? (
          renderedMessages.map((message, index) =>
            message.role === "user" ? (
              <div
                key={message.id || index}
                className="max-w-[88%] overflow-hidden rounded-2xl px-4 py-3 text-sm leading-6 break-words whitespace-pre-wrap ml-auto rounded-tr-md bg-primary text-white"
              >
                {message.content}
              </div>
            ) : (
              <AuthorMessage message={message.content} />
            ),
          )
        ) : (
          <p className="rounded-2xl bg-slate-100 px-4 py-3 text-sm leading-6 break-words text-slate-600">
            No agent messages available yet.
          </p>
        )}
        {isSendingMessage && (
          <p className="px-1 text-xs font-semibold text-slate-400">
            turtle is typing
          </p>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="shrink-0 border-t border-slate-200 bg-white pt-3">
        <ChatInputForm
          composerRef={composerRef}
          message={message}
          onSubmitMessage={submitMessage}
          onMessageChange={setMessage}
          isSendingMessage={isSendingMessage}
        />
      </div>
    </div>
  );
};

const NotificationSection = ({ notifications }) => {
  return (
    <div className="hidden-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain py-4 pr-1">
      {notifications.length ? (
        notifications.map((notification, index) => (
          <div
            key={index}
            className="rounded-lg bg-slate-100 p-4 text-sm leading-6 break-words text-slate-700"
          >
            <h2 className="font-bold text-sm">{notification.title}</h2>
            <p className="mt-1.5 text-sm leading-6 text-slate-500">
              {notification.content}
            </p>
          </div>
        ))
      ) : (
        <p className="rounded-2xl bg-slate-100 px-4 py-3 text-sm leading-6 break-words text-slate-600">
          No notifications available yet.
        </p>
      )}
    </div>
  );
};

export default TripAgentChat;
