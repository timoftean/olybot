import { getIssues, createIssue, setIssueLabel, addAsignee, removeAsignee } from '../../gitlab'

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

        fields.push({
            "title": "Issue number",
            "value": issue.iid,
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

const processGetIssues = async (user, options) => {
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

const processCreateIssues = async (user, options) => {
    const response =  await createIssue(user, options)
    const { issue_title } = options
    if (response.error) {
        return 'There was a problem creating the issue'
    } else {
        return `Issue '${issue_title}' created successfully`
    }
}

const processSetIssueLabel = async (user, options) => {
    const response =  await setIssueLabel(user, options)
    const { issue_number, issue_label } = options

    if (response.error) {
        return 'There was a problem adding the label'
    } else {
        return `Label '${issue_label}' added successfully to issue ${issue_number}`
    }
}

const processAddAsignee = async (user, options) => {
    const response =  await addAsignee(user, options)
    const { issue_number, asignee } = options
    const { slackId } = asignee

    if (response.error) {
        return 'There was a problem assigning user'
    } else {
        return `User <@${slackId}> was assigned successfully to issue ${issue_number}`
    }
}

export {
    processGetIssues,
    processCreateIssues,
    processSetIssueLabel,
    processRemoveAsignee,
    processAddAsignee
}