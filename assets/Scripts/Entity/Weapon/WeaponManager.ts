import { _decorator, Component, instantiate, Node } from 'cc';
import DataManager from '../../Global/DataManager';
import { EntityTypeEnum, IActor, InputTypeEnum } from '../../Common';
import { EntityManager } from '../../Base/EntityManager';
import { EntityStateEnum } from '../../Enum';
import { WeaponStateMechine } from './WeaponStateMechine';
const { ccclass, property } = _decorator;

@ccclass('WeaponManager')
export class WeaponManager extends EntityManager {
    private body: Node;
    private anchor: Node;
    private point: Node;
    init(data: IActor) {
        this.body = this.node.getChildByName('Body');
        this.anchor = this.body.getChildByName('Anchor');
        this.point = this.anchor.getChildByName('Point');
        
        this.fsm = this.body.addComponent(WeaponStateMechine);
        this.fsm.init(data.weaponType);

        this.state = EntityStateEnum.Idle;
    }
}
