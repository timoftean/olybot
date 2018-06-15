import fetch from 'node-fetch'

import {User} from "../modules/user/entity"
import {Issue} from "../@types"

export default class GitlabUser {
    public static async getUserProjects(user: User, opts?: Issue) {
        const { gitlab_access_token, gitlabUserId } = user
        const ownerUri: string =
            `https://gitlab.com/api/v4/users/${gitlabUserId}/projects?access_token=${gitlab_access_token}`
        const memberUri: string =
            `https://gitlab.com/api/v4/projects?membership=true&access_token=${gitlab_access_token}`

        const res = await Promise.all([fetch(ownerUri), fetch(memberUri)])
        const prj = await Promise.all([res[0].json(), res[1].json()])

        return prj[0].concat(prj[1])
    }
}
