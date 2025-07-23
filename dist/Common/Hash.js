import { obj2String } from "./Json.js";
export const obj2Hash = (obj) => {
    return str2Hash(obj2String(obj));
};
export const str2Hash = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const code = str.charCodeAt(i);
        hash = (hash << 5) - hash + code;
        hash = hash & hash;
    }
    return hash;
};
