const HttpUtils = require('./http')


// Error strings
const errPending = "The operation is pending."
const errFailed  = "failed"
const errJsonWithoutData = "Unexpected: IssuerApi.getTokens returned invalid data object."
const errInvalidPemArray = "Unexpected: IssuerApi.getTokens pemArray had < 2 elements."
const errInvalidPemData = "Unexpected: IssuerApi.getTokens PEM data was invalid."


/**
 * A base implementation of the issuer API. Specific issuer APIs will derive from this.
 *
 * @constructor
 */
const TokenIssuerService = module.exports = function(backendUrl, appKeyPair) {
    this.backendUrl = backendUrl
    this.appKeyPair = appKeyPair
}


/**
 * Get the token(s) for the request identified by the given requestID.
 *
 * @param {String} requestIdString - The requestID that was provided during a prior call to the issuer-specific `requestTokens` API.
 * @returns {Promise.Array.String} - Promise containing PEM array
*/
TokenIssuerService.prototype.getTokens = function(requestIdString) {
    return HttpUtils.get(this.backendUrl, 'getCertificates', {
        requestid: requestIdString
    }).then(json => {
        if(!json.data) {
            throw new Error(errJsonWithoutData)
        }

        if(!json.data.result) {
            throw new Error(errPending)
        }

        if(!json.data.pems || json.data.pems.length === 0) {
            throw new Error(errInvalidPemData)
        }

        var pemArray = json.data.pems.split('-----BEGIN')
        if(pemArray.length === 0) {
            throw new Error(errInvalidPemArray)
        }

        return pemArray
    })
}


/**
 * Delete the token(s) for the request identified by the given requestID.
 *
 * @param {String} requestIdString - The requestID that was provided during a prior call to the issuer-specific `requestTokens` API.
 * @throws {Error} Throws Error if request failed
 * @returns {Promise.null} Promise returning null if success
*/
TokenIssuerService.prototype.deleteTokens = function(requestIdString) {
    return HttpUtils.get(this.backendUrl, 'deleteRequest', {
        requestid: requestIdString
    }).then(json => {
        if(!json.data) {
            throw new Error(errJsonWithoutData)
        }

        if(!json.data.result) {
            throw new Error(errFailed)
        }

        return null
    })
}


/**
 * Delete all the tokens for the default credential.
 *
 * @throws {Error} Throws Error if request failed
 * @returns {Promise.null} Promise returning null if success
*/
TokenIssuerService.prototype.deleteAllTokens = function() {
    return HttpUtils.get(this.backendUrl, 'deleteAllRequests').then(json => {
        if(!json.data) {
            throw new Error(errJsonWithoutData)
        }

        if(!json.data.result) {
            throw new Error(errFailed)
        }

        return null
    })
}
