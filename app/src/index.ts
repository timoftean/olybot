import * as dotenv from 'dotenv'
const result = dotenv.config()
if (result.error) {
    throw result.error
}

import { Server } from './server'
new Server().start()
