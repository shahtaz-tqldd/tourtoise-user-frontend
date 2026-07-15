import { useEffect } from "react";
import { getTokens } from "@/hooks/useToken";

const getNotificationSocketUrl = (accessToken) => {
  if (!accessToken) return "";

  const baseUrl = import.meta.env.VITE_APP_SOCKET_URL;
  if (!baseUrl) return "";

  try {
    const url = new URL(baseUrl);
    url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
    url.pathname = "/ws/notifications/";
    url.search = `?token=${encodeURIComponent(accessToken)}`;
    return url.toString();
  } catch {
    return "";
  }
};

const useNotificationSocket = ({ enabled = true, onNotification } = {}) => {
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return undefined;

    const { accessToken } = getTokens();
    const socketUrl = getNotificationSocketUrl(accessToken);
    if (!socketUrl) return undefined;

    const socket = new WebSocket(socketUrl);

    socket.onmessage = (event) => {
      try {
        onNotification?.(JSON.parse(event.data));
      } catch {
        onNotification?.(null);
      }
    };

    return () => {
      socket.close();
    };
  }, [enabled, onNotification]);
};

export default useNotificationSocket;
