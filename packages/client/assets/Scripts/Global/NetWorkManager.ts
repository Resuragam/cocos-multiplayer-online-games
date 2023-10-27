import { _decorator, resources, Asset } from 'cc';
import Singleton from '../Base/Singleton';

interface IItem {
    cb: Function;
    ctx: unknown;
}

interface ICallApiRet {
    success: boolean;
    res?: any;
    error?: Error;
}

export class NetWorkManager extends Singleton {
    static get Instance() {
        return super.GetInstance<NetWorkManager>();
    }

    isConnected: boolean;
    ws: WebSocket;
    port: number = 9876;
    private map: Map<string, Array<IItem>> = new Map();

    connect() {
        return new Promise((resolve, reject) => {
            if (this.isConnected) {
                resolve(true);
                return;
            }
            this.ws = new WebSocket(`ws://localhost:${this.port}`);
            this.ws.onopen = () => {
                this.isConnected = true;
                resolve(true);
            };
            this.ws.onclose = () => {
                this.isConnected = false;
                reject(false);
            };
            this.ws.onerror = (e) => {
                this.isConnected = false;
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

    callApi(name: string, data: any): Promise<ICallApiRet> {
        return new Promise((resolve) => {
            try {
                let timer = setTimeout(() => {
                    resolve({ success: false, error: new Error('Time out!') });
                    this.unlistenMsg(name, cb, null);
                }, 5000);
                const cb = (res) => {
                    resolve(res);
                    clearTimeout(timer);
                    this.unlistenMsg(name, cb, null);
                };
                this.listenMsg(name, cb, this);
                this.sendMsg(name, data);
            } catch (error) {
                resolve({
                    success: false,
                    error,
                });
            }
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
