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
    public async findOneOrCreateWithSlackId (query: object): Promise<Document | User> {
        try{
            let user = await <User | any>this.model.findOne(query)
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
    public async find(cond: object): Promise<User | any> {
        return await this.model.findOne(cond)
    }

    /**
     * find all users
     * @param cond
     * @returns {Promise<"mongoose".Document[]>}
     */
    public async findAll(cond: object): Promise<User[] | any[]> {
        return await this.model.find(cond)
    }

}

export const userController = new UserController()
