import { RTMClient } from '@slack/client'
import { userController } from '../modules/user/controller'
import { config } from '../config'
import { dialogFlowProcessor } from '../dialogflow'

const botToken = config.SLACK.BOT_ACCESS_TOKEN
const rtm = new RTMClient(botToken)

rtm.on('authenticated', (rtmStartData) => {
    console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}!`)
})

rtm.on('message', async (message) => {
    try {
        // Skip messages that are from a bot or my own user ID
        if ( (message.subtype && message.subtype === 'bot_message') ||
            (!message.subtype && message.user === rtm.activeUserId) ) {
            return
        }
        console.log(`(channel:${message.channel}) ${message.user} says: ${message.text}`);

        let user = await userController.findOneOrCreateWithSlackId({ slackId: message.user })
        if (!user.slackDmId) {
            user.slackDmId = message.channel
            user = await user.save()
        }
        // console.log("USER:", user)
        await dialogFlowProcessor(user, message);
    } catch (error) {
        console.log('CANNOT PROCESS SLACK MESSAGE: ', error)
    }
})

export const startRTM = () => {
    rtm.start({})
}