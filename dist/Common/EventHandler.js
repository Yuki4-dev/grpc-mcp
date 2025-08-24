export class TypedEvent {
    listeners = [];
    listenersOncer = [];
    on = (listener) => {
        this.listeners.push(listener);
        return {
            dispose: () => this.off(listener),
        };
    };
    once = (listener) => {
        this.listenersOncer.push(listener);
    };
    off = (listener) => {
        const callbackIndex = this.listeners.indexOf(listener);
        if (callbackIndex > -1)
            this.listeners.splice(callbackIndex, 1);
    };
    emit = (event) => {
        this.listeners.forEach((listener) => listener(event));
        this.listenersOncer.forEach((listener) => listener(event));
        this.listenersOncer = [];
    };
    pipe = (te) => {
        return this.on((e) => te.emit(e));
    };
}
