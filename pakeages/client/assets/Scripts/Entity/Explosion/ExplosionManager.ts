import { _decorator, Component, instantiate, IVec2, Vec2 } from 'cc';
import { EntityTypeEnum } from '../../Common';
import { EntityManager } from '../../Base/EntityManager';
import { EntityStateEnum } from '../../Enum';
import { ExplosionStateMechine } from './ExplosionStateMechine';
const { ccclass, property } = _decorator;

@ccclass('ExplosionManager')
export class ExplosionManager extends EntityManager {
    type: EntityTypeEnum;
    id: number;
    init(type: EntityTypeEnum, { x, y }: IVec2) {
        this.node.setPosition(x, y);
        this.type = type;

        this.fsm = this.addComponent(ExplosionStateMechine);
        this.fsm.init(type);

        this.state = EntityStateEnum.Idle;
    }
}
