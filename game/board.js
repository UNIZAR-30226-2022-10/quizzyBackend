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

    /**
     * Initialize the board with every cell and edges for traversal.
     */
    constructor() {

        // board structure
        this.cells = [
            // center cell
            // Note : In the original game, once you get all tokens, you
            // must reach the center cell and answer a last question of any category.
            // For the sake of simplicity, this cell will act as a normal cell.
            createCell(null, false, false),

            // first radius
            createCell(4, false, false),
            createCell(3, false, false),
            createCell(2, false, false),

            // second radius
            createCell(1, false, false),
            createCell(4, false, false),
            createCell(3, false, false),

            // third radius
            createCell(5, false, false),
            createCell(1, false, false),
            createCell(4, false, false),

            // fourth radius
            createCell(0, false, false),
            createCell(5, false, false),
            createCell(1, false, false),

            // fifth radius
            createCell(2, false, false),
            createCell(0, false, false),
            createCell(5, false, false),

            // sixth radius
            createCell(3, false, false),
            createCell(2, false, false),
            createCell(0, false, false),

            // first arc
            createCell(5, false, true),
            createCell(1, false, false),
            createCell(4, false, false),
            createCell(null, true,  false),
            createCell(3, false, false),
            createCell(2, false, false),

            // second arc
            createCell(0, false, true),
            createCell(5, false, false),
            createCell(1, false, false),
            createCell(null, true,  false),
            createCell(4, false, false),
            createCell(3, false, false),

            // third arc
            createCell(2, false, true),
            createCell(0, false, false),
            createCell(5, false, false),
            createCell(null, true,  false),
            createCell(1, false, false),
            createCell(4, false, false),

            // fourth arc
            createCell(3, false, true),
            createCell(2, false, false),
            createCell(0, false, false),
            createCell(null, true,  false),
            createCell(5, false, false),
            createCell(1, false, false),

            // fifth arc
            createCell(4, false, true),
            createCell(3, false, false),
            createCell(2, false, false),
            createCell(null, true,  false),
            createCell(0, false, false),
            createCell(5, false, false),

            // sixth arc
            createCell(1, false, true),
            createCell(4, false, false),
            createCell(3, false, false),
            createCell(null, true,  false),
            createCell(2, false, false),
            createCell(0, false, false),
        ];

        this.edges = [
            // center
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
            [3, 20, 54], [19, 21], [20, 22], [21, 23], [22, 24], [23, 25],

            // second arc
            [6, 24, 26], [25, 27], [26, 28], [27, 29], [28, 30], [29, 31],

            // third arc
            [9, 30, 32], [31, 33], [32, 34], [33, 35], [34, 36], [35, 37],

            // fourth arc
            [12, 36, 38], [37, 39], [38, 40], [39, 41], [40, 42], [41, 43],

            // fifth arc
            [15, 42, 44], [43, 45], [44, 46], [45, 47], [46, 48], [47, 49],

            // sixth arc
            [18, 48, 50], [49, 51], [50, 52], [51, 53], [52, 54], [53, 19]
        ]
    }


    checkCell(id) {
        return (id >= 0 && id < this.cells.length);
    }

    getCell(id) {
        if ( !this.checkCell(id) ) {
            throw new Error("This cell doesn't exist");
        }

        // return cell object
        return this.cells[id];
    }

    /**
     * Find every cell at the specified distance from pos.
     * 
     * This function will perform a simple depth limited search, with
     * the limit set to the desired distance. This is enough for the 
     * board's purpose, but this wouldn't work with large distance values,
     * @param {BigInt} pos The cell id 
     * @param {BigInt} distance The distance of the cells to find
     * @returns {Array} The array of reachable cells
     */
    findReachableCells(pos, distance) {
        if ( !this.checkCell(pos) ) {
            throw new Error("This cell doesn't exist " + pos.toString());
        }

        var result = new Set();
        var visited = new Set();

        const ldfs = (cell, d) => {
        		visited.add(cell);
            if ( d == 0 ) {
                result.add(cell);
            } else {
                // d >= 0, recursive step through all successors which haven't been visited yet
                this.edges[cell].forEach(c => {
                    if ( !visited.has(c) ) {
                        ldfs(c, d-1);
                    } 
                })
            }
        }
        
        ldfs(pos, distance)

        return Array.from(result);
    }
}

module.exports = Board;