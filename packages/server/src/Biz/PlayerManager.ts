import Singleton from '../Base/Singleton';
import { IApiPlayerJoinReq } from '../Common';
import { Connection } from '../Core';
import { Player } from './Player';

export class PlayerManager extends Singleton {
    static get Instance() {
        return super.GetInstance<PlayerManager>();
    }

    nextPlayerId = 1;

    players: Set<Player> = new Set();
    idMapPlayer: Map<number, Player> = new Map();

    createPlayer({ nickname, connection }: IApiPlayerJoinReq & { connection: Connection }) {
        const player = new Player({ id: this.nextPlayerId++, nickname, connection });
        this.players.add(player);
        this.idMapPlayer.set(player.id, player);
        return player;
    }

    removePlayer(pid: number) {
        const player = this.idMapPlayer.get(pid);
        if (player) {
            this.players.delete(player);
            this.idMapPlayer.delete(player.id);
        }
    }

    getPlayerView({ id, nickname, rid }: Player) {
        return {
            id,
            nickname,
            rid,
        };
    }
}
