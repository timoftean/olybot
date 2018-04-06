import fetch from 'node-fetch'

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
export {
    getIssues,
    createIssue
}