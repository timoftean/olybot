const dotenv = require('dotenv')
const result = dotenv.config()
if (result.error) {
    throw result.error
}

import { Server } from './server'
new Server().start()
