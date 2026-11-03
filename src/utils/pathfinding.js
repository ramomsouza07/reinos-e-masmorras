// A* Pathfinding and Line-of-Sight Utilities for Reinos & Masmorras Grid

/**
 * Checks if a given grid coordinate (x, y) is blocked by map boundaries or obstacles.
 */
export function isTileBlocked(x, y, obstacles = [], cols = 22, rows = 15) {
  // Boundaries
  if (x < 0 || x >= cols || y < 0 || y >= rows) return true;

  // Obstacles (walls, pillars, boulders, altars, trees)
  for (const obs of obstacles) {
    if (x >= obs.x && x < obs.x + (obs.w || 1) && y >= obs.y && y < obs.y + (obs.h || 1)) {
      if (obs.type === 'wall' || obs.type === 'pillar' || obs.type === 'boulder' || obs.type === 'tree' || obs.type === 'altar') {
        return true;
      }
    }
  }

  return false;
}

/**
 * Performs A* Pathfinding from (startX, startY) to (targetX, targetY).
 * Returns array of coordinates: [{ x, y }, { x, y }, ...] excluding start, or empty array if unreachable.
 */
export function findPath(startX, startY, targetX, targetY, obstacles = [], cols = 22, rows = 15) {
  // If target is blocked, find closest reachable neighbor
  let endX = targetX;
  let endY = targetY;

  if (isTileBlocked(endX, endY, obstacles, cols, rows)) {
    const neighbors = [
      { x: endX + 1, y: endY },
      { x: endX - 1, y: endY },
      { x: endX, y: endY + 1 },
      { x: endX, y: endY - 1 }
    ].filter(n => !isTileBlocked(n.x, n.y, obstacles, cols, rows));

    if (neighbors.length === 0) return [];
    // Sort by proximity to start
    neighbors.sort((a, b) => {
      const distA = Math.hypot(a.x - startX, a.y - startY);
      const distB = Math.hypot(b.x - startX, b.y - startY);
      return distA - distB;
    });
    endX = neighbors[0].x;
    endY = neighbors[0].y;
  }

  if (startX === endX && startY === endY) return [];

  const key = (x, y) => `${x},${y}`;
  const openSet = [{ x: startX, y: startY, g: 0, f: Math.hypot(endX - startX, endY - startY) }];
  const cameFrom = new Map();
  const gScore = new Map();
  gScore.set(key(startX, startY), 0);

  const closedSet = new Set();

  while (openSet.length > 0) {
    // Find node with lowest f
    openSet.sort((a, b) => a.f - b.f);
    const current = openSet.shift();
    const currKey = key(current.x, current.y);

    if (current.x === endX && current.y === endY) {
      // Reconstruct path
      const path = [];
      let stepKey = currKey;
      while (cameFrom.has(stepKey)) {
        const [px, py] = stepKey.split(',').map(Number);
        path.unshift({ x: px, y: py });
        stepKey = cameFrom.get(stepKey);
      }
      return path;
    }

    closedSet.add(currKey);

    // 8-directional or 4-directional movement (orthogonal + diagonals)
    const deltas = [
      { dx: 1, dy: 0, cost: 1 },
      { dx: -1, dy: 0, cost: 1 },
      { dx: 0, dy: 1, cost: 1 },
      { dx: 0, dy: -1, cost: 1 },
      { dx: 1, dy: 1, cost: 1.414 },
      { dx: -1, dy: 1, cost: 1.414 },
      { dx: 1, dy: -1, cost: 1.414 },
      { dx: -1, dy: -1, cost: 1.414 }
    ];

    for (const { dx, dy, cost } of deltas) {
      const nx = current.x + dx;
      const ny = current.y + dy;
      const nKey = key(nx, ny);

      if (closedSet.has(nKey)) continue;
      if (isTileBlocked(nx, ny, obstacles, cols, rows)) continue;

      // Don't cut corners through diagonal walls
      if (dx !== 0 && dy !== 0) {
        if (isTileBlocked(current.x + dx, current.y, obstacles, cols, rows) &&
            isTileBlocked(current.x, current.y + dy, obstacles, cols, rows)) {
          continue;
        }
      }

      const tentativeG = current.g + cost;
      if (!gScore.has(nKey) || tentativeG < gScore.get(nKey)) {
        cameFrom.set(nKey, currKey);
        gScore.set(nKey, tentativeG);
        const h = Math.hypot(endX - nx, endY - ny);
        const f = tentativeG + h;

        const existingIdx = openSet.findIndex(n => n.x === nx && n.y === ny);
        if (existingIdx !== -1) {
          openSet[existingIdx].g = tentativeG;
          openSet[existingIdx].f = f;
        } else {
          openSet.push({ x: nx, y: ny, g: tentativeG, f });
        }
      }
    }
  }

  // No path found
  return [];
}

/**
 * Bresenham's Line Algorithm to check if Line-of-Sight between two coordinates is clear.
 * Returns true if unobstructed by opaque obstacles (walls, pillars).
 */
export function hasLineOfSight(x1, y1, x2, y2, obstacles = []) {
  if (x1 === x2 && y1 === y2) return true;

  let dx = Math.abs(x2 - x1);
  let dy = Math.abs(y2 - y1);
  let sx = x1 < x2 ? 1 : -1;
  let sy = y1 < y2 ? 1 : -1;
  let err = dx - dy;

  let curX = x1;
  let curY = y1;

  while (true) {
    if (curX === x2 && curY === y2) break;

    // Don't check the start cell itself
    if (curX !== x1 || curY !== y1) {
      for (const obs of obstacles) {
        if (curX >= obs.x && curX < obs.x + (obs.w || 1) && curY >= obs.y && curY < obs.y + (obs.h || 1)) {
          if (obs.type === 'wall' || obs.type === 'pillar') {
            return false; // Vision blocked
          }
        }
      }
    }

    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      curX += sx;
    }
    if (e2 < dx) {
      err += dx;
      curY += sy;
    }
  }

  return true;
}
