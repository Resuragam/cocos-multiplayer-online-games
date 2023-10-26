import { _decorator, Component, EventTouch, Input, input, Node, UITransform, Vec2 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('JoyStickManager')
export class JoyStickManager extends Component {
    public input: Vec2 = Vec2.ZERO;

    private body: Node;
    private stick: Node;
    private defaultPos: Vec2;
    private radius: number;

    onLoad() {
        this.body = this.node.getChildByName('Body');
        this.stick = this.body.getChildByName('Stick');
        this.defaultPos = new Vec2(this.body.position.x, this.body.position.y);
        this.radius = this.body.getComponent(UITransform)?.contentSize.x / 2;
        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
    }

    onDestroy() {
        input.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    onTouchStart(event: EventTouch) {
        const touchStartPos = event.getUILocation();
        this.body.setPosition(touchStartPos.x, touchStartPos.y);
    }

    onTouchEnd(event: EventTouch) {
        this.body.setPosition(this.defaultPos.x, this.defaultPos.y);
        this.stick.setPosition(0, 0);
        this.input = Vec2.ZERO;
    }

    onTouchMove(event: EventTouch) {
        const touchMovePos = event.getUILocation();
        const stickPos = new Vec2(touchMovePos.x - this.body.position.x, touchMovePos.y - this.body.position.y);
        if (stickPos.length() > this.radius) {
            stickPos.multiplyScalar(this.radius / stickPos.length());
        }
        this.stick.setPosition(stickPos.x, stickPos.y);

        this.input = stickPos.clone().normalize();
    }
}
