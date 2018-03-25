import { sendMessageToUser } from '../slack'
import { request } from './request'
import { processGetAllIssues, processGetMyIssues } from './intents/issues'
import { sendUserProjectConfirmation } from "../slack/interactions"

const dialogFlowProcessor = async (user, message) => {
    console.log('DIALOGFLOW PROCESSOR: \n user:', user,'\n message:', message)
    const dialogFlowResponse = await request(user, message)
    console.log('DIALOGFLOW RESULT: ', dialogFlowResponse)

    const { result } = dialogFlowResponse
    if (result.actionIncomplete) {
        await sendMessageToUser(user, result.fulfillment.speech)
    } else {

        if (result.metadata.intentName &&
            result.metadata.intentName.indexOf('Default') === -1 &&
            result.action.indexOf('smalltalk') === -1
        ) {
            const notLoggedIn = await processAndSendTextIfNotLoggedIng(message.channel, user)
            if (notLoggedIn) return

            const projectNotSelected = await processAndSendTextIfNotProjectSelected(message.channel, user)
            if (projectNotSelected) return
        }

        switch (result.metadata.intentName) {
            case 'issues.getAll': {
                const { contexts } = result
                console.log('CONTEXTS:', contexts)
                const { issue_state, issue_scope } = result.parameters
                const { gitlabUserId } = user

                const { attachments, text }  = await processGetAllIssues(user, { issue_state, issue_scope, gitlabUserId })
                console.log('PARAMETERS', text, issue_state, issue_scope, gitlabUserId)
                await sendMessageToUser(message.channel, text, attachments)
                break
            }

            case 'issues.getMines': {
                const { gitlabUserId } = user
                const { attachments, text }  = await processGetMyIssues(user,{ gitlabUserId })
                await sendMessageToUser(message.channel, text, attachments)
                break
            }

            case 'issues - context:issues.getAll - comment:issue_state': {
                const context = result.contexts[0]
                const { issue_state, issue_scope } = context.parameters

                const { attachments, text }  = await processGetAllIssues(user, { issue_state, issue_scope })
                await sendMessageToUser(message.channel, text, attachments)
                break
            }

            case 'issues - context:issues.getAll - comment:issue_scope': {
                const context = result.contexts[0]
                const { issue_state, issue_scope } = context.parameters

                const { attachments, text }  = await processGetAllIssues(user, { issue_state, issue_scope })
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

export const processAndSendTextIfNotLoggedIng = async (channel, user) => {
    const text = `Please first connect to Gitlab account by visiting http://localhost:3000/gitlab/auth/${user.slackId}`
    if (!user.gitlabUserId) {
        await sendMessageToUser(channel, text)
        return true
    }
    return false
}

export const processAndSendTextIfNotProjectSelected = async (channel, user) => {
    const text = `It seems that you don't have any gitlab project selected.`
    if (!user.gitlabProjectId) {
        await sendMessageToUser(channel, text)
        await sendUserProjectConfirmation(user)
        return true
    }
    return false
}

export { dialogFlowProcessor }