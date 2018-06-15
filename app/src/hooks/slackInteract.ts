import { Request, Response } from 'express'
import { UserModel } from "../modules/user/entity"
import { GitlabProject } from "../gitlab"

export const slackInteract = async (req: Request, res: Response) => {
    const payload = JSON.parse(req.body.payload)
    const { callback_id, user, actions } = payload
    const action = actions[0]

    switch (callback_id) {
        case 'confirm_project': {
            const updatedUser = await UserModel.findOneAndUpdate(
                {slackId: user.id},
                {
                    gitlabProjectId: action.value,
                    isGitlabSubscribed: true
                },
                {new: true}
            )

            // register webhook for project
            await GitlabProject.registerProjectWebhook(updatedUser)

            res.send(`Project confirmed ✅`)
            break
        }
        default: {
            console.error('POST to /slackInteract had an unknown callback_id.')
        }
    }

}
