import { _decorator, Component, instantiate, IVec2 } from 'cc';
import DataManager from '../../Global/DataManager';
import { EntityTypeEnum, IActor, IBullet, InputTypeEnum } from '../../Common';
import { EntityManager } from '../../Base/EntityManager';
import { ActorStateMachine } from './ActorStateMechine';
import { EntityStateEnum, EventEnum } from '../../Enum';
import { WeaponManager } from '../Weapon/WeaponManager';
import { rad2Angle } from '../../Utils';
import { BulletStateMechine } from './BulletStateMechine';
import EventManager from '../../Global/EventManager';
import { ExplosionManager } from '../Explosion/ExplosionManager';
import { ObjectPoolManager } from '../../Global/ObjectPoolManager';
const { ccclass, property } = _decorator;

@ccclass('BulletManager')
export class BulletManager extends EntityManager {
    type: EntityTypeEnum;
    id: number;
    init(data: IBullet) {
        this.type = data.type;
        this.id = data.id;
        this.fsm = this.addComponent(BulletStateMechine);
        this.fsm.init(data.type);

        this.state = EntityStateEnum.Idle;
        this.node.active = false;

        EventManager.Instance.on(EventEnum.ExplosionBorn, this.handleExplosionBorn, this);
    }

    handleExplosionBorn(id: number, { x, y }: IVec2) {
        if (id !== this.id) {
            return;
        }

        const explosion = ObjectPoolManager.Instance.get(EntityTypeEnum.Explosion);
        const em = explosion.getComponent(ExplosionManager) || explosion.addComponent(ExplosionManager);
        em.init(EntityTypeEnum.Explosion, { x, y });

        EventManager.Instance.off(EventEnum.ExplosionBorn, this.handleExplosionBorn, this);
        DataManager.Instance.bulletMap.delete(this.id);

        ObjectPoolManager.Instance.ret(this.node)
    }

    render(data: IBullet) {
        this.node.active = true;
        const { direction, position } = data;
        this.node.setPosition(position.x, position.y);

        const side = Math.sqrt(direction.x ** 2 + direction.y ** 2);
        const angle = direction.x > 0 ? rad2Angle(Math.asin(direction.y / side)) : rad2Angle(Math.asin(-direction.y / side)) + 180;
        this.node.setRotationFromEuler(0, 0, angle);
    }
}
