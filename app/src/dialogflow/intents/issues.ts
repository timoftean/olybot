import { getAllIssues } from '../../gitlab/issues'

const processGetAllIssues = async () => {
    const issues =  await getAllIssues()
    const attachments = []
    const text = 'Here is the list with all the issues'

    issues.map(issue => {
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
        attachments.push({
            color: "#36a64f",
            title: issue.title,
            title_link: issue.web_url,
            text: issue.description ? issue.description.substr(0, 50) + "..." : "",
            author_name: issue.assignee? issue.assignee.name : "",
            author_link: issue.assignee? issue.assignee.web_url : "",
            ts: new Date(issue.createdAt).getTime(),
            fields: fields || []
        })
    })
    return { attachments, text }
}

export {
    processGetAllIssues
}