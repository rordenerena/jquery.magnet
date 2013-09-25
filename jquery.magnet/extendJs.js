/**
 * Delete the white spaces at start and at the end of String
 * @type String
 */
String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/g, "");
}

/**
 * Delete the white spaces at start of String
 * @returns String
 */
String.prototype.ltrim = function() {
    return this.replace(/^\s+/, "");
}

/**
 * Delete the white spaces at end of String
 * @returns String
 */
String.prototype.rtrim = function() {
    return this.replace(/\s+$/, "");
}

/**
 * Find a string inside String
 * @type Boolean
 */
String.prototype.contains = function(str) {
    var str = this.toString();
    return (str.indexOf(str) !== -1);
}