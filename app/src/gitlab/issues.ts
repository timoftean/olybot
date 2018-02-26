import fetch from 'node-fetch'
import { config } from '../config'

const getAllIssues = async () => {
    const res = await fetch(`https://gitlab.com/api/v4/projects/4372969/issues?private_token=${config.GITLAB.ACCESS_TOKEN}`)
    return await res.json()
}

export {
    getAllIssues
}