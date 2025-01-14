import { useEffect, useRef, useCallback } from 'react';

interface ClickEvent {
  timestamp: number;
}

interface WebSocketMessage {
  type: 'init' | 'clicks';
  totalClicks?: number;
  clicks?: ClickEvent[];
}

const CLICK_BUFFER_INTERVAL = 200; // 点击事件缓冲时间(ms)
const WS_URL = 'ws://localhost:3000/ws';

export const useWebSocket = (onTotalClicksUpdate: (total: number) => void, onOthersClick: () => void) => {
  const wsRef = useRef<WebSocket | null>(null);
  const clickQueueRef = useRef<ClickEvent[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 发送点击事件队列
  const sendClickQueue = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN && clickQueueRef.current.length > 0) {
      wsRef.current.send(JSON.stringify({
        type: 'clicks',
        clicks: clickQueueRef.current
      }));
      clickQueueRef.current = []; // 清空队列
    }
  }, []);

  // 添加点击事件到队列
  const addClick = useCallback(() => {
    // 添加点击事件到队列
    clickQueueRef.current.push({
      timestamp: Date.now()
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

  useEffect(() => {
    // 创建 WebSocket 连接
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
    console.log('WebSocket message received:', event.data);
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        
        switch (message.type) {
          case 'init':
            if (message.totalClicks !== undefined) {
                onTotalClicksUpdate(message.totalClicks);
            }
            break;
          case 'clicks':
            if (message.clicks) {
              // 根据时间戳模拟点击
              console.log('clicks:', message.clicks);
              message.clicks.sort((a, b) => a.timestamp - b.timestamp).forEach((click) => {
                const delay = Math.max(0, click.timestamp - Date.now());
                setTimeout(() => {
                  onOthersClick();
                }, delay);
              });
            }
            break;
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    // 清理函数
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      ws.close();
    };
  }, [onOthersClick]);

  return {
    addClick,
  };
};
