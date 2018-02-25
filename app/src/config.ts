export const config = {
    PORT: process.env.API_PORT || 3000,
    MONGODB: {
        PORT: process.env.MONGODB_PORT,
        SERVER: process.env.MONGODB_SERVER,
        DATABASE: process.env.MONGODB_DATABASE
    },
    DIALOGFLOW:{
        NLP_ACCESS_TOKEN: process.env.NLP_ACCESS_TOKEN
    },
    GITLAB: {
        ACCESS_TOKEN: process.env.GITLAB_ACCESS_TOKEN
    },
    SLACK: {
        BOT_ACCESS_TOKEN: process.env.SLACK_BOT_ACCESS_TOKEN,
        OAUTH_ACCESS_TOKEN: process.env.SLACK_OAUTH_ACCESS_TOKEN
    }
}
