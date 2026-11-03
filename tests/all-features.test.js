import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ABILITIES,
  POINT_BUY_COSTS,
  LEVEL_XP_TABLE,
  SKILLS,
  RACES,
  CLASSES,
  ITEMS,
  SPELLS,
  MONSTERS,
  MAP_PRESETS,
  ADVENTURES,
  CONDITIONS,
  getAbilityMod,
  formatMod,
  calculateCharacterDerivedStats
} from '../src/data/dndData.js';
import {
  rollDie,
  parseDiceFormula,
  rollD20,
  roll4d6DropLowest
} from '../src/utils/dice.js';

// ============================================================================
// SUITE 1: DICE ENGINE (src/utils/dice.js)
// ============================================================================
test('DICE-01: rollDie(sides) gera valores inteiros dentro de [1..sides]', () => {
  for (const sides of [4, 6, 8, 10, 12, 20, 100]) {
    for (let i = 0; i < 40; i++) {
      const val = rollDie(sides);
      assert.equal(Number.isInteger(val), true);
      assert.equal(val >= 1 && val <= sides, true);
    }
  }
});

test('DICE-02: parseDiceFormula analisa fórmulas válidas (2d6+3, 1d20-1, d8, 15)', () => {
  const r1 = parseDiceFormula('2d6+3');
  assert.ok(r1);
  assert.equal(r1.count, 2);
  assert.equal(r1.sides, 6);
  assert.equal(r1.mod, 3);
  assert.equal(r1.total, r1.rolls[0] + r1.rolls[1] + 3);

  const r2 = parseDiceFormula('1d20-1');
  assert.ok(r2);
  assert.equal(r2.count, 1);
  assert.equal(r2.sides, 20);
  assert.equal(r2.mod, -1);

  const r3 = parseDiceFormula('d8');
  assert.ok(r3);
  assert.equal(r3.count, 1);
  assert.equal(r3.sides, 8);

  const r4 = parseDiceFormula('15');
  assert.ok(r4);
  assert.equal(r4.count, 0);
  assert.equal(r4.total, 15);
});

test('DICE-03: parseDiceFormula rejeita fórmulas malformadas iniciadas por dígitos', () => {
  assert.equal(parseDiceFormula('abc'), null);
  assert.equal(parseDiceFormula(''), null);
  assert.equal(parseDiceFormula('2d6+1d4'), null);
  assert.equal(parseDiceFormula('10abc'), null);
});

test('DICE-04: parseDiceFormula trata entrada null/undefined sem lançar TypeError', () => {
  assert.equal(parseDiceFormula(null), null);
  assert.equal(parseDiceFormula(undefined), null);
});

test('DICE-05: rollD20 aplica modificadores, Vantagem e Desvantagem', () => {
  for (let i = 0; i < 30; i++) {
    const norm = rollD20(5, 'normal');
    assert.equal(norm.roll2, null);
    assert.equal(norm.total, norm.selectedRoll + 5);

    const adv = rollD20(2, 'advantage');
    assert.equal(adv.selectedRoll, Math.max(adv.roll1, adv.roll2));
    assert.equal(adv.discardedRoll, Math.min(adv.roll1, adv.roll2));

    const dis = rollD20(-1, 'disadvantage');
    assert.equal(dis.selectedRoll, Math.min(dis.roll1, dis.roll2));
  }
});

test('DICE-06: roll4d6DropLowest rola 4d6, descarta o menor dado e soma os 3 maiores', () => {
  for (let i = 0; i < 30; i++) {
    const res = roll4d6DropLowest();
    assert.equal(res.rolls.length, 4);
    assert.equal(res.kept.length, 3);
    assert.equal(res.dropped, Math.min(...res.rolls));
    assert.equal(res.total, res.kept.reduce((a, b) => a + b, 0));
  }
});

// ============================================================================
// SUITE 2: D&D 5e RULES & DATA (src/data/dndData.js)
// ============================================================================
test('DND-01: getAbilityMod e formatMod seguem a tabela oficial do D&D 5e', () => {
  assert.equal(getAbilityMod(1), -5);
  assert.equal(getAbilityMod(8), -1);
  assert.equal(getAbilityMod(10), 0);
  assert.equal(getAbilityMod(11), 0);
  assert.equal(getAbilityMod(15), 2);
  assert.equal(getAbilityMod(20), 5);
  assert.equal(formatMod(3), '+3');
  assert.equal(formatMod(0), '+0');
  assert.equal(formatMod(-2), '-2');
});

test('DND-02: calculateCharacterDerivedStats calcula CA, CD de Magia e Carga corretamente', () => {
  const c1 = calculateCharacterDerivedStats({
    classId: 'wizard',
    level: 1,
    stats: { str: 8, dex: 16, con: 14, int: 16, wis: 12, cha: 10 },
    inventory: []
  });
  assert.equal(c1.ac, 13);
  assert.equal(c1.spellSaveDC, 13);
  assert.equal(c1.spellAtkBonus, 5);

  const c2 = calculateCharacterDerivedStats({
    classId: 'barbarian',
    level: 1,
    stats: { str: 16, dex: 14, con: 16, int: 8, wis: 12, cha: 10 },
    inventory: [ITEMS.escudo]
  });
  assert.equal(c2.ac, 17);

  const c3 = calculateCharacterDerivedStats({
    classId: 'fighter',
    level: 1,
    stats: { str: 16, dex: 14, con: 14, int: 10, wis: 10, cha: 10 },
    inventory: [ITEMS.cota_de_malha, ITEMS.escudo, ITEMS.anel_protecao]
  });
  assert.equal(c3.ac, 19);
});

test('DND-03: Integridade referencial de CLASSES (starterGear e spells)', () => {
  for (const cls of CLASSES) {
    for (const itemId of cls.starterGear || []) {
      assert.ok(ITEMS[itemId], `Item inicial inexistente: ${cls.id}:${itemId}`);
    }
    for (const spellId of cls.spells || []) {
      assert.ok(SPELLS.some(s => s.id === spellId), `Magia de classe inexistente: ${cls.id}:${spellId}`);
    }
  }
});

test('DND-04: Integridade referencial de ADVENTURES (mapas, monstros e baús)', () => {
  for (const adv of ADVENTURES) {
    assert.ok(MAP_PRESETS.some(m => m.id === adv.mapId));
    for (const enemy of adv.enemies) {
      assert.ok(MONSTERS.some(m => m.id === enemy.monsterId));
    }
    for (const chest of adv.chests) {
      assert.ok(ITEMS[chest.itemId]);
    }
  }
});
