import fetch from 'node-fetch'
import { config } from '../config'

const projectId = config.GITLAB.PROJECT_ID
const accessToken = config.GITLAB.ACCESS_TOKEN
const issues_uri: string = `https://gitlab.com/api/v4/projects/${projectId}/issues?private_token=${accessToken}`

const getAllIssues = async () => {
    const res = await fetch(issues_uri)
    return await res.json()
}

const getMyIssues = async (gitlabUserId) => {
    console.log('URI:', projectId, gitlabUserId, accessToken)
    const res = await fetch(`${issues_uri}&assignee_id=${gitlabUserId}`)
    return await res.json()
}

export {
    getAllIssues,
    getMyIssues
}