import { sendMessageToUser } from '../slack'
import { request } from './request'
import { processGetAllIssues } from './intents/issues'

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
                console.log(`getALL: user-${user}, result-${result}`)
                const { attachments, text }  = await processGetAllIssues()
                console.log('ISSUES PROCESSED:', text, attachments)
                await sendMessageToUser(message.channel, text, attachments)
                break
            }
            case 'meeting.add': {
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