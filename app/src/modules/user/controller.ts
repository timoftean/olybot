import { Model, Document } from 'mongoose'
import { User, UserModel } from './entity'
import { updateUserWithSlack } from '../../slack'

class UserController {
    private model: Model<Document>

    constructor () {
        this.model = UserModel
    }

    /**
     * find a user or create one with slack information
     * @param query
     * @returns {Promise<User>}
     */
    async findOneOrCreateWithSlackId (query: any) {
        try{
            let user: any = await this.model.findOne(query)
            if (user) {
                return user
            }

            user = await this.model.create(query)
            if (!user.slackUsername) {
                return updateUserWithSlack(user)
            }

            return user
        } catch(error) {
            console.error('COULD NOT FIND|CREATE USER', error)
        }
    }

}

export const userController =  new UserController()
