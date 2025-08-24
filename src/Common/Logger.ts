const debug = false;

export const Logger = {
    debug: (message: string | Error | unknown): void => {
        if (!debug) {
            return;
        }
        if (typeof message === "string") {
            console.debug(message);
        } else if (message instanceof Error) {
            console.debug(message.message, message.stack);
        } else {
            console.debug(message);
        }
    },
    error: (message: string | Error | unknown): void => {
        if (typeof message === "string") {
            console.error(message);
        } else if (message instanceof Error) {
            console.error(message.message, message.stack);
        } else {
            console.error(message);
        }
    },
    warn: (message: string | Error | unknown): void => {
        if (typeof message === "string") {
            console.warn(message);
        } else if (message instanceof Error) {
            console.warn(message.message, message.stack);
        } else {
            console.warn(message);
        }
    },
};
