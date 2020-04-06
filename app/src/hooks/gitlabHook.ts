import { Response, Request } from 'express'

import { userController } from '../modules/user/controller'
import { sendMessageToUser } from '../slack'
import { GitlabUser } from "../@types"
import { User } from "../modules/user/entity"

export const gitlabHook = async (req: Request, res: Response) => {
    console.log('GITLAB HOOKS:', req.params.projectId, req.headers, req.body)
    const { projectId } = req.params
    const { headers, body } = req
    const { changes, object_attributes, user } = body
    const { name, username } = user
    const { assignees, title: changedTitle, labels } = changes
    const { action, iid, title } = object_attributes
    let text = ''

    if (headers['x-gitlab-event'] === 'Issue Hook') {
        const users: User[] = await userController.findAll({ gitlabProjectId: projectId })
        console.log('USERSL', users)
        text = ''
        users.map((usr: User) => {

            // skip the user who made the action
            if (username === usr.gitlabUsername || !changes) return
            text = `Hey ${usr.displayName}, ${name}(@${username}) `

            switch (action) {
                case 'update':
                    if (assignees) {
                        // the asignee was changed
                        if (assignees.current.length !== 0) {
                            text += 'assigned to '
                            assignees.current.map((u: GitlabUser) => {
                                text += `@${u.username} `
                            })
                        }

                        if (assignees.current.length !== 0 && assignees.previous.length !== 0) {
                            text += 'and '
                        }

                        if (assignees.previous.length !== 0) {
                            text += 'unassigned '
                            assignees.previous.map((u: GitlabUser) => {
                                text += `@${u.username} `
                            })
                        }
                        text += `the issue #${iid}: ${title}`
                    } else if (changedTitle) {
                        // the title was change
                        text += `updated the title of issue  #${iid} from `
                            + `"${changedTitle.previous}" to "${changedTitle.current}"`
                    } else {
                        return
                    }
                    break
                case 'close':
                    text += `closed issue #${iid}`
                    break
                case 'reopen':
                    text += `opened issue #${iid}`
                    break
                case 'open':
                    text += `created issue #${iid}: ${title}`
                    break
                default:
                    console.log(`UNHANDLED ACTION TYPE ${action}`)
                    return
            }

            sendMessageToUser(usr.slackDmId, text)
        })
    }

    res.json({ok:true})
}
