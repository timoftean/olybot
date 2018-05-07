import { GitlabIssues } from '../../gitlab'
import { User } from "../../modules/user/entity"

const processAttachments = (issues: any[]) => {
    return issues.map(issue => {
        let fields = issue.labels.map((label: string) => {
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

        if (issue.assignees) {
            fields.push({
                "title": "Assignees",
                "value": issue.assignees.map((a: any) => a.name ).join(', ')
            })
        }

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

const processGetIssues = async (user: User, options: object) => {
    let attachments: any[] = []
    let text = ''

    const issues =  await GitlabIssues.getIssues(user, options)
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

const processCreateIssues = async (user: User, options: any) => {
    const response =  await GitlabIssues.createIssue(user, options)
    const { issue_title } = options
    if (response.error) {
        return 'There was a problem creating the issue'
    } else {
        return `Issue '${issue_title}' created successfully`
    }
}

const processSetIssueLabel = async (user: User, options: any) => {
    const response =  await GitlabIssues.setIssueLabel(user, options)
    const { issue_number, issue_label } = options

    if (response.error) {
        return 'There was a problem adding the label'
    } else {
        return `Label '${issue_label}' added successfully to issue ${issue_number}`
    }
}

const processRemoveIssueLabel = async (user: User, options: any) => {
    const response =  await GitlabIssues.removeIssueLabel(user, options)
    const { issue_number, issue_label } = options

    if (response.error) {
        return 'There was a problem removing the label'
    } else {
        return `Label '${issue_label}' removed successfully from issue ${issue_number}`
    }
}

const processCloseIssue = async (user: User, options: any) => {
    const response =  await GitlabIssues.closeIssue(user, options)
    const { issue_number } = options

    if (response.error) {
        return 'There was a problem closing the issue'
    } else {
        return `Issue ${issue_number} was closed successfully`
    }
}

const processAddAsignee = async (user: User, options: any) => {
    const response =  await GitlabIssues.addAsignee(user, options)
    const { issue_number, asignee } = options
    const { slackId } = asignee

    if (response.error) {
        return 'There was a problem assigning user'
    } else {
        return `User <@${slackId}> was assigned successfully to issue ${issue_number}`
    }
}

const processRemoveAsignee = async (user: User, options: any) => {
    const response =  await GitlabIssues.removeAsignee(user, options)
    const { issue_number, asignee } = options
    const { slackId } = asignee

    if (response.error) {
        return 'There was a problem unassigning user'
    } else {
        return `User <@${slackId}> was unassign successfully from issue ${issue_number}`
    }
}

export {
    processGetIssues,
    processCreateIssues,
    processSetIssueLabel,
    processRemoveAsignee,
    processAddAsignee,
    processRemoveIssueLabel
    processCloseIssue,
}