import { useEffect, useRef, useCallback, useState } from "react";
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
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

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
    if (!isConnected) {
      return false; // 如果未连接，不允许点击
    }

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

    return true; // 点击成功
  }, [sendClickQueue, isConnected]);

  // 创建 WebSocket 连接
  const createWebSocket = useCallback(() => {
    // 清理之前的连接
    if (wsRef.current) {
      wsRef.current.close();
    }

    setIsConnected(false);
    // 只在非重连状态下清除错误信息
    if (reconnectAttemptsRef.current === 0) {
      setConnectionError(null);
    }

    const wsUrl = `ws://${settings.serverUrl}/ws`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected");
      setIsConnected(true);
      setConnectionError(null); // 只在连接成功时清除错误信息
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
      if (reconnectAttemptsRef.current === 0) {
        setConnectionError("连接服务器失败");
      }
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
      setIsConnected(false);
      // 在连接断开时尝试重连
      if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
        const attempt = reconnectAttemptsRef.current + 1;
        setConnectionError(
          `连接断开，正在尝试重连... (${attempt}/${MAX_RECONNECT_ATTEMPTS})`
        );
        console.log(
          `Attempting to reconnect... (${attempt}/${MAX_RECONNECT_ATTEMPTS})`
        );
        reconnectTimerRef.current = setTimeout(() => {
          reconnectAttemptsRef.current += 1;
          createWebSocket();
        }, RECONNECT_INTERVAL);
      } else {
        setConnectionError("连接失败，请检查网络后刷新页面重试");
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
    isConnected,
    connectionError,
  };
};
