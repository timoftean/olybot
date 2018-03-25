import { UserModel } from '../modules/user/entity'
import {getUserProjects} from "../gitlab/user"
import {sendMessageObj} from "../slack/webClient";

export const gitlabUserProjects = async (req, res) => {
    const { gitlabUserId } = req.params
    console.log("SELECT PROJECT:", gitlabUserId)
    const user = await UserModel.findOne({ gitlabUserId })



    res.send('');
}