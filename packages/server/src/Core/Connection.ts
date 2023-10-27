import { EventEmitter } from 'stream';
import { MyServer } from './MyServer';
import { WebSocket } from 'ws';

interface IItem {
    cb: Function;
    ctx: unknown;
}

export class Connection extends EventEmitter {
    private msgMap: Map<string, Array<IItem>> = new Map();

    constructor(private servere: MyServer, private ws: WebSocket) {
        super();
        this.ws.on('close', () => {
            this.emit('close');
        });

        this.ws.on('message', (buffer: Buffer) => {
            const str = buffer.toString();
            try {
                const msg = JSON.parse(str);
                const { name, data } = msg;
                const { frameId, input } = data;
            } catch (error) {
                console.log(error.message);
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
        if (this.msgMap.has(name)) {
            this.msgMap.get(name).push({ cb, ctx });
        } else {
            this.msgMap.set(name, [{ cb, ctx }]);
        }
    }

    unlistenMsg(name: string, cb: Function, ctx: unknown) {
        if (this.msgMap.has(name)) {
            const index = this.msgMap.get(name).findIndex((i) => cb === i.cb && i.ctx === ctx);
            index > -1 && this.msgMap.get(name).splice(index, 1);
        }
    }
}
