// declare module '@slack/client' {
//     // import slack = require('@slack/client')
//
//     export interface Channel {
//         id: string
//     }
//
//     export interface WebAPICallResult {
//         user: any,
//         channel: Channel
//     }
// }
declare module '@slack/client'

export interface WebAPICallResult {
    user: any,
    channel: Channel
}