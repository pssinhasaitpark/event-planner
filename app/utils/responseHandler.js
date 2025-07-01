export const handleResponse = (res, statusCode = 200, message = '', data = null, error = false) => {
    return res.status(statusCode).json({
        error,
        message,
        data
    });
};


export const handleError = (res, error, statusCode = 500, fallbackMessage = 'Something went wrong') => {
    console.error(error);
    return res.status(statusCode).json({
        error: true,
        message: error?.message || fallbackMessage
    });
};
