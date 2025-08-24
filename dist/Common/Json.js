import { Logger } from "./Logger.js";
export const obj2String = (obj, format = false) => {
    let json = "";
    try {
        if (format) {
            json = JSON.stringify(obj, null, "  ");
        }
        else {
            json = JSON.stringify(obj);
        }
    }
    catch (error) {
        Logger.error(error);
    }
    return json;
};
export const string2Obj = (json) => {
    if (json) {
        try {
            return JSON.parse(json);
        }
        catch (error) {
            Logger.error(error);
        }
    }
    return undefined;
};
