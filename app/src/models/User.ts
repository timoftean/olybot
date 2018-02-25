import * as mongoose from 'mongoose'
import { updateUserWithSlack } from '../slackRequests/index'

const { Schema } = mongoose

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
    hasPendingTask: {
        type: Boolean,
        default: false,
    },
    displayName: {
        type: String,
    },
});

UserSchema.statics.findOneOrCreateWithSlackId = async (query: any) => {
    try{
        let user = await this.findOne(query)
        if (user) {
            return user
        }

        user = this.create(query)
        if (!user.slackUsername) {
            return updateUserWithSlack(user)
        }

        return user
    } catch(error) {
        console.error('COULD NOT FIND|CREATE USER', error)
    }

}

export const User = mongoose.model('user', UserSchema)