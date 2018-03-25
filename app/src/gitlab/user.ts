import fetch from 'node-fetch'

const getUserProjects = async (user, opts?) => {
    const { gitlab_access_token, gitlabUserId } = user
    let uri: string = `https://gitlab.com/api/v4/users/${gitlabUserId}/projects?access_token=${gitlab_access_token}`
    console.log("USER:", user)

    const res = await fetch(uri)
    return await res.json()
}

export {
    getUserProjects
}