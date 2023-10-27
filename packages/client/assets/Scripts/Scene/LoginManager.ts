import { _decorator, Component, director, EditBox, instantiate, Node } from 'cc';
import EventManager from '../Global/EventManager';
import { EventEnum, SceneEnum } from '../Enum';
import { NetWorkManager } from '../Global/NetWorkManager';
import { ApiMsgEnum } from '../Common';
import DataManager from '../Global/DataManager';
const { ccclass, property } = _decorator;

@ccclass('LoginManager')
export class LoginManager extends Component {
    input: EditBox;
    onLoad(): void {
        this.input = this.getComponentInChildren(EditBox);
        director.preloadScene(SceneEnum.Battle);
    }

    async start() {
        await NetWorkManager.Instance.connect();
    }

    async handleClick() {
        if (!NetWorkManager.Instance.isConnected) {
            console.log('not connected');

            await NetWorkManager.Instance.connect();
            return;
        }

        const nickname = this.input.string;
        if (!nickname) {
            console.log('Please input your nickname');
            return;
        }

        const { success, error, res } = await NetWorkManager.Instance.callApi(ApiMsgEnum.ApiPlayerJoin, {
            nickname,
        });
        if (!success) {
            console.log(error);
            return;
        }

        DataManager.Instance.myPlayerId = res.player.id;
        console.log('login success: ', res);

        director.loadScene(SceneEnum.Hall);
    }
}
