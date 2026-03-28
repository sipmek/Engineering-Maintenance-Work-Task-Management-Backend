/**
 * Standard API Response Utility
 * @param {Object} res - Express response object
 * @param {Number} statusCode - HTTP status code
 * @param {String} status - 'success', 'fail', or 'error'
 * @param {String} message - Human readable message
 * @param {Object|Array|null} data - Optional response data
 */
const sendResponse = (res, statusCode, status, message, data = null) => {
  const response = {
    status,
    message,
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

module.exports = sendResponse;
