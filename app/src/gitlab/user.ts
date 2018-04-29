import fetch from 'node-fetch'

const getUserProjects = async (user, opts?) => {
    const { gitlab_access_token, gitlabUserId } = user
    let ownerUri: string = `https://gitlab.com/api/v4/users/${gitlabUserId}/projects?access_token=${gitlab_access_token}`
    let memberUri: string = `https://gitlab.com/api/v4/projects?membership=true&access_token=${gitlab_access_token}`
    
    const res = await Promise.all([fetch(ownerUri), fetch(memberUri)])
    const prj = await Promise.all([res[0].json(), res[1].json()])

    return prj[0].concat(prj[1])
}

export {
    getUserProjects
}