import {WebClient} from "@slack/client"
import { config } from '../config'
import {WebAPICallResult} from "../@types/slack/slack"
// import {WebAPICallResult} from "@slack/client"

// type WebAPICallResult = slack.WebAPICallResult
// const WebClient = slack.WebClient
const botToken = config.SLACK.BOT_ACCESS_TOKEN
const slackWebClient = new WebClient(botToken)

/**
 *
 * @param {string} channel - lack channelId to post message to
 * @param {string} text - Message to send to that channel as this bot
 * @param attachments - attachments te be shown in the channel
 * @returns {Promise<void>}
 */
const sendMessageToUser = async (channel: string, text: string, attachments?: any): Promise<void> => {
    attachments = JSON.stringify(attachments)
    console.log(`MESSAGE ${text} SENT TO CHANNEL ${channel}`)
    const res = await slackWebClient.chat.postMessage({channel, text, attachments })
    console.log(`WITH RESPONSE ok:${JSON.stringify(res.ok)}`)
}

/**
 * @param data
 */
const sendMessageObj = (data: any): void => {
    slackWebClient.chat.postMessage(data)
}

/**
 *
 * @param {string} slackId - slackId of the user you are grabbing info from
 */
const pullInfoFromSlackId = async (slackId: string):
    Promise<WebAPICallResult> => await (slackWebClient.users.info({user: slackId}))

/**
 *
 * @param {string} slackId - slackId of `user` to search bot-to-`user`
 * @returns {SlackDMResponse}
 */
const findSlackDmId = async (slackId: string):
    Promise<WebAPICallResult> => await slackWebClient.im.open({user: slackId})

/**
 *
 * @param userToUpdate - user to update
 * @returns {Promise<any>}
 */
const updateUserWithSlack = async (userToUpdate: any) => {
    let user = userToUpdate
    const { user: userData } = await pullInfoFromSlackId(user.slackId)

    user.slackUsername = userData.name
    user.slackEmail = userData.profile.email
    user.displayName = userData.profile.display_name || userData.real_name
    user = await user.save()

    const { channel } = await findSlackDmId(user.slackId)
    user.slackDmId = channel.id
    return await user.save()
}

export {
    updateUserWithSlack,
    sendMessageToUser,
    sendMessageObj
}