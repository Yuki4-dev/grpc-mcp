export interface CancellationToken {
    readonly isCancellationRequested: boolean;
}
export declare class CancellationTokenSource {
    private _token?;
    get token(): CancellationToken;
    cancel(): void;
}
