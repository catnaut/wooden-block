import { useEffect, useRef, useCallback } from "react";
import { useSettings } from "./useSettings";

interface ClickEvent {
  timestamp: number;
}

interface WebSocketMessage {
  type: "init" | "clicks";
  totalClicks?: number;
  clicks?: ClickEvent[];
}

const CLICK_BUFFER_INTERVAL = 200; // 点击事件缓冲时间(ms)
const RECONNECT_INTERVAL = 3000; // 重连间隔时间(ms)
const MAX_RECONNECT_ATTEMPTS = 5; // 最大重连次数

export const useWebSocket = (
  onTotalClicksUpdate: (total: number) => void,
  onOthersClick: () => void
) => {
  const wsRef = useRef<WebSocket | null>(null);
  const clickQueueRef = useRef<ClickEvent[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { settings } = useSettings();

  // 发送点击事件队列
  const sendClickQueue = useCallback(() => {
    if (
      wsRef.current?.readyState === WebSocket.OPEN &&
      clickQueueRef.current.length > 0
    ) {
      wsRef.current.send(
        JSON.stringify({
          type: "clicks",
          clicks: clickQueueRef.current,
        })
      );
      clickQueueRef.current = []; // 清空队列
    }
  }, []);

  // 添加点击事件到队列
  const addClick = useCallback(() => {
    // 添加点击事件到队列
    clickQueueRef.current.push({
      timestamp: Date.now(),
    });

    // 清除之前的定时器
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // 设置新的定时器，延迟发送队列
    timerRef.current = setTimeout(() => {
      sendClickQueue();
    }, CLICK_BUFFER_INTERVAL);
  }, [sendClickQueue]);

  // 创建 WebSocket 连接
  const createWebSocket = useCallback(() => {
    // 清理之前的连接
    if (wsRef.current) {
      wsRef.current.close();
    }

    const wsUrl = `ws://${settings.serverUrl}/ws`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected");
      reconnectAttemptsRef.current = 0; // 重置重连次数
    };

    ws.onmessage = (event) => {
      console.log("WebSocket message received:", event.data);
      try {
        const message: WebSocketMessage = JSON.parse(event.data);

        switch (message.type) {
          case "init":
            if (message.totalClicks !== undefined) {
              onTotalClicksUpdate(message.totalClicks);
            }
            break;
          case "clicks":
            if (message.clicks) {
              console.log("clicks:", message.clicks);
              message.clicks
                .sort((a, b) => a.timestamp - b.timestamp)
                .forEach((click) => {
                  const delay = Math.max(0, click.timestamp - Date.now());
                  setTimeout(() => {
                    onOthersClick();
                  }, delay);
                });
            }
            break;
        }
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
      // 在连接断开时尝试重连
      if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
        console.log(
          `Attempting to reconnect... (${
            reconnectAttemptsRef.current + 1
          }/${MAX_RECONNECT_ATTEMPTS})`
        );
        reconnectTimerRef.current = setTimeout(() => {
          reconnectAttemptsRef.current += 1;
          createWebSocket();
        }, RECONNECT_INTERVAL);
      } else {
        console.log("Max reconnection attempts reached");
      }
    };
  }, [settings.serverUrl, onTotalClicksUpdate, onOthersClick]);

  useEffect(() => {
    createWebSocket();

    return () => {
      // 清理函数
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [createWebSocket]); // 当 serverUrl 变化时重新创建连接

  return {
    addClick,
  };
};
