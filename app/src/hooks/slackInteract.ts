import { UserModel } from "../modules/user/entity"
import { registerProjectWebhook } from "../gitlab/project"

export const slackInteract = async (req, res) => {
    const payload = JSON.parse(req.body.payload)
    const { callback_id, user, actions } = payload
    const action = actions[0]
    console.log("PAYLOAD:", payload)
    console.log('fullfilment: ', user, callback_id, action)
    switch (callback_id) {
        case 'confirm_project': {
            const updatedUser = await UserModel.findOneAndUpdate(
                {slackId: user.id},
                {
                    gitlabProjectId: action.value,
                    isGitlabSubscribed: true
                },
                {new: true})

            //register webhook for project
            await registerProjectWebhook(updatedUser)

            res.send(`Project confirmed ✅`)
            break
        }
        default: {
            console.error('POST to /slackInteract had an unknown callback_id.')
        }
    }

}