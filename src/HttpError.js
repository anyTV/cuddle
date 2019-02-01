

export default class HttpError {


    static get ECONNREFUSED () {
        return 'ECONNREFUSED';
    }

    static get ECONNRESET () {
        return 'ECONNRESET';
    }

    static get ENOTFOUND () {
        return 'ENOTFOUND';
    }

    static get EADDRINFO () {
        return 'EADDRINFO';
    }

    static get ETIMEDOUT () {
        return 'ETIMEDOUT';
    }

    static get ESRCH () {
        return 'ESRCH';
    }

    static get RETRYABLE_ERRORS () {
        return [
            HttpError.ECONNREFUSED,
            HttpError.ECONNRESET,
            HttpError.ENOTFOUND,
            HttpError.EADDRINFO,
            HttpError.ETIMEDOUT,
            HttpError.ESRCH
        ];
    }
}
