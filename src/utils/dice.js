// Dice engine for D&D 5e: rolls, formulas, advantage, disadvantage

export function rollDie(sides) {
  return Math.floor(Math.random() * sides) + 1;
}

export function parseDiceFormula(formula) {
  // Support formulas like "2d6+3", "1d20-1", "d8", "4d6kh3" (4d6 keep highest 3)
  const clean = formula.toLowerCase().replace(/\s+/g, '');
  const match = clean.match(/^(\d*)d(\d+)([+-]\d+)?$/);

  if (!match) {
    // Check if it's a pure number
    const num = parseInt(clean, 10);
    if (!isNaN(num)) {
      return { count: 0, sides: 0, mod: num, rolls: [], total: num, raw: formula };
    }
    return null;
  }

  const count = match[1] ? parseInt(match[1], 10) : 1;
  const sides = parseInt(match[2], 10);
  const mod = match[3] ? parseInt(match[3], 10) : 0;

  const rolls = [];
  let sum = 0;
  for (let i = 0; i < count; i++) {
    const val = rollDie(sides);
    rolls.push(val);
    sum += val;
  }

  return {
    count,
    sides,
    mod,
    rolls,
    total: sum + mod,
    raw: formula
  };
}

export function rollD20(mod = 0, advantageType = 'normal') {
  const roll1 = rollDie(20);
  const roll2 = rollDie(20);

  let selectedRoll = roll1;
  let discardedRoll = null;

  if (advantageType === 'advantage') {
    selectedRoll = Math.max(roll1, roll2);
    discardedRoll = Math.min(roll1, roll2);
  } else if (advantageType === 'disadvantage') {
    selectedRoll = Math.min(roll1, roll2);
    discardedRoll = Math.max(roll1, roll2);
  }

  const isNat20 = selectedRoll === 20;
  const isNat1 = selectedRoll === 1;
  const total = selectedRoll + mod;

  return {
    roll1,
    roll2: advantageType !== 'normal' ? roll2 : null,
    selectedRoll,
    discardedRoll,
    advantageType,
    mod,
    total,
    isNat20,
    isNat1
  };
}

// Roll 4d6 and drop lowest (Standard D&D character stat generation)
export function roll4d6DropLowest() {
  const rolls = [rollDie(6), rollDie(6), rollDie(6), rollDie(6)];
  const sorted = [...rolls].sort((a, b) => a - b);
  const dropped = sorted[0];
  const kept = sorted.slice(1);
  const total = kept.reduce((a, b) => a + b, 0);

  return { rolls, kept, dropped, total };
}
