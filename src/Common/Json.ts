import { Logger } from "./Logger.js";

export const obj2String = (obj: unknown, format: boolean = false): string => {
    let json = "";
    try {
        if (format) {
            json = JSON.stringify(obj, null, "  ");
        } else {
            json = JSON.stringify(obj);
        }
    } catch (error) {
        Logger.error(error as Error);
    }

    return json;
};

export const string2Obj = <T extends object>(json?: string): T | undefined => {
    if (json) {
        try {
            return JSON.parse(json) as T;
        } catch (error) {
            Logger.error(error as Error);
        }
    }

    return undefined;
};
