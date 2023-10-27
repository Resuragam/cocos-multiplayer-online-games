import { ApiMsgEnum } from './Common';
import { Connection, MyServer } from './Core';
import { symlinkCommon } from './Utils';
import { WebSocketServer } from 'ws';

symlinkCommon();

const server = new MyServer({
    port: 9876,
});

server.setApi(ApiMsgEnum.ApiPlayerJoin, (connect: Connection, data: unknown) => {
    return data + 'I am server, i know you!';
});

server
    .start()
    .then(() => {
        console.log('Server started');
    })
    .catch((error) => {
        console.log(error);
    });

// const wss = new WebSocketServer({
//     port: 9876,
// });

// let inputs = [];

// wss.on('connection', (socket) => {
//     socket.on('message', (buffer) => {
//         const str = buffer.toString();
//         try {
//             const msg = JSON.parse(str);
//             const { name, data } = msg;
//             const { frameId, input } = data;
//             inputs.push(input);
//         } catch (error) {
//             console.log(error.message);
//         }
//     });

//     setInterval(() => {
//         const temp = inputs;
//         inputs = [];
//         const msg = {
//             name: ApiMsgEnum.MsgServerSync,
//             data: {
//                 inputs: temp,
//             },
//         };
//         socket.send(JSON.stringify(msg));
//     }, 100);
// });

// wss.on('listening', () => {
//     console.log('server start');
// });
