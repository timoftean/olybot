import { WebClient } from '@slack/client'
import { config } from '../config'
const botToken = config.SLACK.BOT_ACCESS_TOKEN
const slackWebClient = new WebClient(botToken)

// todo: find a method to take info about all channels
// slackWebClient.channels.info('D8DABTS6A')
//     .then((res) => {
//         console.log('res/channels', res)
//     })
//     .catch(err => console.error('channel error:', err))


/*
  sendMessage()
  args:
    channelId (String): Slack channelId to post message to
    message (String): Message to send to that channel as this bot
  returns:
    undefined
*/
const sendMessageToUser = async (channel, text, attachments?) => {
    attachments = JSON.stringify(attachments)
    console.log(`MESSAGE ${text} SENT TO CHANNEL ${channel}`)
    const res = await slackWebClient.chat.postMessage({channel, text, attachments })
    console.log(`WITH RESPONSE ok:${JSON.stringify(res.ok)}`)

}

/*
  sendMessageObj()
  args:
    channelId (String): Slack channelId to post message to
    messageObj (String): The `attachment` that Slack expects as an object
  returns:
    undefined
*/
const sendMessageObj = (data) => {
    slackWebClient.chat.postMessage(data)
}

/*
  pullInfoFromSlackId()
    args:
      slackId (String): slackId of the user you are grabbing info from
    returns:
      Promise that resolves with
      res (Object): with
        res.user =
          {
            id: <slack_id>,
            team_id: <team_id>,
            name: <slack_username>,
            real_name: <slack_real_name>,
            tz: 'America/Los_Angeles',
            tz_label: 'Pacific Daylight Time',
            tz_offset: -25200,
            profile:
              {
                real_name: <slack_real_name>,
                display_name: <slack_display_name>,,
                email: <slack_email>,
                team: <team_id>
              },
            is_bot: false,
          }
*/
const pullInfoFromSlackId = async slackId => await (slackWebClient.users.info({user: slackId}))

/*
    findSlackDmId()
      args:
        slackId (String): slackId of `user` to search bot-to-`user`
          DM channel for
      returns:
        Promise that resolves res that looks like:
        {
          ok: true,
          no_op: true,
          already_open: true,
          channel: { id: 'D7NMVCZPU' },
          scopes: [ 'identify', 'bot:basic' ],
          acceptedScopes: [ 'im:write', 'post' ]
        }
*/
const findSlackDmId = async slackId => await (slackWebClient.im.open({user: slackId}))

/*
    updateUserWithSlack()
    Pull all Slack info (including DM channel id!)
    args:
        user (User <Mongoose model>): user to update
            (has slackId since it's required)
    returns:
        Promise that resolves with updated user
            (user.save() resultant Promise)
*/

const updateUserWithSlack = async (userToUpdate) => {
    let user = userToUpdate
    let res = await pullInfoFromSlackId(user.slackId)
    console.log('USER FORM SLACK:', res.user)
    const userData = res.user
    user.slackUsername = userData.name
    user.slackEmail = userData.profile.email
    user.displayName = userData.profile.display_name || userData.real_name
    user = await user.save()

    res = await findSlackDmId(user.slackId)
    console.log('SLACK DMId:', res)
    user.slackDmId = res.channel.id
    return await user.save()
}

export {
    updateUserWithSlack,
    sendMessageToUser,
    sendMessageObj
}