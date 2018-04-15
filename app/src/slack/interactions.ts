import { getUserProjects } from "../gitlab/user"
import { sendMessageObj } from "./webClient"

export const sendUserProjectConfirmation = async (user) => {
    const projects = await getUserProjects(user)
    let actions = []

    projects.map(project => {
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