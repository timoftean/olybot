import { sendMessageToUser } from '../slack'
import { request } from './request'
import { processGetIssues,
    processCreateIssues,
    processSetIssueLabel,
    processAddAsignee,
    processRemoveAsignee,
    processRemoveIssueLabel,
    processCloseIssue,
    processReopenIssue
} from './intents/issues'
import { userController } from '../modules/user/controller'
import { User } from '../modules/user/entity'
import DialogFlowUtils from "./utils"

export default class DialogflowProcessor {

    public static async processMessage(user: User, message: any) {
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
                const notLoggedIn = await DialogFlowUtils.processAndSendTextIfNotLoggedIng(message.channel, user)
                if (notLoggedIn) return

                const projectNotSelected = await DialogFlowUtils.processAndSendTextIfNotProjectSelected(message.channel, user)
                if (projectNotSelected) return
            }

            switch (result.metadata.intentName) {
                case 'issues.getAll': {
                    const { issue_state, issue_scope } = result.parameters
                    const { gitlabUserId } = user
                    await sendMessageToUser(message.channel, 'wait a moment :)')
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
                    await sendMessageToUser(message.channel, 'wait a sec')
                    const { attachments, text }  = await processGetIssues(user, { issue_state, issue_scope })
                    await sendMessageToUser(message.channel, text, attachments)
                    break
                }

                case 'issues - context:issues.getAll - comment:issue_scope': {
                    const context = result.contexts[0]
                    const { issue_state, issue_scope } = context.parameters
                    await sendMessageToUser(message.channel, 'just a sec')
                    const { attachments, text }  = await processGetIssues(user, { issue_state, issue_scope })
                    await sendMessageToUser(message.channel, text, attachments)
                    break
                }

                case 'issues.create': {
                    const { issue_title } = result.parameters
                    await sendMessageToUser(message.channel, 'alright :)')
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

                case 'issues.removeLabel': {
                    const { issue_number, issue_label } = result.parameters
                    await sendMessageToUser(message.channel, 'sure :)')
                    const text  = await processRemoveIssueLabel(user, { issue_number, issue_label })
                    await sendMessageToUser(message.channel, text)
                    break
                }

                case 'issues.addAsignee': {
                    const { issue_number, user_slack_id } = result.parameters
                    const asignee = await userController.find({slackId: user_slack_id})

                    if (!asignee || !(asignee.gitlabProjectId && asignee.gitlabUserId) ) {
                        await sendMessageToUser(message.channel, 'cannot assign issue: assignee must be signed in with gitlab ')
                        break
                    }

                    await sendMessageToUser(message.channel, 'wait a moment')
                    const text  = await processAddAsignee(user, { issue_number, asignee })
                    await sendMessageToUser(message.channel, text)
                    break
                }

                case 'issues.removeAsignee': {
                    const { issue_number, user_slack_id } = result.parameters
                    const asignee = await userController.find({slackId: user_slack_id})

                    if (!asignee || !(asignee.gitlabProjectId && asignee.gitlabUserId) ) {
                        await sendMessageToUser(message.channel, 'cannot unassign: assignee must be signed in with gitlab ')
                        break
                    }
                    await sendMessageToUser(message.channel, 'right now')
                    const text  = await processRemoveAsignee(user, { issue_number, asignee })
                    await sendMessageToUser(message.channel, text)
                    break
                }

                case 'issues.close': {
                    const { issue_number } = result.parameters
                    await sendMessageToUser(message.channel, 'wait a moment')
                    const text  = await processCloseIssue(user, { issue_number })
                    await sendMessageToUser(message.channel, text)
                    break
                }

                case 'issues.reopen': {
                    const { issue_number } = result.parameters
                    await sendMessageToUser(message.channel, 'right now')
                    const text  = await processReopenIssue(user, { issue_number })
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
}
