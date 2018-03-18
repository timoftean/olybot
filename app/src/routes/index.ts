import * as passport from 'passport'
import { Router } from 'express'
import { slackInteract, gitlabHook } from '../middlewares'

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
router.get('/gitlab/auth/:userId', (req, res, next) => {
    const { userId } = req.params
    console.log("USERID:", userId)
    // req.session.userId = userId
    next()
}, passport.authenticate('gitlab'))

router.get('/auth/gitlab/callback',
    passport.authenticate('gitlab', {
        failureRedirect: '/login'
    }),
    (req, res) => {
        console.log("callback-successfully authenticated, user", req.user)
        res.send('gitlab account confirmed')
    })

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
