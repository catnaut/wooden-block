import WebSocket from 'ws';

// 创建两个 WebSocket 客户端
const createClient = (clientId: string) => {
    const ws = new WebSocket('ws://localhost:3000/ws');

    ws.on('open', () => {
        console.log(`客户端 ${clientId} 已连接到服务器`);
    });

    ws.on('message', (data) => {
        const message = JSON.parse(data.toString());
        console.log(`客户端 ${clientId} 收到消息:`, message);

        // 如果是初始化消息，客户端1发送点击事件
        if (message.type === 'init' && clientId === '1') {
            setTimeout(() => {
                const clickMessage = {
                    type: 'clicks',
                    clicks: [
                        { timestamp: Date.now() }
                    ]
                };
                ws.send(JSON.stringify(clickMessage));
                console.log(`客户端 ${clientId} 发送点击事件:`, clickMessage);
            }, 1000); // 延迟1秒发送，确保两个客户端都已连接
        }
    });

    ws.on('error', (error) => {
        console.error(`客户端 ${clientId} 发生错误:`, error);
    });

    ws.on('close', () => {
        console.log(`客户端 ${clientId} 连接已关闭`);
    });

    return ws;
};

// 创建两个客户端
console.log('开始测试多客户端场景...');
const client1 = createClient('1');
const client2 = createClient('2');

// 10秒后关闭所有连接
setTimeout(() => {
    console.log('测试完成，关闭所有连接');
    client1.close();
    client2.close();
}, 10000); 