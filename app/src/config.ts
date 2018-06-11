export const config = {
    PORT: process.env.APP_PORT || 3000,
    HOST: process.env.HOST || 'http://localhost:3000',
    MONGO_CONNECTION_STRING: process.env.MONGO_CONNECTION_STRING,
    DIALOGFLOW: {
        CLIENT_ACCESS_TOKEN: process.env.NLP_CLIENT_ACCESS_TOKEN,
        DEVELOPER_ACCESS_TOKEN: process.env.NLP_DEVELOPER_ACCESS_TOKEN
    },
    GITLAB: {
        ACCESS_TOKEN: process.env.GITLAB_ACCESS_TOKEN,
        SECRET: process.env.GITLAB_SECRET,
        APPLICATION_ID: process.env.GITLAB_APPLICATION_ID,
        PROJECT_ID: process.env.GITLAB_PROJECT_ID
    },
    SLACK: {
        BOT_ACCESS_TOKEN: process.env.SLACK_BOT_ACCESS_TOKEN,
        OAUTH_ACCESS_TOKEN: process.env.SLACK_OAUTH_ACCESS_TOKEN
    }
}
