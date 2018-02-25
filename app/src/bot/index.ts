import { RtmClient, CLIENT_EVENTS, RTM_EVENTS } from '@slack/client'
import { userController } from '../modules/user/controller'
import { config } from '../config'


const botToken = config.SLACK.BOT_ACCESS_TOKEN
const rtm = new RtmClient(botToken)

rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (rtmStartData) => {
    console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}!`)
})

rtm.on(RTM_EVENTS.MESSAGE, async (message) => {
    console.log("MESSAGE: ", message)
    if (message.bot_id || message.subtype === 'message_changed') {
        // ignoring bot messages
        return;
    }

    let user = await userController.findOneOrCreateWithSlackId({ slackId: message.user })
    if (!user.slackDmId) {
        user.slackDmId = message.channel
        user = await user.save()
    }
    console.log("USER:", user)
})

export const startRTM = () => {
    rtm.start()
}