import fetch from 'node-fetch'
import { config } from '../config'

const projectId = config.GITLAB.PROJECT_ID
const accessToken = config.GITLAB.ACCESS_TOKEN


const getIssues = async (user, opts) => {
    const { gitlabUserId, issue_state, issue_scope } = opts
    const { gitlab_access_token } = user
    let uri: string = `https://gitlab.com/api/v4/projects/${projectId}/issues?access_token=${gitlab_access_token}`
    console.log("USER:", user)
    uri += issue_scope
        ? issue_scope === 'created by me'
            ? '&scope=created-by-me'
            : '&scope=assigned-to-me'
        : ''
    // uri += gitlabUserId ? `&assignee_id=${gitlabUserId}` : ''
    uri += issue_state ? `&state=${issue_state}` : ''

    const res = await fetch(uri)
    return await res.json()
}

export {
    getIssues,
}