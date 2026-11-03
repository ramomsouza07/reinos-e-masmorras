// Dice engine for D&D 5e: rolls, formulas, advantage, disadvantage

export function rollDie(sides) {
  return Math.floor(Math.random() * sides) + 1;
}

export function parseDiceFormula(formula) {
  if (!formula || typeof formula !== 'string') return null;
  // Support formulas like "2d6+3", "1d20-1", "d8", "4d6kh3" (4d6 keep highest 3)
  const clean = formula.toLowerCase().replace(/\s+/g, '');

  if (/^[+-]?\d+$/.test(clean)) {
    const num = parseInt(clean, 10);
    return { count: 0, sides: 0, mod: num, rolls: [], total: num, raw: formula };
  }

  const match = clean.match(/^(\d*)d(\d+)(?:(kh|kl)(\d+))?([+-]\d+)?$/);

  if (!match) {
    return null;
  }

  const count = match[1] ? parseInt(match[1], 10) : 1;
  const sides = parseInt(match[2], 10);
  const keepType = match[3];
  const keepCount = match[4] ? parseInt(match[4], 10) : count;
  const mod = match[5] ? parseInt(match[5], 10) : 0;

  if (count <= 0 || sides <= 0) return null;

  const rolls = [];
  for (let i = 0; i < count; i++) {
    rolls.push(rollDie(sides));
  }

  let keptRolls = [...rolls];
  if (keepType === 'kh') {
    keptRolls.sort((a, b) => b - a);
    keptRolls = keptRolls.slice(0, Math.min(keepCount, count));
  } else if (keepType === 'kl') {
    keptRolls.sort((a, b) => a - b);
    keptRolls = keptRolls.slice(0, Math.min(keepCount, count));
  }

  const sum = keptRolls.reduce((a, b) => a + b, 0);

  return {
    count,
    sides,
    mod,
    rolls,
    keptRolls,
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
