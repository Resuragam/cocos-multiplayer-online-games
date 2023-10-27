import { _decorator, Component, instantiate, ProgressBar, tween, Tween, Vec3 } from 'cc';
import DataManager from '../../Global/DataManager';
import { EntityTypeEnum, IActor, InputTypeEnum, toFixed } from '../../Common';
import { EntityManager } from '../../Base/EntityManager';
import { ActorStateMachine } from './ActorStateMechine';
import { EntityStateEnum, EventEnum } from '../../Enum';
import { WeaponManager } from '../Weapon/WeaponManager';
import { rad2Angle } from '../../Utils';
import EventManager from '../../Global/EventManager';
const { ccclass, property } = _decorator;

@ccclass('ActorManager')
export class ActorManager extends EntityManager {
    id: number;
    bulletType: EntityTypeEnum;

    private hp: ProgressBar;
    private targetPos: Vec3;
    private tw: Tween<unknown>;
    private wm: WeaponManager;

    init(data: IActor) {
        this.hp = this.node.getComponentInChildren(ProgressBar);
        this.id = data.id;
        this.bulletType = data.bulletType;

        this.fsm = this.addComponent(ActorStateMachine);
        this.fsm.init(data.type);

        this.state = EntityStateEnum.Idle;
        this.node.active = false;
        this.targetPos = void 0;

        const prefab = DataManager.Instance.prefabMap.get(EntityTypeEnum.Weapon1);
        const weapon = instantiate(prefab);
        weapon.setParent(this.node);
        this.wm = weapon.addComponent(WeaponManager);
        this.wm.init(data);
    }

    tick(dt) {
        if (this.id !== DataManager.Instance.myPlayerId) {
            return;
        }
        if (DataManager.Instance.jm.input.length()) {
            const { x, y } = DataManager.Instance.jm.input;
            EventManager.Instance.emit(EventEnum.ClientSync, {
                id: DataManager.Instance.myPlayerId,
                type: InputTypeEnum.ActorMove,
                direction: {
                    x: toFixed(x),
                    y: toFixed(y),
                },
                dt: toFixed(dt),
            });
        } else {
        }
    }

    render(data: IActor) {
        this.renderPos(data);
        this.renderDire(data);
        this.renderHp(data);
    }

    renderPos(data: IActor) {
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
            this.state = EntityStateEnum.Run;
            this.tw = tween(this.node)
                .to(0.1, {
                    position: this.targetPos,
                })
                .call(() => {
                    this.state = EntityStateEnum.Idle;
                })
                .start();
        }
        // this.node.setPosition(position.x, position.y);
    }

    renderDire(data: IActor) {
        const { direction, position } = data;
        if (direction.x !== 0) {
            this.node.setScale(direction.x > 0 ? 1 : -1, 1);
            this.hp.node.setScale(direction.x > 0 ? 1 : -1, 1);
        }

        const side = Math.sqrt(direction.x ** 2 + direction.y ** 2);
        const rad = Math.asin(direction.y / side);
        const angle = rad2Angle(rad);
        this.wm.node.setRotationFromEuler(0, 0, angle);
    }

    renderHp(data: IActor) {
        this.hp.progress = data.hp / this.hp.totalLength;
    }
}
