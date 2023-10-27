import { _decorator, Component, instantiate, IVec2, tween, Tween, Vec3 } from 'cc';
import DataManager from '../../Global/DataManager';
import { EntityTypeEnum, IActor, IBullet, InputTypeEnum } from '../../Common';
import { EntityManager } from '../../Base/EntityManager';
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

    private targetPos: Vec3;
    private tw: Tween<unknown>;

    init(data: IBullet) {
        this.type = data.type;
        this.id = data.id;
        this.fsm = this.addComponent(BulletStateMechine);
        this.fsm.init(data.type);

        this.state = EntityStateEnum.Idle;
        this.node.active = false;
        this.targetPos = void 0;

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

        ObjectPoolManager.Instance.ret(this.node);
    }

    render(data: IBullet) {
        this.renderPos(data);
        this.renderDire(data);
    }

    renderPos(data: IBullet) {
        const { direction, position } = data;
        const newPos = new Vec3(position.x, position.y);
        if (!this.targetPos) {
            this.node.active = true;
            this.node.setPosition(newPos);
            this.targetPos = new Vec3(newPos);
        } else if (!this.targetPos.equals(newPos)) {
            this.tw?.stop();
            this.node.setPosition(this.targetPos);
            this.targetPos.set(newPos);
            this.tw = tween(this.node)
                .to(0.1, {
                    position: this.targetPos,
                })
                .start();
        }
    }

    renderDire(data: IBullet) {
        const { direction, position } = data;
        const side = Math.sqrt(direction.x ** 2 + direction.y ** 2);
        const angle = direction.x > 0 ? rad2Angle(Math.asin(direction.y / side)) : rad2Angle(Math.asin(-direction.y / side)) + 180;
        this.node.setRotationFromEuler(0, 0, angle);
    }
}
