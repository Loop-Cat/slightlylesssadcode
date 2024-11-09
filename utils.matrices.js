// flow matrices, flood fill matrices and distance stransfor matrices go here :)
findPositionsInsideRect = function(rect) {
    const positions = []

    for (let x = rect.x1; x <= rect.x2; x++) {
        for (let y = rect.y1; y <= rect.y2; y++) {
            if (x < 0 || x >= 50 || y < 0 || y >= 50) continue
            positions.push({ x, y })
        }
    }

    return positions
}

const Matrices = {
    floodFill: function (room, seeds) {
        const floodCM = new PathFinder.CostMatrix(),
            terrain = room.getTerrain(),
            visitedCM = new PathFinder.CostMatrix()

        let depth = 0,
            thisGeneration = seeds,
            nextGeneration = []

        for (let i in seeds) {
            visitedCM.set(seeds[i].x, seeds[i].y, 1)
        }

        while (thisGeneration.length) {
            nextGeneration = []

            for (const pos of thisGeneration) {
                if (depth != 0) {
                    if (terrain.get(pos.x, pos.y) == TERRAIN_MASK_WALL) { continue }
                    floodCM.set(pos.x, pos.y, depth)
                }

                const rect = { x1: pos.x - 1, y1: pos.y - 1, x2: pos.x + 1, y2: pos.y + 1 },
                    adjacentPositions = findPositionsInsideRect(rect)

                for (const adjacentPos of adjacentPositions) {
                    if (visitedCM.get(adjacentPos.x, adjacentPos.y) == 1) { continue }
                    visitedCM.set(adjacentPos.x, adjacentPos.y, 1)
                    nextGeneration.push(adjacentPos)
                }
            }

            thisGeneration = nextGeneration
            depth++
        }
        return floodCM
    }
};

module.exports = Matrices