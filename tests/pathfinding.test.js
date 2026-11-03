import test from 'node:test';
import assert from 'node:assert/strict';
import { isTileBlocked, findPath, hasLineOfSight } from '../src/utils/pathfinding.js';

test('PATH-01: isTileBlocked detects boundary edges', () => {
  assert.equal(isTileBlocked(-1, 0, [], 20, 15), true);
  assert.equal(isTileBlocked(20, 0, [], 20, 15), true);
  assert.equal(isTileBlocked(5, -1, [], 20, 15), true);
  assert.equal(isTileBlocked(5, 15, [], 20, 15), true);
  assert.equal(isTileBlocked(5, 5, [], 20, 15), false);
});

test('PATH-02: isTileBlocked detects obstacles (walls and pillars)', () => {
  const obstacles = [
    { x: 4, y: 4, w: 2, h: 2, type: 'wall' },
    { x: 10, y: 8, w: 1, h: 1, type: 'pillar' }
  ];
  assert.equal(isTileBlocked(4, 4, obstacles), true);
  assert.equal(isTileBlocked(5, 5, obstacles), true);
  assert.equal(isTileBlocked(10, 8, obstacles), true);
  assert.equal(isTileBlocked(3, 4, obstacles), false);
});

test('PATH-03: findPath finds clear straight route', () => {
  const path = findPath(1, 1, 4, 1, [], 20, 15);
  assert.ok(path.length > 0);
  assert.deepEqual(path[path.length - 1], { x: 4, y: 1 });
});

test('PATH-04: findPath maneuvers around an impassable wall', () => {
  const obstacles = [
    { x: 3, y: 0, w: 1, h: 5, type: 'wall' } // Wall cutting across y: 0..4 at x:3
  ];
  const path = findPath(1, 2, 5, 2, obstacles, 20, 15);
  assert.ok(path.length > 0);
  assert.deepEqual(path[path.length - 1], { x: 5, y: 2 });
  // Ensure none of the path points lie on the wall
  for (const pt of path) {
    assert.notEqual(pt.x === 3 && pt.y <= 4, true);
  }
});

test('PATH-05: hasLineOfSight correctly blocks sight through walls', () => {
  const obstacles = [
    { x: 5, y: 2, w: 1, h: 4, type: 'wall' }
  ];
  // Direct horizontal line from (2, 3) to (8, 3) crosses the wall at x=5
  assert.equal(hasLineOfSight(2, 3, 8, 3, obstacles), false);

  // Line above the wall should be clear
  assert.equal(hasLineOfSight(2, 0, 8, 0, obstacles), true);
});
