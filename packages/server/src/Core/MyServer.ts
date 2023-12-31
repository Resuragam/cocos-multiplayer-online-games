import { WebSocketServer, WebSocket } from 'ws';
import { Connection } from './Connection';
import { ApiMsgEnum, IModel } from '../Common';
import { EventEmitter } from 'stream';

export class MyServer extends EventEmitter {
    port: number;
    wss: WebSocketServer;

    apiMap: Map<ApiMsgEnum, Function> = new Map();
    connections: Set<Connection> = new Set();

    constructor({ port }: { port: number }) {
        super();
        this.port = port;
    }

    start() {
        return new Promise((resolve, reject) => {
            this.wss = new WebSocketServer({
                port: this.port,
            });

            this.wss.on('listening', () => {
                resolve(true);
            });
            this.wss.on('close', () => {
                reject(false);
            });
            this.wss.on('error', (e) => {
                reject(e);
            });
            this.wss.on('connection', (ws: WebSocket) => {
                const connection = new Connection(this, ws);
                this.connections.add(connection);
                this.emit('connection', connection);

                connection.on('close', () => {
                    this.connections.delete(connection);
                    this.emit('disconnection', connection);
                });
            });
        });
    }

    setApi<T extends keyof IModel['api']>(name: T, cb: (connection: Connection, args: IModel['api'][T]['req']) => void) {
        this.apiMap.set(name, cb);
    }
}
