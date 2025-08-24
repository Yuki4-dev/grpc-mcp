export interface CancellationToken {
    readonly isCancellationRequested: boolean;
}

const Cancelled: CancellationToken = {
    isCancellationRequested: true,
};

class Token implements CancellationToken {
    private _isCancelled: boolean = false;

    get isCancellationRequested(): boolean {
        return this._isCancelled;
    }

    cancel(): void {
        this._isCancelled = true;
    }
}

export class CancellationTokenSource {
    private _token?: CancellationToken = undefined;

    get token(): CancellationToken {
        if (!this._token) {
            this._token = new Token();
        }
        return this._token;
    }

    cancel(): void {
        if (!this._token) {
            this._token = Cancelled;
        } else if (this._token instanceof Token) {
            this._token.cancel();
        }
    }
}
