
/**
 * Fetch a number of random elements from the array
 * @param {BigInt} arr The array from which the elements will be picked
 * @param {BigInt} max The number of elements to fetch from the array
 */
function pickRandom(arr, max) {
    // Array of indexes
    var indexes = [];

    // Array of values
    var results = [];
    var elements = 0;

    if (max > arr.length) throw new Error('Max must not exceed array size');

    while (elements < max) {
        // Generate value in [0, max - 1]
        var r = Math.floor(Math.random() * arr.length);

        // Check if it has been already added to the array
        if (indexes.findIndex(v => v === r) < 0) {
            elements++;
            indexes.push(r);
            results.push(arr[r]);
        }
    }

    return results;
}

module.exports.pickRandom = pickRandom;