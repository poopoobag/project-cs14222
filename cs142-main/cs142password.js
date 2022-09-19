var randomBytes = require("crypto").randomBytes;
var createHash = require("crypto").createHash;

require("dotenv").config();

const algorithm = "sha-1";
const password = process.env.secretKey;
/*
 * Return a salted and hashed password entry from a
 * clear text password.
 * @param {string} clearTextPassword
 * @return {object} passwordEntry
 * where passwordEntry is an object with two string
 * properties:
 *      salt - The salt used for the password.
 *      hash - The sha1 hash of the password and salt
 */
function makePasswordEntry(clearTextPassword) {
  var passwordEntry = {};
  passwordEntry.salt = randomBytes(17).toString();
  var input = createHash("sha1");
  var saltedPass = clearTextPassword.concat(passwordEntry.salt);
  input.update(saltedPass);
  passwordEntry.hash = input.digest("hex");
  return passwordEntry;
}

/*
 * Return true if the specified clear text password
 * and salt generates the specified hash.
 * @param {string} hash
 * @param {string} salt
 * @param {string} clearTextPassword
 * @return {boolean}
 */
function doesPasswordMatch(hash, salt, clearTextPassword) {
  var input = createHash("sha1");
  var saltedPass = clearTextPassword.concat(salt);
  input.update(saltedPass);
  var digest = input.digest("hex");
  if (digest === hash) {
    return true;
  } else {
    return false;
  }
}

exports.makePasswordEntry = makePasswordEntry;
exports.doesPasswordMatch = doesPasswordMatch;
