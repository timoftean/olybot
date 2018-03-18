import { UserModel } from '../modules/user/entity'

export const gitlabAuth = (accessToken, refreshToken, profile, cb) => {
    console.log('gitlabauth:', accessToken, refreshToken, profile)
    return cb(null, profile)
    // UserModel.findOrCreate({gitlabId: profile.id}, function (err, user) {
    //     return cb(err, user);
    // });
}