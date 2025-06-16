const Cancelled = {
    isCancellationRequested: true,
};
class Token {
    _isCancelled = false;
    get isCancellationRequested() {
        return this._isCancelled;
    }
    cancel() {
        this._isCancelled = true;
    }
}
export class CancellationTokenSource {
    _token = undefined;
    get token() {
        if (!this._token) {
            this._token = new Token();
        }
        return this._token;
    }
    cancel() {
        if (!this._token) {
            this._token = Cancelled;
        }
        else if (this._token instanceof Token) {
            this._token.cancel();
        }
    }
}
