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
    const { assignees, closed_at, state } = changes
    const { action, iid, title } = object_attributes
    let text = ''

    if (headers['x-gitlab-event'] === 'Issue Hook') {
        const users: User[] = await userController.findAll({ gitlabProjectId: projectId })
        console.log('USERSL', users)
        users.map((usr: User) => {

            // skip the user who made the action
            if (username === usr.gitlabUsername) return

            text += `Hey ${usr.displayName}, ${name} @${username} `

            if (action === 'update') {
                if (assignees.current.length !== 0) {
                    text += 'assigned to '
                    assignees.current.map((u: GitlabUser) => {
                        text += `@${u.username} `
                    })
                }

                if (assignees.current.length !== 0 && assignees.previous.length !== 0){
                    text += 'and '
                }

                if (assignees.previous.length !== 0) {
                    text += 'unassigned '
                    assignees.previous.map((u: GitlabUser) => {
                        text += `@${u.username} `
                    })
                }
            }
            text += `the issue number ${iid}: ${title}`

            sendMessageToUser(usr.slackDmId, text)
        })
        // todo: add issue close

    }

    res.json({ok:true})

}