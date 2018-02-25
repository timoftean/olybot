export const config = {
    PORT: process.env.API_PORT || 3000,
    GITLAB: {
        ACCESS_TOKEN: process.env.GITLAB_ACCESS_TOKEN
    },
    SLACK: {
        BOT_ACCESS_TOKEN: process.env.SLACK_BOT_ACCESS_TOKEN,
        OAUTH_ACCESS_TOKEN: process.env.SLACK_OAUTH_ACCESS_TOKEN
    }
}
