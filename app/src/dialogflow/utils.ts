import {User} from "../modules/user/entity"
import {sendMessageToUser} from "../slack/webClient"
import { SlackInteractions } from "../slack"

export default class DialogFlowUtils {

    public static async processAndSendTextIfNotLoggedIng (channel: string, user: User) {
        const loginMessage = `Please first connect to Gitlab account by visiting http://localhost:3000/gitlab/auth/${user.slackId}`
        const responseMessage = 'Please check your direct message with me to login with Gitlab first'

        if (!user.gitlabUserId) {
            if (user.slackDmId !== channel) {
                await sendMessageToUser(channel, responseMessage)
                await sendMessageToUser(user.slackDmId, loginMessage)
                return true
            } else {
                await sendMessageToUser(channel, loginMessage)
                return true
            }
        }
        return false
    }

    public static async processAndSendTextIfNotProjectSelected (channel: string, user: User) {
        const text = `It seems that you don't have any gitlab project selected.`
        if (!user.gitlabProjectId) {
            await sendMessageToUser(channel, text)
            await SlackInteractions.sendUserProjectConfirmation(user)
            return true
        }
        return false
    }
}