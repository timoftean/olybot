import { Router } from 'express'
import { slackInteract } from '../controllers'

const router = Router()

router.get('/hello', (req, res) => {
    res.json({message: 'hello'})
})

router.post('/slack', slackInteract)

export { router }
