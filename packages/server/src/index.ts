import { symlinkCommon } from './Utils';
import { WebSocketServer } from 'ws';

symlinkCommon();

const wss = new WebSocketServer({
    port: 9876,
});

wss.on('connection', (socket) => {
    socket.on('message', (buffer) => {
        console.log(buffer.toString());
    });

    const obj = {
        name: 'haha',
        data: 'hello clint',
    };
    socket.send(JSON.stringify(obj));
});

wss.on('listening', () => {
    console.log('server start');
});
