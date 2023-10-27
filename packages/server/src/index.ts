import { Player } from './Biz/Player';
import { PlayerManager } from './Biz/PlayerManager';
import { RoomManager } from './Biz/RoomManager';
import { ApiMsgEnum, IApiPlayerJoinReq, IApiPlayerJoinRes, IApiPlayerListReq, IApiPlayerListRes, IApiRoomCreateReq, IApiRoomCreateRes, IApiRoomListReq, IApiRoomListRes } from './Common';
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
    port: 9878,
});

server.on('connection', (connection: Connection) => {
    console.log('people connected', server.connections.size);
});

server.on('disconnection', (connection: Connection) => {
    console.log('people disconnected', server.connections.size);
    if (connection.playerId) {
        PlayerManager.Instance.removePlayer(connection.playerId);
    }
    PlayerManager.Instance.syncPlayers();
});

server.setApi(ApiMsgEnum.ApiPlayerJoin, (connection: Connection, data: IApiPlayerJoinReq): IApiPlayerJoinRes => {
    const { nickname } = data;
    const player = PlayerManager.Instance.createPlayer({ nickname, connection });
    connection.playerId = player.id;
    PlayerManager.Instance.syncPlayers();
    return {
        player: PlayerManager.Instance.getPlayerView(player),
    };
});

server.setApi(ApiMsgEnum.ApiPlayerList, (connection: Connection, data: IApiPlayerListReq): IApiPlayerListRes => {
    return {
        list: PlayerManager.Instance.getPlayersView(),
    };
});

server.setApi(ApiMsgEnum.ApiRoomCreate, (connection: Connection, data: IApiRoomCreateReq): IApiRoomCreateRes => {
    if (connection.playerId) {
        const newRoom = RoomManager.Instance.createRoom();
        const room = RoomManager.Instance.joinRoom(newRoom.id, connection.playerId);
        if (room) {
            PlayerManager.Instance.syncPlayers()
            RoomManager.Instance.syncRooms();
            return {
                room: RoomManager.Instance.getRoomView(room),
            };
        } else {
            throw new Error('room has not existy');
        }
    } else {
        throw new Error('not login!');
    }
});

server.setApi(ApiMsgEnum.ApiRoomList, (connection: Connection, data: IApiRoomListReq): IApiRoomListRes => {
    return {
        list: RoomManager.Instance.getRoomsView(),
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
//     port: 9878,
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
