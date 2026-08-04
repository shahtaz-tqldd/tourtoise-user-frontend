import { useCallback, useEffect, useRef } from "react";

const UNREAD_TITLE_PREFIX = "🔸 ";

const stripUnreadPrefix = (title) =>
  title.startsWith(UNREAD_TITLE_PREFIX)
    ? title.slice(UNREAD_TITLE_PREFIX.length)
    : title;

const playChime = (audioContext) => {
  const startTime = audioContext.currentTime;

  [659.25, 880].forEach((frequency, index) => {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const noteStart = startTime + index * 0.12;

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, noteStart);
    gain.gain.setValueAtTime(0.0001, noteStart);
    gain.gain.exponentialRampToValueAtTime(0.08, noteStart + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.25);

    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(noteStart);
    oscillator.stop(noteStart + 0.26);
  });
};

const useNotificationAlert = ({ enabled = true } = {}) => {
  const audioContextRef = useRef(null);
  const originalTitleRef = useRef("");
  const lastNotificationIdRef = useRef(null);

  const getAudioContext = useCallback(() => {
    if (audioContextRef.current) return audioContextRef.current;

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;

    audioContextRef.current = new AudioContext();
    return audioContextRef.current;
  }, []);

  useEffect(() => {
    originalTitleRef.current = stripUnreadPrefix(document.title);

    const clearTitleAlert = () => {
      if (document.hidden) return;

      if (document.title.startsWith(UNREAD_TITLE_PREFIX)) {
        document.title = originalTitleRef.current;
      } else {
        originalTitleRef.current = document.title;
      }
    };

    const unlockAudio = () => {
      const audioContext = getAudioContext();
      if (audioContext?.state === "suspended") {
        audioContext.resume().catch(() => {});
      }
    };

    document.addEventListener("visibilitychange", clearTitleAlert);
    window.addEventListener("pointerdown", unlockAudio, { once: true });
    window.addEventListener("keydown", unlockAudio, { once: true });

    return () => {
      document.removeEventListener("visibilitychange", clearTitleAlert);
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);

      if (document.title.startsWith(UNREAD_TITLE_PREFIX)) {
        document.title = originalTitleRef.current;
      }

      audioContextRef.current?.close().catch(() => {});
      audioContextRef.current = null;
    };
  }, [getAudioContext]);

  return useCallback(
    (notification) => {
      if (
        !enabled ||
        !notification ||
        (!notification.id && !notification.title && !notification.message)
      ) {
        return;
      }

      if (
        notification.id &&
        notification.id === lastNotificationIdRef.current
      ) {
        return;
      }
      lastNotificationIdRef.current = notification.id || null;

      const audioContext = getAudioContext();
      if (audioContext?.state === "running") {
        playChime(audioContext);
      } else {
        audioContext
          ?.resume()
          .then(() => playChime(audioContext))
          .catch(() => {});
      }

      if (document.hidden) {
        originalTitleRef.current = stripUnreadPrefix(document.title);
        document.title = `${UNREAD_TITLE_PREFIX}${originalTitleRef.current}`;
      }
    },
    [enabled, getAudioContext],
  );
};

export default useNotificationAlert;
