import { Player } from './Biz/Player';
import { PlayerManager } from './Biz/PlayerManager';
import { RoomManager } from './Biz/RoomManager';
import {
    ApiMsgEnum,
    IApiGameStartReq,
    IApiGameStartRes,
    IApiPlayerJoinReq,
    IApiPlayerJoinRes,
    IApiPlayerListReq,
    IApiPlayerListRes,
    IApiPlayerRegisterReq,
    IApiPlayerRegisterRes,
    IApiRoomCreateReq,
    IApiRoomCreateRes,
    IApiRoomJoinReq,
    IApiRoomJoinRes,
    IApiRoomLeaveReq,
    IApiRoomLeaveRes,
    IApiRoomListReq,
    IApiRoomListRes,
} from './Common';
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
            PlayerManager.Instance.syncPlayers();
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

server.setApi(ApiMsgEnum.ApiRoomJoin, (connection: Connection, { rid }: IApiRoomJoinReq): IApiRoomJoinRes => {
    if (connection.playerId) {
        const room = RoomManager.Instance.joinRoom(rid, connection.playerId);
        if (room) {
            PlayerManager.Instance.syncPlayers();
            RoomManager.Instance.syncRooms();
            RoomManager.Instance.syncRoom(room.id);
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

server.setApi(ApiMsgEnum.ApiRoomLeave, (connection: Connection, data: IApiRoomLeaveReq): IApiRoomLeaveRes => {
    if (connection.playerId) {
        const player = PlayerManager.Instance.idMapPlayer.get(connection.playerId);
        if (player) {
            const rid = player.rid;
            if (rid) {
                RoomManager.Instance.leaveRoom(rid, connection.playerId);
                PlayerManager.Instance.syncPlayers();
                RoomManager.Instance.syncRooms();
                RoomManager.Instance.syncRoom(rid);
                return {};
            } else {
                throw new Error('player has not in the room');
            }
        } else {
            throw new Error('player is not existy');
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

server.setApi(ApiMsgEnum.ApiGameStart, (connection: Connection, data: IApiGameStartReq): IApiGameStartRes => {
    if (connection.playerId) {
        const player = PlayerManager.Instance.idMapPlayer.get(connection.playerId);
        if (player) {
            const rid = player.rid;
            if (rid) {
                RoomManager.Instance.startRoom(rid);
                PlayerManager.Instance.syncPlayers();
                RoomManager.Instance.syncRooms();
                RoomManager.Instance.syncRoom(rid);
                return {};
            } else {
                throw new Error('player has not in the room');
            }
        } else {
            throw new Error('player is not existy');
        }
    } else {
        throw new Error('not login!');
    }
});

server.setApi(ApiMsgEnum.ApiPlayerRegister, (connection: Connection, data: IApiPlayerRegisterReq): IApiPlayerRegisterRes => {
    console.log(data);
    return {};
});

server
    .start()
    .then(() => {
        console.log('Server started');
    })
    .catch((error) => {
        console.log(error);
    });
