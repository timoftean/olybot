import * as passport from 'passport'
import { Router } from 'express'
import { slackInteract, gitlabHook } from '../hooks'
import { gitlabCallback } from '../hooks/gitlabAuth'

const router = Router()

//------------
// test route |
//------------
router.get('/hello', (req, res) => {
    res.json({message: 'hello'})
})

//------------
//gitlab auth|
//------------
router.get('/gitlab/auth/:userId', (req, res) => {
    const { userId } = req.params
    passport.authenticate('gitlab', {
        state: userId
    })(req, res)
})

router.get('/auth/gitlab/callback',
    passport.authenticate('gitlab', {
        failureRedirect: '/login'
    }), gitlabCallback )

router.get('/login', (req, res) => res.send('unauthenticated'))

//-------------
//slack webhook|
//-------------
router.post('/slack', slackInteract)

// ----------------------
//gitlab project webhook|
//-----------------------
router.post('/gitlab/hooks/:projectId', gitlabHook)


export { router }
