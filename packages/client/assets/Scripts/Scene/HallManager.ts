import { _decorator, Component, director, EditBox, instantiate, Node, Prefab } from 'cc';
import { NetWorkManager } from '../Global/NetWorkManager';
import { ApiMsgEnum, IApiPlayerListRes } from '../Common';
import { PlayerManager } from '../UI/PlayerManager';
import DataManager from '../Global/DataManager';
import { SceneEnum } from '../Enum';
const { ccclass, property } = _decorator;

@ccclass('HallManager')
export class HallManager extends Component {
    @property(Node)
    playerContainer: Node;

    @property(Prefab)
    playerPerfab: Prefab;

    start() {
        NetWorkManager.Instance.listenMsg(ApiMsgEnum.MsgPlayerList, this.renderPlayer, this);
        this.playerContainer.destroyAllChildren();
        this.getPlayers();
    }

    protected onDestroy(): void {
        NetWorkManager.Instance.unlistenMsg(ApiMsgEnum.MsgPlayerList, this.renderPlayer, this);
    }

    async getPlayers() {
        const { success, error, res } = await NetWorkManager.Instance.callApi(ApiMsgEnum.ApiPlayerList, {});
        if (!success) {
            console.log(error);
            return;
        }

        console.log('playerlist', res);
        this.renderPlayer(res);
    }

    renderPlayer({ list }: IApiPlayerListRes) {
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

    async handleCreateRoom() {
        const { success, error, res } = await NetWorkManager.Instance.callApi(ApiMsgEnum.ApiRoomCreate, {});
        if (!success) {
            console.log(error);
            return;
        }

        DataManager.Instance.roomInfo = res.room;
        console.log('DataManager.Instance.roomInfo', DataManager.Instance.roomInfo);
        director.loadScene(SceneEnum.Room)
    }
}
