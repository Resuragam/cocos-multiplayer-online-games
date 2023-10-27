import { _decorator, Component, instantiate, Label, Node } from 'cc';
import EventManager from '../Global/EventManager';
import { EventEnum } from '../Enum';
import { IPlayer } from '../Common';
const { ccclass, property } = _decorator;

@ccclass('PlayerManager')
export class PlayerManager extends Component {
    init({ id, rid, nickname }: IPlayer) {
        const label = this.getComponent(Label);
        label.string = nickname;
        this.node.active = true;
    }
}
