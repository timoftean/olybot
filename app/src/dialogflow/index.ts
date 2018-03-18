import { sendMessageToUser } from '../slack'
import { request } from './request'
import { processGetAllIssues, processGetMyIssues } from './intents/issues'

const dialogFlowProcessor = async (user, message) => {
    console.log('DIALOGFLOW PROCESSOR: \n user:', user,'\n message:', message)
    const dialogFlowResponse = await request(user, message)
    console.log('DIALOGFLOW RESULT: ', dialogFlowResponse, dialogFlowResponse.result.fulfillment.messages)

    const { result } = dialogFlowResponse
    if (result.actionIncomplete) {
        await sendMessageToUser(user, result.fulfillment.speech)
    } else {
        switch (result.metadata.intentName) {
            case 'issues.getAll': {
                const { attachments, text }  = await processGetAllIssues()
                await sendMessageToUser(message.channel, text, attachments)
                break
            }
            case 'issues.getMines': {
                const { attachments, text }  = await processGetMyIssues(user.gitlabUserId)
                await sendMessageToUser(message.channel, text, attachments)
                break
            }
            default: {
                // was not caught by a meaningful intent, just send speech
                await sendMessageToUser(message.channel, result.fulfillment.speech)
            }
        }
    }
}

export { dialogFlowProcessor }