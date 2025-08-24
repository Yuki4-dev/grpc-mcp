export interface CancellationEventArgs {
    cancel: boolean;
}
export interface Listener<T> {
    (event: T): void;
}
export interface Disposable {
    dispose(): void;
}
export interface ListenOnlyTypedEvent<T = undefined> {
    on(listener: Listener<T>): Disposable;
    once(listener: Listener<T>): void;
    off(listener: Listener<T>): void;
    pipe(te: TypedEvent<T>): Disposable;
}
export declare class TypedEvent<T = undefined> implements ListenOnlyTypedEvent<T> {
    private listeners;
    private listenersOncer;
    on: (listener: Listener<T>) => Disposable;
    once: (listener: Listener<T>) => void;
    off: (listener: Listener<T>) => void;
    emit: (event: T) => void;
    pipe: (te: TypedEvent<T>) => Disposable;
}
