import fetch from 'node-fetch'
import { Project, GitlabUser } from '../typings'

const getIssues = async (user, opts) => {
    const { issue_state, issue_scope } = opts
    const { gitlab_access_token, gitlabProjectId } = user
    let uri: string = `https://gitlab.com/api/v4/projects/${gitlabProjectId}/issues?access_token=${gitlab_access_token}`
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

const createIssue = async (user, opts) => {
    const { issue_title } = opts
    const { gitlab_access_token, gitlabProjectId } = user
    let uri: string = `https://gitlab.com/api/v4/projects/${gitlabProjectId}/issues?access_token=${gitlab_access_token}`

    const postData = {
        id: gitlabProjectId,
        title: issue_title
    }

    const res = await fetch(uri, {
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
        body: JSON.stringify(postData)
    })
    return await res.json()
}

const setIssueLabel = async (user, opts) => {
    let { issue_number, issue_label } = opts
    const { gitlab_access_token, gitlabProjectId } = user
    let uri: string = `https://gitlab.com/api/v4/projects/${gitlabProjectId}/issues/${issue_number}?access_token=${gitlab_access_token}`

    issue_label = issue_label
        .map(i => i.replace(',', ''))
        .join(',')
        //make first letter capital
        .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase() )

    const postData = {
        labels: issue_label
    }

    const res = await fetch(uri, {
        headers: { 'Content-Type': 'application/json' },
        method: 'PUT',
        body: JSON.stringify(postData)
    })

    return await res.json()
}

const addAsignee = async (user, opts) => {
    const { issue_number, asignee } = opts
    const { gitlabUserId } = asignee
    const { gitlab_access_token, gitlabProjectId } = user
    let projectUri: string = `https://gitlab.com/api/v4/projects/${gitlabProjectId}/issues/${issue_number}?access_token=${gitlab_access_token}`
    let addAsigneeUri: string = `https://gitlab.com/api/v4/projects/${gitlabProjectId}/issues/${issue_number}?access_token=${gitlab_access_token}`

    const asignees: Array<number> = [gitlabUserId]
    const response = await fetch(projectUri)

    const projectJson: Project = await response.json()
    projectJson.assignees.map((user: GitlabUser) => {
        asignees.push(user.id)
    })

    try {
        const res = await fetch(addAsigneeUri, {
            headers: { 'Content-Type': 'application/json' },
            method: 'PUT',
            body: JSON.stringify({assignee_ids: asignees})
        })
        const json =  await res.json()

        if (json.message) return { error: json.message }
        return json
    } catch (e: Error) {
        return { error: e.message }
    }
}

export {
    getIssues,
    createIssue,
    setIssueLabel,
    addAsignee,
    removeAsignee
}