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
                    console.log('onmessage', e.data);
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

    sendMsg(data) {
        this.ws.send(data);
    }

    listenMsg(name: string, cb: Function, ctx: unknown) {
        if (this.map.has(name)) {
            this.map.get(name).push({ cb, ctx });
        } else {
            this.map.set(name, [{ cb, ctx }]);
        }
    }
}
