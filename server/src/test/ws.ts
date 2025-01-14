import WebSocket from 'ws';

// 创建 WebSocket 连接
const ws = new WebSocket('ws://localhost:3000/ws');

// 连接成功时的处理
ws.on('open', () => {
    console.log('已连接到服务器');
});

// 接收消息的处理
ws.on('message', (data) => {
    const message = JSON.parse(data.toString());
    console.log('收到消息:', message);

    // 如果是初始化消息，发送一个点击事件
    if (message.type === 'init') {
        const clickMessage = {
            type: 'clicks',
            clicks: [
                { timestamp: Date.now() }
            ]
        };
        ws.send(JSON.stringify(clickMessage));
        console.log('发送点击事件:', clickMessage);
    }
});

// 错误处理
ws.on('error', (error) => {
    console.error('WebSocket 错误:', error);
});

// 连接关闭时的处理
ws.on('close', () => {
    console.log('连接已关闭');
});

// 5秒后关闭连接
setTimeout(() => {
    ws.close();
    console.log('测试完成，关闭连接');
}, 5000); 