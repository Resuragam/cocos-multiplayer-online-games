import { WebSocketServer, WebSocket } from 'ws';
import { Connection } from './Connection';

export class MyServer {
    port: number;
    wss: WebSocketServer;

    connections: Set<Connection> = new Set();

    constructor({ port }: { port: number }) {
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
                console.log('people connected', this.connections.size)

                connection.on('close', () => {
                    this.connections.delete(connection);
                    console.log('people disconnected', this.connections.size)
                });
            });
        });
    }
}
