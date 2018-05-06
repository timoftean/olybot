import * as passport from 'passport'
import * as express from 'express'
import { Router } from 'express'
import { slackInteract, gitlabHook } from '../hooks'
import { gitlabCallback } from '../hooks/gitlabAuthCallback'
import { AuthenticateOptions } from "passport"

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

interface Authenticate extends AuthenticateOptions {
    state: string
}

router.get('/gitlab/auth/:userId', (req: express.Request, res: express.Response) => {
    const { userId } = req.params
    passport.authenticate('gitlab', <Authenticate>{
        state: userId,
        scope: ['api']
    })(req, res)
})

router.get('/auth/gitlab/callback',
    passport.authenticate('gitlab', {
        failureRedirect: '/login',
        scope: ['api']
    }), gitlabCallback )

router.get('/login', (req: express.Request, res: express.Response) => res.send('unauthenticated'))

//-------------
//slack webhook|
//-------------
router.post('/slackInteract', slackInteract)

// ----------------------
//gitlab project webhook|
//-----------------------
router.post('/gitlab/hooks/:projectId', gitlabHook)


export { router }
