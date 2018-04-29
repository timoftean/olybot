import { sendMessageToUser } from '../slack'
import { request } from './request'
import { processGetIssues, processCreateIssues } from './intents/issues'
import { processGetIssues,
    processCreateIssues,
    processSetIssueLabel,
    processAddAsignee,
    processRemoveAsignee
} from './intents/issues'
import { sendUserProjectConfirmation } from "../slack/interactions"
import { userController } from '../modules/user/controller'

const dialogFlowProcessor = async (user, message) => {
    console.log('DIALOGFLOW PROCESSOR: \n user:', user,'\n message:', message)
    const dialogFlowResponse = await request(user, message)
    console.log('DIALOGFLOW RESULT: ', dialogFlowResponse)

    const { result } = dialogFlowResponse
    if (result.actionIncomplete) {
        await sendMessageToUser(message.channel, result.fulfillment.speech)
    } else {

        //allow user smalltalk and welcome messages before asking to login or select project
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
                const { issue_state, issue_scope } = result.parameters
                const { gitlabUserId } = user

                const { attachments, text }  = await processGetIssues(user, { issue_state, issue_scope, gitlabUserId })
                console.log('PARAMETERS', text, issue_state, issue_scope, gitlabUserId)
                await sendMessageToUser(message.channel, text, attachments)
                break
            }

            case 'issues.getAssignedToMe': {
                const { attachments, text }  = await processGetIssues(user,{ issue_scope: 'assigned to me', issue_state: 'opened' })
                await sendMessageToUser(message.channel, text, attachments)
                break
            }

            case 'issues - context:issues.getAll - comment:issue_state': {
                const context = result.contexts[0]
                const { issue_state, issue_scope } = context.parameters

                const { attachments, text }  = await processGetIssues(user, { issue_state, issue_scope })
                await sendMessageToUser(message.channel, text, attachments)
                break
            }

            case 'issues - context:issues.getAll - comment:issue_scope': {
                const context = result.contexts[0]
                const { issue_state, issue_scope } = context.parameters

                const { attachments, text }  = await processGetIssues(user, { issue_state, issue_scope })
                await sendMessageToUser(message.channel, text, attachments)
                break
            }

            case 'issues.create': {
                const { issue_title } = result.parameters

                const text  = await processCreateIssues(user, { issue_title })
                await sendMessageToUser(message.channel, text)
                break
            }

            case 'issues.setLabel': {
                const { issue_number, issue_label } = result.parameters
                await sendMessageToUser(message.channel, 'alright :)')
                const text  = await processSetIssueLabel(user, { issue_number, issue_label })
                await sendMessageToUser(message.channel, text)
                break
            }

            case 'issues.addAsignee': {
                const { issue_number, user_slack_id } = result.parameters
                const asignee = await userController.find({slackId: user_slack_id})
                console.log('ASIGNEE:', user_slack_id, asignee)
                if (!asignee || !(asignee.gitlabProjectId && asignee.gitlabUserId) ) {
                    await sendMessageToUser(message.channel, 'cannot assign issue: assignee must be signed in with gitlab ')
                    break
                }

                await sendMessageToUser(message.channel, 'wait a moment')
                const text  = await processAddAsignee(user, { issue_number, asignee })
                await sendMessageToUser(message.channel, text)
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
        // todo: send direct message to auth
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