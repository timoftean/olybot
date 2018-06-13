import * as passport from 'passport'
import * as express from 'express'
import { Router } from 'express'
import { slackInteract, gitlabHook } from '../hooks'
import { gitlabCallback } from '../hooks/gitlabAuthCallback'
import { AuthenticateOptions } from "passport"

const router = Router()

// ------------
//  test route |
// ------------
router.get('/hello', (req, res) => {
    res.send(`Hello! Here is Oly :)`)
})

// ------------
// gitlab auth|
// ------------

interface AuthenticateOpts extends AuthenticateOptions {
    state: string
}

router.get('/gitlab/auth/:userId', (req: express.Request, res: express.Response) => {
    const { userId } = req.params
    passport.authenticate('gitlab', {
        state: userId,
        scope: ['api']
    } as AuthenticateOpts)(req, res)
})

router.get('/auth/gitlab/callback',
    passport.authenticate('gitlab', {
        failureRedirect: '/login'
    }), gitlabCallback )

router.get('/login', (req: express.Request, res: express.Response) => res.send('unauthenticated'))

// -------------
// slack webhook|
// -------------
router.post('/slackInteract', slackInteract)

//  ----------------------
// gitlab project webhook|
// -----------------------
router.post('/gitlab/hooks/:projectId', gitlabHook)

export { router }
