import * as fs from 'fs'
import * as dotenv from 'dotenv'

let envConfig = null
if (process.env.NODE_ENV === 'test') {
    envConfig = dotenv.parse(fs.readFileSync('.env.test'))
} else if (process.env.NODE_ENV === 'production') {
    envConfig = dotenv.parse(fs.readFileSync('.env.production'))
} else {
    envConfig = dotenv.parse(fs.readFileSync('.env'))
}

for (const k in envConfig) {
    if (k) {
        process.env[k] = envConfig[k]
    }
}

import { Server } from './server'
new Server().start()
