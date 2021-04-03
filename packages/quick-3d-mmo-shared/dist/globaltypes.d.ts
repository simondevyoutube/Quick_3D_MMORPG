import { EVENT_TYPES } from "./constants.js";
interface IOnMessageArgs {
    (evt: TEvt, params: {
        accountName?: string;
    }): void;
}
/**
 * shared event type
 */
declare type TEvt = {
    topic: EVENT_TYPES;
    params: any;
};
export type { IOnMessageArgs, TEvt, };
//# sourceMappingURL=globaltypes.d.ts.map