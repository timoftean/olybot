import { UserModel } from '../modules/user/entity'
import {sendMessageToUser} from "../slack/webClient";

export const gitlabAuth = (accessToken, refreshToken, profile, cb) => {
    console.log('ACCESS_TOKEN:', accessToken,)
    console.log('REFRESH_TOKEN:', refreshToken)
    console.log('PROFILE:', profile)
    profile.access_token = accessToken
    return cb(null, profile)
}

export const gitlabCallback = async (req, res) => {
    console.log("callback-successfully authenticated, user", req.user)
    const { state } = req.query
    const { access_token, id, username } = req.user
    const user = await UserModel.findOneAndUpdate(
        { slackId: state },
        {
            gitlab_access_token: access_token,
            gitlabUserId: id,
            gitlabUsername: username
        }
    )
    sendMessageToUser(user.slackDmId, 'Successfully integrated with Gitlab!')
    
    res.send(`gitlab account confirmed for user ${username}`)
}