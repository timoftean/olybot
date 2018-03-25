import { UserModel } from '../modules/user/entity'
import {sendMessageObj, sendMessageToUser} from "../slack/webClient";
import {getUserProjects} from "../gitlab/user";

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
        },
        { new: true}
    )
    sendMessageToUser(user.slackDmId, 'Successfully integrated with Gitlab!')

    const projects = await getUserProjects(user)
    let actions = []
    console.log('PROJECTS:', projects)
    projects.map(p => {
        actions.push({
            name: p.id,
            text: p.name,
            type: 'button',
            style: 'primary',
            value: 'selected',
        })
    })
    sendMessageObj(
        user.slackDmId,
        { // begin attachment object
            attachments: [{
                callback_id: 'confirm_project',
                text: `Please confirm on which project you want to work from now on.`,
                fallback: 'Project confirmation',
                attachment_type: 'default',
                actions: actions,
            }],
        }
    );


    res.send('Successfully integrated with Gitlab!')
}