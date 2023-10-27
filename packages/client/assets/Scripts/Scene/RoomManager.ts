import { _decorator, Component, director, EditBox, instantiate, Node, Prefab } from 'cc';
import { NetWorkManager } from '../Global/NetWorkManager';
import { ApiMsgEnum, IApiPlayerListRes, IApiRoomListReq, IApiRoomListRes, IMsgRoom } from '../Common';
import { PlayerManager } from '../UI/PlayerManager';
import DataManager from '../Global/DataManager';
import { SceneEnum } from '../Enum';
const { ccclass, property } = _decorator;

@ccclass('RoomManager')
export class RoomManager extends Component {
    @property(Node)
    playerContainer: Node;

    @property(Prefab)
    playerPerfab: Prefab;

    protected onLoad(): void {
        NetWorkManager.Instance.listenMsg(ApiMsgEnum.MsgRoom, this.renderPlayer, this);
    }

    start() {
        // this.playerContainer.destroyAllChildren();
        this.renderPlayer({
            room: DataManager.Instance.roomInfo,
        });
    }

    onDestroy() {
        NetWorkManager.Instance.unlistenMsg(ApiMsgEnum.MsgRoom, this.renderPlayer, this);
    }

    renderPlayer({ room: { players: list } }: IMsgRoom) {
        for (const c of this.playerContainer.children) {
            c.active = false;
        }

        while (this.playerContainer.children.length < list.length) {
            const node = instantiate(this.playerPerfab);
            node.active = false;
            node.setParent(this.playerContainer);
        }

        for (let i = 0; i < list.length; i++) {
            const data = list[i];
            const node = this.playerContainer.children[i];
            node.getComponent(PlayerManager).init(data);
        }
    }

    async handleLeaveRoom(rid: number) {
        const { success, error, res } = await NetWorkManager.Instance.callApi(ApiMsgEnum.ApiRoomLeave, {});
        if (!success) {
            console.log(error);
            return;
        }

        DataManager.Instance.roomInfo = null;
        director.loadScene(SceneEnum.Hall);
    }
}
