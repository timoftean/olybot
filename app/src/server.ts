import * as http from 'http'
import * as bodyParser from 'body-parser'
import * as cors from 'cors'
import * as express from 'express'
import * as methodOverride from 'method-override'
import * as morgan from 'morgan'
import * as mongoose from 'mongoose'

import { config } from './config'
import { router } from './routes'
import { startRTM } from './slack'

export class Server {

    private app: express.Application
    private server: http.Server

    constructor() {
        this.app = express()
        this.server = http.createServer(this.app)
    }

    public async start(): Promise<void> {
        try {
            //start bot
            startRTM()

            // setup server and routes
            this.setupExpress()

            // connect to mongodb
            await this.createMongooseConnection()

            // start server
            this.listen()
        } catch (E) {
            console.error(`Server  start error: ${E.message}`, E)
        }
    }

    private setupExpress(): void {
        this.app.use(bodyParser.urlencoded({extended: true}))
        this.app.use(bodyParser.json({ limit: '50mb'} ))
        this.app.use(methodOverride())
        this.app.use(router)

        this.app.use((req, res, next): void => {
            res.header('Access-Control-Allow-Origin', '*')
            res.header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization')
            res.header('Access-Control-Allow-Methods', 'GET,PUT,PATCH,POST,DELETE,OPTIONS')
            next()
        })

        this.app.use(morgan('combined'))
        this.app.use(cors())
    }

    private async createMongooseConnection () {
        const port = config.MONGODB.PORT
        const server = config.MONGODB.SERVER
        const dbName = config.MONGODB.DATABASE
        const uri = `mongodb://${server}:${port}/${dbName}`
        mongoose.connect(uri)

        const connection = mongoose.connection
        connection.on('error', (error) => {
            console.log("MONGO CONNECTION ERROR: ", error)
        })
        connection.once('open', () => {
            console.log("CONNECTED")
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
