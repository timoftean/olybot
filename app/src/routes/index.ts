import * as passport from 'passport'
import { Router } from 'express'
import { slackInteract, gitlabHook } from '../hooks'
import { gitlabCallback } from '../hooks/gitlabAuth'
import {gitlabUserProjects} from "../hooks/gitlabProjects";

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
        state: userId,
        scope: ['api']
    })(req, res)
})

router.get('/auth/gitlab/callback',
    passport.authenticate('gitlab', {
        failureRedirect: '/login',
        scope: ['api']
    }), gitlabCallback )

router.get('/login', (req, res) => res.send('unauthenticated'))

router.get('/gitlab/userProjects/:gitlabUserId', gitlabUserProjects)
//-------------
//slack webhook|
//-------------
router.post('/slackInteract', slackInteract)

// ----------------------
//gitlab project webhook|
//-----------------------
router.post('/gitlab/hooks/:projectId', gitlabHook)


export { router }
