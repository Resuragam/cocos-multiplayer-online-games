import { _decorator, Component, EditBox, instantiate, Node, Prefab } from 'cc';
import { NetWorkManager } from '../Global/NetWorkManager';
import { ApiMsgEnum, IApiPlayerListRes } from '../Common';
import { PlayerManager } from '../UI/PlayerManager';
const { ccclass, property } = _decorator;

@ccclass('HallManager')
export class HallManager extends Component {
    @property(Node)
    playerContainer: Node;

    @property(Prefab)
    playerPerfab: Prefab;

    start() {
        this.playerContainer.destroyAllChildren();
        this.getPlayers();
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
}
