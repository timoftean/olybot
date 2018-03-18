import { getAllIssues, getMyIssues } from '../../gitlab/issues'

const processAttachments = (issues) => {
    console.log("ISSUES:", issues)
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

const processGetMyIssues = async (gitlabUserId) => {
    let attachments = []
    let text = ''

    const issues =  await getMyIssues(gitlabUserId)
    if (issues.length === 0 ) {
        text = 'There are no issues at the moment'
    } else {
        text  = 'Here is the list with all your issues'
        attachments = processAttachments(issues)
    }

    return { attachments, text }
}

const processGetAllIssues = async () => {
    let attachments = []
    let text = ''

    const issues =  await getAllIssues()
    if (issues.length ===0 ) {
        text = 'There are no issues at the moment'
    } else {
        text  = 'Here are all the issues of your project'
        attachments = processAttachments(issues)
    }

    return { attachments, text }
}

export {
    processGetAllIssues,
    processGetMyIssues
}