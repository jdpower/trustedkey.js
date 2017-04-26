const HttpUtils = require('./http')
const Errors    = require('../errors')


/**
 * An implementation of a the validation API, used to check to validity of credentials and tokens.
 * @constructor
 */
const ValidateService = module.exports = function(backendUrl) {
    this.backendUrl = backendUrl
}


function validate(backendUrl, address) {
    return HttpUtils.get(backendUrl, 'isRevoked', {
        address: address
    }).then(r => {
        if (r.data.isRevoked !== false) {
            throw new Errors.ApplicationError("Address got revoked: " + address)
        }
        return true
    })
}


/**
 * Validate the given credential by calling into the smart contract.
 *
 * @param {String} credentialAddressString - Credential to check.
 * @throws {Errors.Applicationerror} Will throw if address got revoked
 * @returns {[Promise, boolean]} Promise containing revocation status
*/
ValidateService.prototype.validateCredential = function(credentialAddressString) {
    return validate(this.backendUrl, credentialAddressString)
}


/**
 * Validate given token(s) by calling into the smart contract.
 *
 * @param {string} tokenSerialNumbers - Array of token serial numbers.
 * @throws {Errors.Applicationerror} Will throw if address got revoked
 * @returns {[Promise, boolean]} Promise containing revocation status
*/
ValidateService.prototype.validateTokens = function(tokenSerialNumbers) {
    var serialNumbers
    if(typeof tokenSerialNumbers !== 'string') {
        serialNumbers = tokenSerialNumbers.map(serialNo => {
            return '0x' + serialNo
        }).join(',')
    } else {
        serialNumbers = tokenSerialNumbers
    }
    return validate(this.backendUrl, serialNumbers)
}
