export interface Project {
    id: number,
    iid: number,
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