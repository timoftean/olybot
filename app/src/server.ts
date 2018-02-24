import * as http from 'http'
import * as bodyParser from 'body-parser'
import * as cors from 'cors'
import * as express from 'express'
import * as methodOverride from 'method-override'
import * as morgan from 'morgan'
import { config } from "./config"

export class Server {

    private app: express.Application
    private server: http.Server

    constructor() {
        this.app = express()
        this.server = http.createServer(this.app)
    }

    public async start(): Promise<void> {
        try {
            this.setupExpress()
            this.listen()
        } catch (E) {
            console.error(`Server  start error: ${E.message}`, E)
        }
    }

    private setupExpress(): void {
        this.app.use(bodyParser.urlencoded({extended: true}))
        this.app.use(bodyParser.json({ limit: '50mb'} ))
        this.app.use(methodOverride())

        this.app.use((req, res, next): void => {
            res.header('Access-Control-Allow-Origin', '*')
            res.header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization')
            res.header('Access-Control-Allow-Methods', 'GET,PUT,PATCH,POST,DELETE,OPTIONS')
            next()
        })

        this.app.use(morgan('combined'))
        this.app.use(cors())

        this.app.get('/hello', (req, res) => {
            res.json({message: 'hello'})
        })
    }

    private listen() {
        const port: number = config.PORT
        this.server.listen(port)

        this.server.on("error", (error: any) => {
            if (error.syscall !== "listen") {
                throw error
            }

            const bind = typeof port === "string"
                ? "Pipe " + port
                : "Port " + port

            switch (error.code) {
                case "EACCES":
                    console.error(bind + " requires elevated privileges")
                    process.exit(1)
                    break
                case "EADDRINUSE":
                    console.error(bind + " is already in use")
                    process.exit(1)
                    break
                default:
                    throw error
            }
        })

        this.server.on("listening", () => {

            const addr = this.server.address()
            const bind = typeof addr === "string"
                ? "pipe " + addr
                : "port " + addr.port
            console.log('HTTP API listening on PORT ' + addr.port + '\n')
        })
    }

}
