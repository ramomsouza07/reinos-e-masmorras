// Custom 2D MMORPG Regional Map & Prop Renderer for Reinos & Masmorras

/**
 * Fast deterministic 2D pseudo-random hash for procedural textures.
 * Returns a float between 0.0 and 1.0 based on tile coordinates.
 */
export function hash2D(x, y, seed = 0) {
  let h = (x * 374761393 + y * 668265263 + seed * 1013904223) ^ 0x5bf03665;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

// Helpers that define the custom trails, bridges, and tracks for each regional map
function isForestBridge(c, r) {
  return c >= 8 && c <= 12 && r >= 23 && r <= 26;
}

function isForestRoad(c, r) {
  // Camp clearing in NE
  if (c >= 29 && c <= 39 && r >= 5 && r <= 10) return true;
  // SW road from bridge (10,25) to crossroads (23,16)
  const d1 = Math.abs((r - 25) - ((16 - 25) / (23 - 10)) * (c - 10));
  if (c >= 4 && c <= 24 && d1 <= 1.6) return true;
  // NE road from crossroads (23,16) to camp (33,8)
  const d2 = Math.abs((r - 16) - ((8 - 16) / (33 - 23)) * (c - 23));
  if (c >= 22 && c <= 34 && d2 <= 1.6) return true;
  // North trail from (15,13) to (14,1)
  if (c >= 13 && c <= 15 && r >= 0 && r <= 15) return true;
  // West branch (0..15, 9..10)
  if (c >= 0 && c <= 15 && r >= 8 && r <= 10) return true;
  // SE road from crossroads (23,16) to Boss Cave (41,25)
  const d3 = Math.abs((r - 16) - ((25 - 16) / (41 - 23)) * (c - 23));
  if (c >= 23 && c <= 43 && d3 <= 1.5) return true;
  // Boss clearing in SE
  if (c >= 38 && c <= 43 && r >= 22 && r <= 29) return true;
  return false;
}

function isSwampBridge(c, r) {
  // Upper bridge to Witch's Cabin (NE)
  if (c >= 26 && c <= 31 && r >= 11 && r <= 13) return true;
  // Lower bridge to Boss Island (SE)
  if (c >= 26 && c <= 31 && r >= 23 && r <= 25) return true;
  return false;
}

function isSwampRoad(c, r) {
  // SW path to center island
  const d1 = Math.abs((r - 29) - ((18 - 29) / (19 - 4)) * (c - 4));
  if (c >= 2 && c <= 20 && d1 <= 1.8) return true;
  // NW path from (7,6) to center (19,18)
  const d2 = Math.abs((r - 6) - ((18 - 6) / (19 - 7)) * (c - 7));
  if (c >= 5 && c <= 20 && d2 <= 1.8) return true;
  // Center island hub
  if (c >= 16 && c <= 26 && r >= 12 && r <= 24) return true;
  // Witch cabin yard (NE)
  if (c >= 32 && c <= 42 && r >= 8 && r <= 13) return true;
  // Boss island clearing (SE)
  if (c >= 32 && c <= 44 && r >= 24 && r <= 31) return true;
  return false;
}

function isCaveTrack(c, r) {
  // Horizontal track from (25, 16) to (44, 16)
  if (r === 16 && c >= 25 && c <= 44) return 'h';
  // Vertical track from (44, 16) to (44, 28)
  if (c === 44 && r >= 16 && r <= 28) return 'v';
  // Bottom loop (40..44, 28)
  if (r === 28 && c >= 40 && c <= 44) return 'h';
  return null;
}

function isCaveLadder(c, r) {
  if (c === 14 && r >= 9 && r <= 13) return true;
  if (c === 10 && r >= 21 && r <= 25) return true;
  return false;
}

/**
 * Render custom regional floor tiles, trails, bridges, tracks, and biome details
 */
export function renderThemedFloor(ctx, cols, rows, gridSize, map = {}) {
  const theme = map.theme || 'dungeon';
  const now = Date.now();

  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const x = c * gridSize;
      const y = r * gridSize;
      const rnd = hash2D(c, r);
      const rnd2 = hash2D(c, r, 7);

      if (theme === 'forest') {
        if (isForestBridge(c, r)) {
          // River water beneath bridge edges
          ctx.fillStyle = '#1d4ed8';
          ctx.fillRect(x, y, gridSize, gridSize);
          // Wooden Plank Bridge
          ctx.fillStyle = '#78350f';
          ctx.fillRect(x + 2, y + 2, gridSize - 4, gridSize - 4);
          ctx.strokeStyle = '#451a03';
          ctx.lineWidth = 2;
          for (let p = 4; p < gridSize; p += 10) {
            ctx.beginPath();
            ctx.moveTo(x + 2, y + p);
            ctx.lineTo(x + gridSize - 2, y + p);
            ctx.stroke();
          }
          // Bridge side rails on top/bottom edges
          if (r === 23 || r === 26) {
            ctx.fillStyle = '#92400e';
            ctx.fillRect(x, r === 23 ? y : y + gridSize - 6, gridSize, 6);
          }
          continue;
        }

        const onRoad = isForestRoad(c, r);
        if (onRoad) {
          // Warm Earthy Dirt Road / Camp Ground
          ctx.fillStyle = (c + r) % 2 === 0 ? '#7c583b' : '#714f35';
          ctx.fillRect(x, y, gridSize, gridSize);

          // Soft dirt speckles & pebbles
          ctx.fillStyle = 'rgba(55, 35, 18, 0.35)';
          ctx.beginPath();
          ctx.arc(x + 10 + rnd * 28, y + 10 + rnd2 * 28, 2.5, 0, Math.PI * 2);
          ctx.fill();
          if (rnd > 0.6) {
            ctx.fillStyle = 'rgba(180, 145, 105, 0.3)';
            ctx.beginPath();
            ctx.arc(x + 8 + rnd2 * 30, y + 8 + rnd * 30, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        } else {
          // Lush Forest Grass
          const grassColor = (c + r) % 2 === 0 ? '#244c29' : '#28542e';
          ctx.fillStyle = grassColor;
          ctx.fillRect(x, y, gridSize, gridSize);

          // Grass blades
          if (rnd > 0.25) {
            ctx.strokeStyle = '#3b7a42';
            ctx.lineWidth = 1.5;
            const gx = x + 10 + rnd * (gridSize - 20);
            const gy = y + 14 + rnd2 * (gridSize - 20);
            ctx.beginPath();
            ctx.moveTo(gx, gy);
            ctx.lineTo(gx - 3, gy - 7);
            ctx.moveTo(gx, gy);
            ctx.lineTo(gx + 2, gy - 8);
            ctx.stroke();
          }

          // Wildflowers & Spotted Red Mushrooms inspired by floresta.jpg
          if (rnd > 0.86) {
            // Red & White Spotted Mushroom
            const mx = x + 14 + rnd2 * 24;
            const my = y + 18 + rnd * 20;
            ctx.fillStyle = '#fde68a';
            ctx.fillRect(mx - 2, my, 4, 6);
            ctx.fillStyle = '#dc2626';
            ctx.beginPath();
            ctx.arc(mx, my, 6, Math.PI, 0);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(mx - 3, my - 4, 2, 2);
            ctx.fillRect(mx + 1, my - 3, 2, 2);
          } else if (rnd < 0.14) {
            // Wildflowers
            const fx = x + 12 + rnd * 28;
            const fy = y + 12 + rnd2 * 28;
            ctx.fillStyle = rnd2 > 0.5 ? '#facc15' : '#f472b6';
            ctx.beginPath();
            ctx.arc(fx, fy, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(fx - 1, fy - 1, 2, 2);
          }
        }
      } else if (theme === 'swamp') {
        if (isSwampBridge(c, r)) {
          ctx.fillStyle = '#0d261c';
          ctx.fillRect(x, y, gridSize, gridSize);
          // Weathered Swamp Plank Bridge
          ctx.fillStyle = '#4a3728';
          ctx.fillRect(x + 1, y + 3, gridSize - 2, gridSize - 6);
          ctx.strokeStyle = '#271c15';
          ctx.lineWidth = 2;
          for (let p = 5; p < gridSize; p += 9) {
            ctx.beginPath();
            ctx.moveTo(x + p, y + 3);
            ctx.lineTo(x + p, y + gridSize - 3);
            ctx.stroke();
          }
          continue;
        }

        const onTrail = isSwampRoad(c, r);
        if (onTrail) {
          // Muddy Swamp Trail Island
          ctx.fillStyle = (c + r) % 2 === 0 ? '#3b3326' : '#332b20';
          ctx.fillRect(x, y, gridSize, gridSize);
          if (rnd > 0.65) {
            ctx.fillStyle = 'rgba(20, 35, 22, 0.45)';
            ctx.beginPath();
            ctx.ellipse(x + 24, y + 24, 8, 5, rnd, 0, Math.PI * 2);
            ctx.fill();
          }
        } else {
          // Dark Mossy Marsh Ground
          ctx.fillStyle = (c + r) % 2 === 0 ? '#1b281e' : '#162118';
          ctx.fillRect(x, y, gridSize, gridSize);

          // Swamp ferns & poisonous mushrooms
          if (rnd > 0.78) {
            ctx.strokeStyle = '#15803d';
            ctx.lineWidth = 1.5;
            const fx = x + 16 + rnd * 20;
            const fy = y + 20 + rnd2 * 20;
            ctx.beginPath();
            ctx.moveTo(fx, fy);
            ctx.lineTo(fx - 5, fy - 7);
            ctx.moveTo(fx, fy);
            ctx.lineTo(fx + 5, fy - 7);
            ctx.stroke();
          } else if (rnd < 0.08) {
            // Bleached bones in the mud
            ctx.strokeStyle = '#d6d3d1';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x + 14, y + 18);
            ctx.lineTo(x + 28, y + 26);
            ctx.stroke();
          }
        }
      } else if (theme === 'cave') {
        // Underground Brown/Slate Cavern Floor inspired by caverna.jpg
        const rockShade = (c + r) % 2 === 0 ? '#2b211b' : '#241b16';
        ctx.fillStyle = rockShade;
        ctx.fillRect(x, y, gridSize, gridSize);

        // Cavern floor pebbles & moss patches
        if (rnd > 0.72) {
          ctx.fillStyle = 'rgba(65, 95, 50, 0.28)';
          ctx.beginPath();
          ctx.arc(x + 22, y + 24, 9, 0, Math.PI * 2);
          ctx.fill();
        } else if (rnd < 0.14) {
          // Glowing bioluminescent cyan/purple cave mushrooms
          const mx = x + 16 + rnd * 20;
          const my = y + 18 + rnd2 * 20;
          ctx.fillStyle = rnd2 > 0.5 ? '#22d3ee' : '#c084fc';
          ctx.shadowColor = ctx.fillStyle;
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.arc(mx, my, 4, Math.PI, 0);
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        // Wooden Ladders on cliff ledges
        if (isCaveLadder(c, r)) {
          ctx.strokeStyle = '#b45309';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(x + 12, y);
          ctx.lineTo(x + 12, y + gridSize);
          ctx.moveTo(x + gridSize - 12, y);
          ctx.lineTo(x + gridSize - 12, y + gridSize);
          for (let ry = 8; ry < gridSize; ry += 12) {
            ctx.moveTo(x + 12, y + ry);
            ctx.lineTo(x + gridSize - 12, y + ry);
          }
          ctx.stroke();
        }

        // Iron Minecart Railway Tracks
        const trackDir = isCaveTrack(c, r);
        if (trackDir) {
          ctx.strokeStyle = '#78350f';
          ctx.lineWidth = 4;
          if (trackDir === 'h') {
            for (let tx = 6; tx < gridSize; tx += 12) {
              ctx.beginPath();
              ctx.moveTo(x + tx, y + 12);
              ctx.lineTo(x + tx, y + gridSize - 12);
              ctx.stroke();
            }
            ctx.strokeStyle = '#94a3b8';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(x, y + 16);
            ctx.lineTo(x + gridSize, y + 16);
            ctx.moveTo(x, y + gridSize - 16);
            ctx.lineTo(x + gridSize, y + gridSize - 16);
            ctx.stroke();
          } else {
            for (let ty = 6; ty < gridSize; ty += 12) {
              ctx.beginPath();
              ctx.moveTo(x + 12, y + ty);
              ctx.lineTo(x + gridSize - 12, y + ty);
              ctx.stroke();
            }
            ctx.strokeStyle = '#94a3b8';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(x + 16, y);
            ctx.lineTo(x + 16, y + gridSize);
            ctx.moveTo(x + gridSize - 16, y);
            ctx.lineTo(x + gridSize - 16, y + gridSize);
            ctx.stroke();
          }
        }
      } else {
        // Default: Medieval Crypt / Dungeon Flagstones inspired by dungeon.jpg
        const inCamp = c >= 4 && c <= 16 && r >= 3 && r <= 15;
        const inBossRoom = c >= 32 && c <= 46 && r >= 27 && r <= 36;
        const base = inCamp
          ? ((c + r) % 2 === 0 ? '#2b2320' : '#332925')
          : inBossRoom
          ? ((c + r) % 2 === 0 ? '#28151d' : '#301822')
          : ((c + r) % 2 === 0 ? '#1b1f2e' : '#212638');

        ctx.fillStyle = base;
        ctx.fillRect(x, y, gridSize, gridSize);

        // Inset stone bevel
        ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.fillRect(x + 1, y + 1, gridSize - 2, 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.fillRect(x + 1, y + gridSize - 2, gridSize - 2, 2);

        // Floor Spike Traps in Eastern Corridors
        if ((c >= 33 && c <= 35 && r >= 11 && r <= 13) || (c >= 40 && c <= 42 && r >= 20 && r <= 22)) {
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(x + 6, y + 6, gridSize - 12, gridSize - 12);
          ctx.fillStyle = '#cbd5e1';
          for (let sx = 12; sx <= gridSize - 12; sx += 12) {
            for (let sy = 12; sy <= gridSize - 12; sy += 12) {
              ctx.beginPath();
              ctx.moveTo(x + sx - 3, y + sy + 4);
              ctx.lineTo(x + sx, y + sy - 5);
              ctx.lineTo(x + sx + 3, y + sy + 4);
              ctx.fill();
            }
          }
        }
      }
    }
  }

  // Outer Map Gold Rim
  ctx.strokeStyle = '#D97706';
  ctx.lineWidth = 4;
  ctx.strokeRect(-2, -2, cols * gridSize + 4, rows * gridSize + 4);
}

/**
 * Render custom 2D regional obstacles (Trees, Tents, Cabins, Crystals, Minecarts, Rivers, Dungeon Bars, Altars)
 */
export function render3DObstacles(ctx, obstacles = [], gridSize, now = Date.now(), map = {}) {
  if (!obstacles || obstacles.length === 0) return;
  const theme = map.theme || 'dungeon';

  obstacles.forEach(obs => {
    const ox = obs.x * gridSize;
    const oy = obs.y * gridSize;
    const ow = (obs.w || 1) * gridSize;
    const oh = (obs.h || 1) * gridSize;

    if (obs.type === 'water') {
      // River / Swamp / Subterranean Lake
      const isSwamp = theme === 'swamp';
      const grad = ctx.createLinearGradient(ox, oy, ox + ow, oy + oh);
      if (isSwamp) {
        grad.addColorStop(0, '#0f392b');
        grad.addColorStop(0.5, '#164e3b');
        grad.addColorStop(1, '#0c2e22');
      } else {
        grad.addColorStop(0, '#1d4ed8');
        grad.addColorStop(0.5, '#2563eb');
        grad.addColorStop(1, '#1e40af');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(ox, oy, ow, oh);

      // Shoreline bank border
      ctx.strokeStyle = isSwamp ? '#27382b' : '#a16207';
      ctx.lineWidth = 3;
      ctx.strokeRect(ox + 1, oy + 1, ow - 2, oh - 2);

      // Animated ripples or lilypads
      const waveOffset = Math.sin(now / 500) * 5;
      ctx.strokeStyle = isSwamp ? 'rgba(52, 211, 153, 0.28)' : 'rgba(191, 219, 254, 0.4)';
      ctx.lineWidth = 1.5;
      for (let wy = oy + 16; wy < oy + oh - 10; wy += 24) {
        for (let wx = ox + 14; wx < ox + ow - 18; wx += 32) {
          if (isSwamp && ((wx + wy) % 3 === 0)) {
            // Swamp Lilypad
            ctx.fillStyle = '#15803d';
            ctx.beginPath();
            ctx.arc(wx, wy, 7, 0.2, Math.PI * 1.9);
            ctx.fill();
          } else {
            ctx.beginPath();
            ctx.moveTo(wx + waveOffset, wy);
            ctx.lineTo(wx + 12 + waveOffset, wy);
            ctx.stroke();
          }
        }
      }
      return;
    }

    // Cast Drop Shadow for 3D structures
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fillRect(ox + 4, oy + 4, ow, oh);

    if (obs.type === 'tree') {
      // Custom 2D Multi-Tree Cluster (Lush Forest Pines/Oaks or Dead Swamp Willows)
      const colsT = Math.max(1, obs.w || 1);
      const rowsT = Math.max(1, obs.h || 1);
      for (let tc = 0; tc < colsT; tc++) {
        for (let tr = 0; tr < rowsT; tr++) {
          const tx = ox + tc * gridSize + gridSize / 2;
          const ty = oy + tr * gridSize + gridSize / 2;
          const r = gridSize * 0.48;

          // Trunk
          ctx.fillStyle = theme === 'swamp' ? '#3f342b' : '#5c3a21';
          ctx.fillRect(tx - 5, ty + 4, 10, 14);

          if (theme === 'swamp') {
            // Gnarled Mossy Swamp Tree
            ctx.fillStyle = '#1e3a29';
            ctx.beginPath();
            ctx.arc(tx, ty - 4, r * 0.85, 0, Math.PI * 2);
            ctx.fill();
            // Hanging moss strands
            ctx.strokeStyle = '#4d7c5d';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(tx - 8, ty - 2);
            ctx.lineTo(tx - 8, ty + 10);
            ctx.moveTo(tx + 7, ty - 4);
            ctx.lineTo(tx + 7, ty + 9);
            ctx.stroke();
          } else {
            // Lush Layered Forest Tree
            ctx.fillStyle = '#14532d';
            ctx.beginPath();
            ctx.arc(tx, ty - 2, r, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#166534';
            ctx.beginPath();
            ctx.arc(tx - 3, ty - 5, r * 0.78, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#22c55e';
            ctx.beginPath();
            ctx.arc(tx - 5, ty - 8, r * 0.45, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    } else if (obs.type === 'tent') {
      // 2D RPG Explorer / Crusader Pitched Tent
      const isDungeon = theme === 'dungeon';
      const mainColor = isDungeon ? (obs.x < 10 ? '#7e22ce' : '#15803d') : '#d6c7b2';
      const shadeColor = isDungeon ? (obs.x < 10 ? '#581c87' : '#14532d') : '#a89984';

      ctx.fillStyle = shadeColor;
      ctx.beginPath();
      ctx.moveTo(ox + 4, oy + oh - 4);
      ctx.lineTo(ox + ow / 2, oy + 6);
      ctx.lineTo(ox + ow - 4, oy + oh - 4);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = mainColor;
      ctx.beginPath();
      ctx.moveTo(ox + 4, oy + oh - 4);
      ctx.lineTo(ox + ow / 2, oy + 6);
      ctx.lineTo(ox + ow / 2, oy + oh - 4);
      ctx.closePath();
      ctx.fill();

      // Dark tent doorway flap
      ctx.fillStyle = '#1c1917';
      ctx.beginPath();
      ctx.moveTo(ox + ow / 2 - 10, oy + oh - 4);
      ctx.lineTo(ox + ow / 2, oy + oh * 0.45);
      ctx.lineTo(ox + ow / 2 + 10, oy + oh - 4);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#44403c';
      ctx.lineWidth = 2;
      ctx.strokeRect(ox + 4, oy + 6, ow - 8, oh - 10);
    } else if (obs.type === 'campfire') {
      const cx = ox + ow / 2;
      const cy = oy + oh / 2;

      // Surrounding Wooden Log Benches (left, right, bottom)
      ctx.fillStyle = '#5c3a21';
      ctx.strokeStyle = '#2e1d10';
      ctx.lineWidth = 1.5;
      ctx.fillRect(cx - gridSize * 1.1, cy - 16, 12, 32);
      ctx.strokeRect(cx - gridSize * 1.1, cy - 16, 12, 32);
      ctx.fillRect(cx + gridSize * 1.1 - 12, cy - 16, 12, 32);
      ctx.strokeRect(cx + gridSize * 1.1 - 12, cy - 16, 12, 32);

      // Ring of Stones
      ctx.fillStyle = '#57534e';
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
        ctx.beginPath();
        ctx.arc(cx + Math.cos(a) * 14, cy + Math.sin(a) * 14, 5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Crossed Firewood Logs
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(cx - 10, cy - 8);
      ctx.lineTo(cx + 10, cy + 8);
      ctx.moveTo(cx + 10, cy - 8);
      ctx.lineTo(cx - 10, cy + 8);
      ctx.stroke();

      // Flickering Flames
      const flicker = Math.sin(now / 110) * 3;
      ctx.fillStyle = '#f97316';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(cx, cy - 2, 10 + flicker * 0.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(cx, cy - 3, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    } else if (obs.type === 'pillar') {
      if (theme === 'cave') {
        // Glowing Crystal Cluster (Sapphire / Amethyst)
        const cx = ox + ow / 2;
        const cy = oy + oh / 2;
        const isPurple = (obs.x + obs.y) % 2 === 0;
        const cMain = isPurple ? '#a855f7' : '#06b6d4';
        const cLight = isPurple ? '#e9d5ff' : '#cffafe';

        ctx.save();
        ctx.shadowColor = cMain;
        ctx.shadowBlur = 16;
        ctx.fillStyle = cMain;
        // 3 crystal shards
        [
          { dx: -12, dy: 6, w: 12, h: 28, rot: -0.25 },
          { dx: 0, dy: 0, w: 14, h: 36, rot: 0.05 },
          { dx: 12, dy: 8, w: 11, h: 26, rot: 0.3 }
        ].forEach(s => {
          ctx.save();
          ctx.translate(cx + s.dx, cy + s.dy);
          ctx.rotate(s.rot);
          ctx.beginPath();
          ctx.moveTo(0, -s.h / 2);
          ctx.lineTo(s.w / 2, 0);
          ctx.lineTo(s.w / 3, s.h / 2);
          ctx.lineTo(-s.w / 3, s.h / 2);
          ctx.lineTo(-s.w / 2, 0);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = cLight;
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.restore();
        });
        ctx.restore();
      } else {
        // Carved Stone Sarcophagus / Runic Pillar
        ctx.fillStyle = '#334155';
        ctx.fillRect(ox + 4, oy + 4, ow - 8, oh - 8);
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 2;
        ctx.strokeRect(ox + 8, oy + 8, ow - 16, oh - 16);
      }
    } else if (obs.type === 'altar') {
      // Mystical Glowing Altar
      const pulse = (Math.sin(now / 260) + 1) / 2;
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(ox, oy, ow, oh);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.strokeRect(ox + 2, oy + 2, ow - 4, oh - 4);

      const cx = ox + ow / 2;
      const cy = oy + oh / 2;
      ctx.fillStyle = `rgba(168, 85, 247, ${0.5 + pulse * 0.4})`;
      ctx.shadowColor = '#a855f7';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(cx, cy, Math.min(ow, oh) * 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    } else if (obs.type === 'table') {
      // Wooden Supply Table & Barrels
      ctx.fillStyle = '#78350f';
      ctx.fillRect(ox + 4, oy + 6, ow - 8, oh - 12);
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 2;
      ctx.strokeRect(ox + 4, oy + 6, ow - 8, oh - 12);
    } else if (obs.type === 'fence') {
      // Wooden Palisade / Picket Fence
      ctx.fillStyle = '#78350f';
      ctx.fillRect(ox, oy + oh / 2 - 4, ow, 8);
      for (let fx = ox + 6; fx < ox + ow - 4; fx += 14) {
        ctx.fillStyle = '#92400e';
        ctx.fillRect(fx, oy + 6, 6, oh - 12);
      }
    } else {
      // Stone Wall / Witch's Cabin / Cliffside
      if (theme === 'swamp' && obs.label?.includes('Cabana')) {
        // Baba Morwenna's Mossy Wooden Cabin on Stilts
        ctx.fillStyle = '#3f2e21';
        ctx.fillRect(ox, oy, ow, oh);
        // Mossy Roof shingles
        ctx.fillStyle = '#2d4a2b';
        ctx.fillRect(ox + 4, oy + 4, ow - 8, oh * 0.55);
        // Glowing Cabin Window & Door
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(ox + ow * 0.7, oy + oh * 0.65, 16, 16);
        ctx.fillStyle = '#1c1917';
        ctx.fillRect(ox + ow * 0.3, oy + oh * 0.62, 22, oh * 0.38);
        ctx.strokeStyle = '#1f1610';
        ctx.lineWidth = 3;
        ctx.strokeRect(ox, oy, ow, oh);
      } else {
        const grad = ctx.createLinearGradient(ox, oy, ox, oy + oh);
        grad.addColorStop(0, theme === 'cave' || theme === 'forest' ? '#574c43' : '#334155');
        grad.addColorStop(1, theme === 'cave' || theme === 'forest' ? '#38302a' : '#1e293b');
        ctx.fillStyle = grad;
        ctx.fillRect(ox, oy, ow, oh);
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(ox, oy, ow, oh);
      }
    }

    // Label on obstacle if large
    if (obs.label && ow >= gridSize * 2) {
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'black';
      ctx.shadowBlur = 4;
      ctx.fillText(obs.label, ox + ow / 2, oy + oh / 2);
      ctx.shadowBlur = 0;
    }
  });
}

/**
 * Render flickering torches & soft atmospheric lighting
 */
export function renderLightingAndVignette(ctx, torches = [], cols, rows, gridSize, now = Date.now()) {
  if (torches && torches.length > 0) {
    torches.forEach((t, idx) => {
      const tx = t.x * gridSize + gridSize / 2;
      const ty = t.y * gridSize + gridSize / 2;
      const flicker = Math.sin(now / 140 + idx * 2.1) * 0.08 + Math.cos(now / 90 + idx) * 0.05;
      const radius = gridSize * (3.2 + flicker);

      const grad = ctx.createRadialGradient(tx, ty, 4, tx, ty, radius);
      grad.addColorStop(0, 'rgba(251, 191, 36, 0.26)');
      grad.addColorStop(0.45, 'rgba(245, 158, 11, 0.10)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(tx, ty, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.arc(tx, ty, 5 + flicker * 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FEF08A';
      ctx.beginPath();
      ctx.arc(tx, ty, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });
  }
}

/**
 * Render Pathfinding Route Preview
 */
export function renderPathfindingPreview(ctx, path = [], gridSize, maxMoveSquares = 6) {
  if (!path || path.length === 0) return;

  ctx.save();
  for (let i = 0; i < path.length; i++) {
    const step = path[i];
    const cx = step.x * gridSize + gridSize / 2;
    const cy = step.y * gridSize + gridSize / 2;

    ctx.fillStyle = 'rgba(16, 185, 129, 0.65)';
    ctx.beginPath();
    ctx.arc(cx, cy, i === path.length - 1 ? 8 : 5, 0, Math.PI * 2);
    ctx.fill();

    if (i > 0) {
      const prev = path[i - 1];
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.75)';
      ctx.lineWidth = 3;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(prev.x * gridSize + gridSize / 2, prev.y * gridSize + gridSize / 2);
      ctx.lineTo(cx, cy);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }
  ctx.restore();
}

/**
 * Render Active Flying Projectiles
 */
export function renderActiveProjectiles(ctx, projectiles = [], gridSize, now = Date.now()) {
  if (!projectiles || projectiles.length === 0) return;

  projectiles.forEach(proj => {
    const elapsed = now - proj.startTime;
    const duration = proj.duration || 320;
    const t = Math.min(1, Math.max(0, elapsed / duration));

    const sx = proj.fromX * gridSize + gridSize / 2;
    const sy = proj.fromY * gridSize + gridSize / 2;
    const tx = proj.toX * gridSize + gridSize / 2;
    const ty = proj.toY * gridSize + gridSize / 2;

    const curX = sx + (tx - sx) * t;
    const curY = sy + (ty - sy) * t;
    const angle = Math.atan2(ty - sy, tx - sx);

    ctx.save();
    ctx.translate(curX, curY);
    ctx.rotate(angle);

    if (proj.type === 'fire') {
      ctx.fillStyle = '#F97316';
      ctx.shadowColor = '#EF4444';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(0, 0, 9, 0, Math.PI * 2);
      ctx.fill();
    } else if (proj.type === 'arrow') {
      ctx.strokeStyle = '#FDE68A';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-12, 0);
      ctx.lineTo(10, 0);
      ctx.stroke();
    } else {
      ctx.fillStyle = '#C084FC';
      ctx.shadowColor = '#A855F7';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(0, 0, 7, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  });
}

/**
 * Render Land Portal / Archway (Locked while Boss is alive, Active glowing vortex when Boss defeated)
 */
export function renderLandPortal(ctx, portalPos, gridSize, bossDefeated, portalName, myToken, now = Date.now()) {
  if (!portalPos) return;
  const px = portalPos.x * gridSize + gridSize / 2;
  const py = portalPos.y * gridSize + gridSize / 2;
  const radius = gridSize * 0.65;

  ctx.save();
  ctx.beginPath();
  ctx.arc(px, py, radius + 6, 0, Math.PI * 2);
  ctx.fillStyle = '#1e293b';
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = bossDefeated ? '#10b981' : '#ef4444';
  ctx.stroke();

  if (bossDefeated) {
    const pulse = Math.sin(now / 200) * 4;
    const grad = ctx.createRadialGradient(px, py, 4, px, py, radius + pulse);
    grad.addColorStop(0, '#a7f3d0');
    grad.addColorStop(0.5, '#10b981');
    grad.addColorStop(1, '#047857');
    ctx.fillStyle = grad;
    ctx.shadowColor = '#10b981';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(px, py, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.font = '24px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🌀', px, py);
  } else {
    ctx.fillStyle = '#450a0a';
    ctx.beginPath();
    ctx.arc(px, py, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = '22px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🔒', px, py);
  }

  ctx.font = 'bold 11px Cinzel, serif';
  ctx.fillStyle = bossDefeated ? '#6ee7b7' : '#fca5a5';
  ctx.textAlign = 'center';
  ctx.shadowColor = 'black';
  ctx.shadowBlur = 5;
  ctx.fillText(portalName || 'Portal da Land', px, py + radius + 16);
  ctx.fillText(bossDefeated ? 'ABERTO — [E] AVANÇAR' : 'SELADO PELO BOSS', px, py + radius + 29);
  ctx.shadowBlur = 0;

  if (myToken && bossDefeated) {
    const dist = Math.max(Math.abs(portalPos.x - myToken.x), Math.abs(portalPos.y - myToken.y));
    if (dist <= 2.2) {
      ctx.fillStyle = '#10B981';
      ctx.shadowColor = '#10B981';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.roundRect(px - 68, py - radius - 34, 136, 24, 6);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.font = 'bold 11px monospace';
      ctx.fillStyle = '#000000';
      ctx.fillText('[E] Viajar p/ Próxima Land', px, py - radius - 22);
    }
  }
  ctx.restore();
}

/**
 * Render Gatherable Items on Map (Herbs, Mushrooms, Crystals, Relics)
 */
export function renderGatherables(ctx, gatherables = [], gridSize, myToken, now = Date.now()) {
  if (!gatherables || gatherables.length === 0) return;

  gatherables.forEach(g => {
    if (g.gathered) return;
    const gx = g.x * gridSize + gridSize / 2;
    const gy = g.y * gridSize + gridSize / 2;
    const floatY = Math.sin(now / 300 + g.x) * 3;

    ctx.save();
    ctx.beginPath();
    ctx.arc(gx, gy, gridSize * 0.32, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(52, 211, 153, 0.6)';
    ctx.stroke();

    ctx.font = '20px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(g.icon || '🌿', gx, gy + floatY);

    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.fillStyle = '#a7f3d0';
    ctx.shadowColor = 'black';
    ctx.shadowBlur = 3;
    ctx.fillText(g.name, gx, gy + gridSize * 0.44);
    ctx.shadowBlur = 0;

    if (myToken) {
      const dist = Math.max(Math.abs(g.x - myToken.x), Math.abs(g.y - myToken.y));
      if (dist <= 1.5) {
        ctx.fillStyle = '#10B981';
        ctx.beginPath();
        ctx.roundRect(gx - 38, gy - gridSize * 0.62, 76, 18, 5);
        ctx.fill();
        ctx.font = 'bold 10px monospace';
        ctx.fillStyle = '#000000';
        ctx.fillText('[E] Coletar', gx, gy - gridSize * 0.62 + 9);
      }
    }
    ctx.restore();
  });
}
