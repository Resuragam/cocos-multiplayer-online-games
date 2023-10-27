import { _decorator, resources, Asset } from 'cc';
import Singleton from '../Base/Singleton';

interface IItem {
    cb: Function;
    ctx: unknown;
}

export class NetWorkManager extends Singleton {
    static get Instance() {
        return super.GetInstance<NetWorkManager>();
    }

    ws: WebSocket;
    port: number = 9876;
    private map: Map<string, Array<IItem>> = new Map();

    connect() {
        return new Promise((resolve, reject) => {
            this.ws = new WebSocket(`ws://localhost:${this.port}`);
            this.ws.onopen = () => {
                resolve(true);
            };
            this.ws.onclose = () => {
                reject(false);
            };
            this.ws.onerror = (e) => {
                console.log(e);
                reject(false);
            };
            this.ws.onmessage = (e) => {
                try {
                    const json = JSON.parse(e.data);
                    const { name, data } = json;
                    if (this.map.has(name)) {
                        this.map.get(name).forEach(({ cb, ctx }) => {
                            cb.call(ctx, data);
                        });
                    }
                } catch (e) {
                    console.log(e.message);
                }
            };
        });
    }

    sendMsg(name: string, data) {
        const msg = {
            name,
            data,
        };
        this.ws.send(JSON.stringify(msg));
    }

    listenMsg(name: string, cb: Function, ctx: unknown) {
        if (this.map.has(name)) {
            this.map.get(name).push({ cb, ctx });
        } else {
            this.map.set(name, [{ cb, ctx }]);
        }
    }

    unlistenMsg(name: string, cb: Function, ctx: unknown) {
        if (this.map.has(name)) {
            const index = this.map.get(name).findIndex((i) => cb === i.cb && i.ctx === ctx);
            index > -1 && this.map.get(name).splice(index, 1);
        }
    }
}
