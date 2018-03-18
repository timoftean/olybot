import { sendMessageToUser } from '../slack'
import { request } from './request'
import { processGetAllIssues, processGetMyIssues } from './intents/issues'

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
                const { contexts } = result
                console.log('CONTEXTS:', contexts)
                const { issue_state, issue_scope } = result.parameters
                const { gitlabUserId } = user

                const { attachments, text }  = await processGetAllIssues({ issue_state, issue_scope, gitlabUserId })
                console.log('PARAMETERS', text, issue_state, issue_scope, gitlabUserId)
                await sendMessageToUser(message.channel, text, attachments)
                break
            }

            case 'issues.getMines': {
                const { gitlabUserId } = user
                const { attachments, text }  = await processGetMyIssues({ gitlabUserId })
                await sendMessageToUser(message.channel, text, attachments)
                break
            }

            case 'issues - context:issues.getAll - comment:issue_state': {
                const context = result.contexts[0]
                const { issue_state, issue_scope } = context.parameters

                const { attachments, text }  = await processGetAllIssues({ issue_state, issue_scope })
                await sendMessageToUser(message.channel, text, attachments)
                break
            }

            case 'issues - context:issues.getAll - comment:issue_scope': {
                const context = result.contexts[0]
                const { issue_state, issue_scope } = context.parameters
                
                const { attachments, text }  = await processGetAllIssues({ issue_state, issue_scope })
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