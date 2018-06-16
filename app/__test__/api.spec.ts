import { expect, assert } from 'chai'
import * as request from 'supertest'
import { Server } from '../src/server'

describe('/api', () => {

    describe('GET /hello', () => {

        it('hello works', async () => {
            request(new Server().app)
                .get('/hello')
                .expect('Content-Type', 'application/json; charset=utf-8')
                .expect('Content-Length', '32')
        })
    })
})
