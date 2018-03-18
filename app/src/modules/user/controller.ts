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
    public async findOneOrCreateWithSlackId (query: any) {
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

    /**
     * find user
     * @param cond
     * @returns {Promise<"mongoose".Document>}
     */
    public async find(cond) {
        return await this.model.findOne(cond)
    }

    /**
     * find all users
     * @param cond
     * @returns {Promise<"mongoose".Document[]>}
     */
    public async findAll(cond) {
        return await this.model.find(cond)
    }

}

export const userController = new UserController()
