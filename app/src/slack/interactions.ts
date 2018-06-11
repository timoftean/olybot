import { GitlabUser } from "../gitlab"
import { sendMessageObj } from "./webClient"
import { User } from "../modules/user/entity"
import { Project } from '../@types'

export default class SlackInteractions {
    public static async sendUserProjectConfirmation (user: User) {
        const projects = await GitlabUser.getUserProjects(user)
        let actions: any[] = []

        projects.map((project: Project) => {
            actions.push({
                text: project.name,
                type: 'button',
                style: 'primary',
                name: project.name,
                value: project.id,
                confirm: {
                    title: `Are you sure you want to work on ${project.name} ?`,
                    text: "You will also be subscribed to receive notifications when changes on project occur.",
                    ok_text: "Yes, of course.",
                    dismiss_text: "Not now, thanks."
                }
            })
        })

        sendMessageObj(
            { // begin attachment object
                channel: user.slackDmId,
                text: 'Project confirmation',
                attachments: [{
                    callback_id: 'confirm_project',
                    text: `Please confirm on which project you want to work from now on.`,
                    fallback: 'Project confirmation',
                    attachment_type: 'default',
                    actions: actions
                }]
            }
        )
    }
}
