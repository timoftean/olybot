import {User} from "../modules/user/entity"

export interface Project {
    id: number,
    iid: number,
    name: string,
    project_id: number,
    title: string,
    description: string,
    state: string,
    created_at: Date,
    updated_at: Date,
    labels: string[],
    assignees: GitlabUser[],
    author: object,
    assignee: object
}

export interface GitlabUser {
    id: number,
    name: string,
    username: string,
    state: string,
    avatar_url: string,
    web_url: string
}

export interface Issue {
    issue_state?: string,
    issue_scope?: string,
    issue_title?: string,
    issue_label?: string[],
    issue_number?: number,
    asignee?: User,
}