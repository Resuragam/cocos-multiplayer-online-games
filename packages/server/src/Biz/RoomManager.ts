import Singleton from '../Base/Singleton';
import { ApiMsgEnum } from '../Common';
import { PlayerManager } from './PlayerManager';
import { Room } from './Room';

export class RoomManager extends Singleton {
    static get Instance() {
        return super.GetInstance<RoomManager>();
    }

    nextRoomId = 1;

    rooms: Set<Room> = new Set();
    idMapRoom: Map<number, Room> = new Map();

    createRoom() {
        const room = new Room(this.nextRoomId++);
        this.rooms.add(room);
        this.idMapRoom.set(room.id, room);
        return room;
    }

    joinRoom(rid: number, uid: number) {
        const room = this.idMapRoom.get(rid);
        if (room) {
            room.join(uid);
            return room;
        }
    }

    // removePlayer(pid: number) {
    //     const player = this.idMapPlayer.get(pid);
    //     if (player) {
    //         this.players.delete(player);
    //         this.idMapPlayer.delete(player.id);
    //     }
    // }
    syncRoom(rid: number) {
        const room = this.idMapRoom.get(rid);
        if (room) {
            room.sync();
        }
    }

    syncRooms() {
        for (const player of PlayerManager.Instance.players) {
            player.connection.sendMsg(ApiMsgEnum.MsgRoomList, {
                list: this.getRoomsView(),
            });
        }
    }

    getRoomsView(rooms: Set<Room> = this.rooms) {
        return [...rooms].map((room) => this.getRoomView(room));
    }

    getRoomView({ id, players }: Room) {
        return {
            id,
            players: PlayerManager.Instance.getPlayersView(players),
        };
    }

    leaveRoom(rid: number, uid: number) {
        const room = this.idMapRoom.get(rid);
        if (room) {
            room.leave(uid);
        }
    }

    closeRoom(rid: number) {
        const room = this.idMapRoom.get(rid);
        if (room) {
            room.close()
            this.rooms.delete(room);
            this.idMapRoom.delete(room.id);
        }
    }

    startRoom(rid: number) {
        const room = this.idMapRoom.get(rid)
        if(room) {
            console.log('startRoom start')
            room.start()
        }
    }
}
