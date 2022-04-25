/*
 * Author: Darío Marcos Casalé (795306)
 * Filename: board.js
 * Module: game
 * Description: game board object
 */

function createCell(category, rollAgain, hasToken) {
    return { category, rollAgain, hasToken }
}

class Board {

    constructor() {

        // board structure
        this.cells = [
            // center cell
            createCell(null, false, true),

            // first radius
            createCell(4, false, false),
            createCell(2, false, false),
            createCell(0, false, false),

            // second radius
            createCell(5, false, false),
            createCell(3, false, false),
            createCell(0, false, false),

            // third radius
            createCell(1, false, false),
            createCell(2, false, false),
            createCell(4, false, false),

            // fourth radius
            createCell(2, false, false),
            createCell(5, false, false),
            createCell(0, false, false),

            // fifth radius
            createCell(4, false, false),
            createCell(1, false, false),
            createCell(3, false, false),

            // sixth radius
            createCell(3, false, false),
            createCell(1, false, false),
            createCell(5, false, false),

            // first arc
            createCell(1, false, true),
            createCell(null, true,  false),
            createCell(3, false, false),
            createCell(0, false, false),

            // second arc
            createCell(4, false, true),
            createCell(null, true,  false),
            createCell(2, false, false),
            createCell(3, false, false),

            // third arc
            createCell(0, false, true),
            createCell(null, true,  false),
            createCell(4, false, false),
            createCell(0, false, false),

            // fourth arc
            createCell(3, false, true),
            createCell(null, true,  false),
            createCell(2, false, false),
            createCell(1, false, false),

            // fifth arc
            createCell(5, false, true),
            createCell(null, true,  false),
            createCell(5, false, false),
            createCell(1, false, false),

            // sixth arc
            createCell(2, false, true),
            createCell(null, true,  false),
            createCell(5, false, false),
            createCell(4, false, false),
        ];

        this.edges = [
            [1,4,7,10,13,16],

            // first radius
            [0, 2], [1, 3], [2, 19],

            // second radius
            [0, 5], [4, 6], [5, 23],

            // third radius
            [0, 8], [7, 9], [8, 27],

            // fourth radius
            [0, 11], [10, 12], [11, 31],

            // fifth radius
            [0, 14], [13, 15], [14, 35],

            // sixth radius
            [0, 17], [16, 18], [17, 39],

            // first arc
            [3, 20, 42], [19, 21], [20, 22], [21, 23],

            // second arc
            [6, 22, 24], [23, 25], [24, 26], [25, 27],

            // third arc
            [9, 26, 28], [27, 29], [28, 30], [29, 31],

            // fourth arc
            [12, 30, 32], [31, 33], [32, 34], [33, 35],

            // fifth arc
            [15, 34, 36], [35, 37], [36, 38], [37, 39],

            // sixth arc
            [18, 38, 40], [39, 41], [40, 42], [41, 19]
        ]
    }

    getCell(id) {
        if ( id < 0 || id >= this.cells.length ) {
            throw new Error("This cell doesn't exist");
        }

        // return cell object
        return this.cells[id];
    }
}

module.exports = Board;