import { _decorator, resources, Asset } from 'cc';
import Singleton from '../Base/Singleton';
import { ApiMsgEnum, IModel, strdecode, strencode } from '../Common';
import { binaryDecode, binaryEncode } from '../Common/Binary';

interface IItem {
    cb: Function;
    ctx: unknown;
}

interface ICallApiRet<T> {
    success: boolean;
    res?: T;
    error?: Error;
}

export class NetWorkManager extends Singleton {
    static get Instance() {
        return super.GetInstance<NetWorkManager>();
    }

    isConnected: boolean;
    ws: WebSocket;
    port: number = 9878;
    private map: Map<ApiMsgEnum, Array<IItem>> = new Map();

    connect() {
        return new Promise((resolve, reject) => {
            if (this.isConnected) {
                resolve(true);
                return;
            }
            this.ws = new WebSocket(`ws://localhost:${this.port}`);
            this.ws.binaryType = 'arraybuffer';
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
                    const json = binaryDecode(e.data);
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

    callApi<T extends keyof IModel['api']>(name: T, data: IModel['api'][T]['req']): Promise<ICallApiRet<IModel['api'][T]['res']>> {
        return new Promise((resolve) => {
            try {
                let timer = setTimeout(() => {
                    resolve({ success: false, error: new Error('Time out!') });
                    this.unlistenMsg(name as any, cb, null);
                }, 5000);
                const cb = (res) => {
                    resolve(res);
                    clearTimeout(timer);
                    this.unlistenMsg(name as any, cb, null);
                };
                this.listenMsg(name as any, cb, this);
                this.sendMsg(name as any, data);
            } catch (error) {
                resolve({
                    success: false,
                    error,
                });
            }
        });
    }

    async sendMsg<T extends keyof IModel['msg']>(name: T, data: IModel['msg'][T]) {
        const msg = {
            name,
            data,
        };
        const da = binaryEncode(name, data);
        this.ws.send(da.buffer);
    }

    listenMsg<T extends keyof IModel['msg']>(name: T, cb: (args: IModel['msg'][T]) => void, ctx: unknown) {
        if (this.map.has(name)) {
            this.map.get(name).push({ cb, ctx });
        } else {
            this.map.set(name, [{ cb, ctx }]);
        }
    }

    unlistenMsg<T extends keyof IModel['msg']>(name: T, cb: (args: IModel['msg'][T]) => void, ctx: unknown) {
        if (this.map.has(name)) {
            const index = this.map.get(name).findIndex((i) => cb === i.cb && i.ctx === ctx);
            index > -1 && this.map.get(name).splice(index, 1);
        }
    }
}
