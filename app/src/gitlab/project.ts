import fetch from 'node-fetch'
import { config } from '../config'

const registerProjectWebhook = async (user) => {
    const { gitlab_access_token, gitlabProjectId } = user
    let uri: string = `https://gitlab.com/api/v4/projects/${gitlabProjectId}/hooks?access_token=${gitlab_access_token}`

    const body = {
        "id": gitlabProjectId,
        "url": `${config.HOST}/gitlab/hooks/${gitlabProjectId}`,
        "push_events": "true",
        "issues_events": "true",
        "confidential_issues_events": "true",
        "tag_push_events": "true",
        "note_events": "true",
        "job_events": "true",
        "pipeline_events": "true"
    }

    const res = await fetch(uri, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            'content-type': 'application/json'
        }
    })
    return await res.json()
}

export {
    registerProjectWebhook,
}