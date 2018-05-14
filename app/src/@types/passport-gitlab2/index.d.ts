
declare module 'passport-gitlab2' {

    import passport = require('passport')
    import express = require('express')

    export interface Profile extends passport.Profile {
        profileUrl: string
    }

    export interface StrategyOption {
        clientID: string
        clientSecret: string
        callbackURL: string

        scope?: string[]
        userAgent?: string

        authorizationURL?: string
        tokenURL?: string
        scopeSeparator?: string
        customHeaders?: string
        userProfileURL?: string
    }

    declare class Strategy extends passport.Strategy {
        constructor(options: StrategyOption, verify: (accessToken: string, refreshToken: string, profile: Profile, done: (error: any, user?: any) => void) => void)

        userProfile: (accessToken: string, done?: (error: any, profile: Profile) => void) => void

        name: string

        authenticate(req: express.Request, options?: passport.AuthenticateOptions): void
    }
}
