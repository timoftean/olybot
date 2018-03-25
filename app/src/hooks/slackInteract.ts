
export const slackInteract = async (req, res) => {
    const payload = JSON.parse(req.body.payload)
    const { callback_id, user, actions } = payload
    const action = actions[0];

    console.log('fullfilment: ', user, callback_id, action)
    switch (callback_id) {
        case 'confirm_project': {

            res.send(`Project confirmed ✅`);
            break
        }
        default: {
            console.error('POST to /slack had an unknown callback_id.');
        }
    }

}