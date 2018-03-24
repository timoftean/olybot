import { UserModel } from '../modules/user/entity'

export const gitlabAuth = (accessToken, refreshToken, profile, cb) => {
    profile.access_token = accessToken
    return cb(null, profile)
}

export const gitlabCallback = async (req, res) => {
    console.log("callback-successfully authenticated, user", req.user)
    const { state } = req.query
    const { access_token, id, username } = req.user
    await UserModel.findOneAndUpdate(
        { slackId: state },
        {
            gitlab_access_token: access_token,
            gitlabUserId: id,
            gitlabUsername: username
        }
    )
    res.send(`gitlab account confirmed for user ${username}`)
}