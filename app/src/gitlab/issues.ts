import fetch from 'node-fetch'

import {Project, GitlabUser, Issue } from '../@types'
import { User } from "../modules/user/entity"

export default class GitlabIssues {

     public static async getIssues(user: User, opts: Issue) {
        const { issue_state, issue_scope } = opts
        const { gitlab_access_token, gitlabProjectId } = user

        let uri: string = `https://gitlab.com/api/v4/projects/`
            + `${gitlabProjectId}/issues?access_token=${gitlab_access_token}`

        uri += issue_scope
            ? issue_scope === 'created by me'
                ? '&scope=created-by-me'
                : '&scope=assigned-to-me'
            : ''
        // uri += gitlabUserId ? `&assignee_id=${gitlabUserId}` : ''
        uri += issue_state ? `&state=${issue_state}` : ''

        const res = await fetch(uri)
        const r = await res.json()
        console.log('issues:', r)
        return r
     }

    public static async createIssue(user: User, opts: Issue) {
        const { issue_title } = opts
        const { gitlab_access_token, gitlabProjectId } = user
        const uri: string = `https://gitlab.com/api/v4/projects/`
            + `${gitlabProjectId}/issues?access_token=${gitlab_access_token}`

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

    public static async closeIssue(user: User, opts: Issue) {
        const { issue_number } = opts
        const { gitlab_access_token, gitlabProjectId } = user
        const uri: string = `https://gitlab.com/api/v4/projects/`
            + `${gitlabProjectId}/issues/${issue_number}?access_token=${gitlab_access_token}`

        const postData = { state_event: 'close' }

        const res = await fetch(uri, {
            headers: { 'Content-Type': 'application/json' },
            method: 'PUT',
            body: JSON.stringify(postData)
        })

        return await res.json()
    }

    public static async reopenIssue(user: User, opts: Issue) {
        const { issue_number } = opts
        const { gitlab_access_token, gitlabProjectId } = user
        const uri: string = `https://gitlab.com/api/v4/projects/`
            + `${gitlabProjectId}/issues/${issue_number}?access_token=${gitlab_access_token}`

        const postData = { state_event: 'reopen' }

        const res = await fetch(uri, {
            headers: { 'Content-Type': 'application/json' },
            method: 'PUT',
            body: JSON.stringify(postData)
        })

        return await res.json()
    }

    public static async setIssueLabel(user: User, opts: Issue) {
        const { issue_number, issue_label: issueLabels } = opts
        const { gitlab_access_token, gitlabProjectId } = user
        const uri: string = `https://gitlab.com/api/v4/projects/`
            + `${gitlabProjectId}/issues/${issue_number}?access_token=${gitlab_access_token}`

        const labels = issueLabels
            .map((label: string) => label.replace(',', ''))
            .join(',')
            // make first letter capital
            .replace(/\w\S*/g, (txt: string) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase() )

        const postData = { labels }

        const res = await fetch(uri, {
            headers: { 'Content-Type': 'application/json' },
            method: 'PUT',
            body: JSON.stringify(postData)
        })

        return await res.json()
    }

    public static async removeIssueLabel(user: User, opts: Issue) {
        const { issue_number, issue_label } = opts
        const { gitlab_access_token, gitlabProjectId } = user
        const uri: string = `https://gitlab.com/api/v4/projects/`
            + `${gitlabProjectId}/issues/${issue_number}?access_token=${gitlab_access_token}`

        const response = await fetch(uri)
        const issueJson = await response.json()

        // take first label and make first letters capital
        const labelToRemove: string =
            issue_label[0]
            .replace(/\w\S*/g, (txt: string) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase() )

        const labels: string = issueJson.labels
            .filter((label: string) => {
                return label !== labelToRemove
            })
            .join(', ')

        const postData = { labels }

        const res = await fetch(uri, {
            headers: { 'Content-Type': 'application/json' },
            method: 'PUT',
            body: JSON.stringify(postData)
        })

        return await res.json()
    }

    public static async addAsignee(user: User, opts: any) {
        const { issue_number, asignee } = opts
        const { gitlabUserId } = asignee
        const { gitlab_access_token, gitlabProjectId } = user
        const projectUri: string = `https://gitlab.com/api/v4/projects/${gitlabProjectId}/issues/`
            + `${issue_number}?access_token=${gitlab_access_token}`
        const addAsigneeUri: string = `https://gitlab.com/api/v4/projects/`
            + `${gitlabProjectId}/issues/${issue_number}?access_token=${gitlab_access_token}`

        const asignees: number[] = [gitlabUserId]
        const response = await fetch(projectUri)

        const projectJson: Project = await response.json()
        projectJson.assignees.map((usr: GitlabUser) => {
            asignees.push(usr.id)
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
        } catch (e) {
            return { error: e.message }
        }
    }

    public static async removeAsignee(user: User, opts: Issue) {
        const { issue_number, asignee } = opts
        const { gitlabUserId } = asignee
        const { gitlab_access_token, gitlabProjectId } = user
        const projectUri: string = `https://gitlab.com/api/v4/projects/`
            + `${gitlabProjectId}/issues/${issue_number}?access_token=${gitlab_access_token}`
        const addAsigneeUri: string = `https://gitlab.com/api/v4/projects/`
            + `${gitlabProjectId}/issues/${issue_number}?access_token=${gitlab_access_token}`


        const response = await fetch(projectUri)
        const projectJson: Project = await response.json()
        const asignees: number[] = []
        projectJson.assignees.map((usr: GitlabUser) => {
            if (usr.id !== gitlabUserId) asignees.push(usr.id)
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
        } catch (e) {
            return { error: e.message }
        }
    }

}