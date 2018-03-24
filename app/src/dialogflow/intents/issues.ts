import { getIssues } from '../../gitlab/issues'

const processAttachments = (issues) => {
    return issues.map(issue => {
        let fields = issue.labels.map(label => {
            return {
                "title": "Label",
                "value": label,
                "short": true
            }
        })

        fields.push({
            "title": "State",
            "value": issue.state,
            "short": true
        })

        return {
            color: "#36a64f",
            title: issue.title,
            title_link: issue.web_url,
            text: issue.description ? issue.description.substr(0, 50) + "..." : "",
            author_name: issue.assignee? issue.assignee.name : "",
            author_link: issue.assignee? issue.assignee.web_url : "",
            ts: new Date(issue.createdAt).getTime(),
            fields: fields || []
        }
    })
}

const processGetMyIssues = async (user, options) => {
    let attachments = []
    let text = ''

    const issues =  await getIssues(user, options)
    if (issues.length === 0 ) {
        text = 'There are no issues at the moment'
    } else {
        text = 'Here are the issues you are searching for'
        attachments = processAttachments(issues)
    }

    return { attachments, text }
}

const processGetAllIssues = async (user, options) => {
    let attachments = []
    let text = ''

    const issues =  await getIssues(user, options)
    if (!Array.isArray(issues)) {
        text = 'There was a problem connecting to gitlab'
    }
    else if (issues.length ===0 ) {
        text = 'There are no issues at the moment'
    } else {
        text = 'Here are the issues you are searching for'
        attachments = processAttachments(issues)
    }

    return { attachments, text }
}

export {
    processGetAllIssues,
    processGetMyIssues
}