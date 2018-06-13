declare module "@slack/client" {

    export interface Channel {
        id: string
    }

    export interface WebAPICallResult {
        user: any,
        channel: Channel
    }
}
