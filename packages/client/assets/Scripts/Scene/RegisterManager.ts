import { _decorator, Component, director, EditBox, Enum } from 'cc';
import { SceneEnum } from '../Enum';
import { NetWorkManager } from '../Global/NetWorkManager';
import { ApiMsgEnum } from '../Common';
const { ccclass, property } = _decorator;

@ccclass('RegisterManager')
export class RegisterManager extends Component {
    input: EditBox;
    onLoad() {
        this.input = this.node.getComponentInChildren(EditBox);
        director.preloadScene(SceneEnum.Login);
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

        const { success, error, res } = await NetWorkManager.Instance.callApi(ApiMsgEnum.ApiPlayerRegister, {
            nickname,
        });

        if (!success) {
            console.log(error);
            return;
        }

        console.log('player register success: ', res);

        director.loadScene(SceneEnum.Login);
    }


}
