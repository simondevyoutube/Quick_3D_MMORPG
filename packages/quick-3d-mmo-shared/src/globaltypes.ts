import { EVENT_TYPES } from "./constants.js"

interface IOnMessageArgs {
    (evt: TEvt, params: {
        accountName?: string,
    }): void
}


/**
 * shared event type
 */
type TEvt = {
    topic: EVENT_TYPES, params: any
}

export type {
    IOnMessageArgs,
    TEvt,
};