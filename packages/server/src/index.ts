import { Player } from './Biz/Player';
import { PlayerManager } from './Biz/PlayerManager';
import { ApiMsgEnum } from './Common';
import { Connection, MyServer } from './Core';
import { symlinkCommon } from './Utils';
import { WebSocketServer } from 'ws';

symlinkCommon();

declare module './Core' {
    interface Connection {
        playerId: number;
    }
}

const server = new MyServer({
    port: 9876,
});

server.on('connection', (connection: Connection) => {
    console.log('people connected', server.connections.size);
});

server.on('disconnection', (connection: Connection) => {
    console.log('people disconnected', server.connections.size);
    if (connection.playerId) {
        PlayerManager.Instance.removePlayer(connection.playerId);
    }
    console.log('PlayerManager.Instance.players.size', PlayerManager.Instance.players.size);
});

server.setApi(ApiMsgEnum.ApiPlayerJoin, (connection: Connection, data: any) => {
    const { nickname } = data;
    const player = PlayerManager.Instance.createPlayer({ nickname, connection });
    connection.playerId = player.id;
    return {
        player: PlayerManager.Instance.getPlayerView(player),
    };
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
