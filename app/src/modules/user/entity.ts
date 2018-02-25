import { Model, model, Document, Schema } from "mongoose"

export interface User {
    gitlabAccountInfo?: object
    slackId: string
    slackUsername: string
    slackEmail: string
    slackDmId: string
    displayName: string
}

const UserSchema = new Schema({
    gitlabAccountInfo: {
        type: Object,
        default: {},
    },
    slackId: {
        type: String,
        required: true,
    },
    slackUsername: {
        type: String,
    },
    slackEmail: {
        type: String,
    },
    slackDmId: {
        type: String,
    },
    displayName: {
        type: String,
    },
})

type UserType = User & Document
export const UserModel: Model<UserType> = model<UserType>("user", UserSchema);