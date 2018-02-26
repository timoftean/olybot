import { sendMessageToUser } from '../slack'
import { request } from './request'
import { issuesGetAllProcess } from './intents'

const dialogFlowProcessor = async (user, message) => {
    console.log('DIALOGFLOW PROCESSOR: \n user:', user,'\n message:', message)
    const dialogFlowResponse = await request(user, message)
    console.log('DIALOGFLOW RESULT: ', dialogFlowResponse)

    const { result } = dialogFlowResponse
    if (result.actionIncomplete) {
        await sendMessageToUser(user, result.fulfillment.speech)
    } else {
        switch (result.metadata.intentName) {
            case 'issues.getAll': {
                console.log("getALL: " , result)
                await issuesGetAllProcess(user, result)
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