import * as express from 'express'
import {UserModel} from '../modules/user/entity'
import { sendMessageToUser } from "../slack/webClient"
import { SlackInteractions } from "../slack"

export const gitlabCallback = async (req: express.Request, res: express.Response) => {
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

    // tell the user he is already integrated with gitlab
    sendMessageToUser(user.slackDmId, 'Successfully integrated with Gitlab!')

    // ask the user on which project he wants to work
    SlackInteractions.sendUserProjectConfirmation(user)

    res.send('Successfully integrated with Gitlab!')
}
