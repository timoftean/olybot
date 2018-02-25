import { Router } from 'express'
import { slackInteract } from '../middlewares'

const router = Router()

router.get('/hello', (req, res) => {
    res.json({message: 'hello'})
})

router.post('/slack', slackInteract)

export { router }
