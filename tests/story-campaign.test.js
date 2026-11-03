import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { STORY_CAMPAIGN } from '../src/data/storyCampaign.js';
import { MAP_PRESETS, MONSTERS, ITEMS } from '../src/data/dndData.js';
import { DEFAULT_APPEARANCE, SKIN_TONES, HAIR_STYLES, OUTFIT_TYPES } from '../src/data/characterSpriteData.js';
import { isTileBlocked } from '../src/utils/pathfinding.js';

// ============================================================================
// SUITE: STORY CAMPAIGN & LAND PROGRESSION
// ============================================================================
test('STORY-01: Campanha possui exatamente 4 Lands com progressão de biomas', () => {
  assert.equal(Array.isArray(STORY_CAMPAIGN.lands), true);
  assert.equal(STORY_CAMPAIGN.lands.length, 4);

  const landThemes = STORY_CAMPAIGN.lands.map(l => l.theme);
  assert.deepEqual(landThemes, ['forest', 'swamp', 'cave', 'dungeon']);
});

test('STORY-02: Cada Land possui Boss exclusivo, Portal de Passagem e Relíquia', () => {
  STORY_CAMPAIGN.lands.forEach((land, idx) => {
    assert.ok(land.bossId, `Land ${idx + 1} deve ter um bossId`);
    assert.ok(land.bossName, `Land ${idx + 1} deve ter um bossName`);
    assert.ok(land.portalPosition, `Land ${idx + 1} deve ter portalPosition`);
    assert.ok(typeof land.portalPosition.x === 'number');
    assert.ok(typeof land.portalPosition.y === 'number');
    assert.ok(land.relicReward, `Land ${idx + 1} deve ter relicReward`);
    assert.ok(land.relicReward.id);
    assert.ok(land.relicReward.name);
  });
});

test('STORY-03: Os mapas das 4 Lands são extensos (cols >= 46, rows >= 32)', () => {
  STORY_CAMPAIGN.lands.forEach((land, idx) => {
    assert.ok(land.cols >= 46, `Land ${idx + 1} cols deve ser >= 46`);
    assert.ok(land.rows >= 32, `Land ${idx + 1} rows deve ser >= 32`);

    // Map preset correspondente existe
    const preset = MAP_PRESETS.find(m => m.id === land.id);
    assert.ok(preset, `Preset para ${land.id} deve existir em MAP_PRESETS`);
    assert.equal(preset.cols, land.cols);
    assert.equal(preset.rows, land.rows);
  });
});

test('STORY-04: Cada Land possui NPCs com diálogos e opções interativas', () => {
  STORY_CAMPAIGN.lands.forEach((land, idx) => {
    assert.ok(Array.isArray(land.npcs) && land.npcs.length >= 2, `Land ${idx + 1} deve ter pelo menos 2 NPCs`);
    land.npcs.forEach(npc => {
      assert.ok(npc.id);
      assert.ok(npc.name);
      assert.ok(npc.dialogue);
      assert.ok(npc.dialogue.greeting);
      assert.ok(Array.isArray(npc.dialogue.options) && npc.dialogue.options.length > 0);
    });
  });
});

test('STORY-05: Escalonamento de Dificuldade dos Monstros e Bosses por Land', () => {
  const hpProgression = STORY_CAMPAIGN.lands.map(l => l.boss.hp);
  // [55, 95, 150, 220]
  assert.equal(hpProgression[0] < hpProgression[1], true);
  assert.equal(hpProgression[1] < hpProgression[2], true);
  assert.equal(hpProgression[2] < hpProgression[3], true);
});

test('STORY-06: Itens e Recompensas de Baús existem na base de ITEMS', () => {
  STORY_CAMPAIGN.lands.forEach(land => {
    (land.chests || []).forEach(ch => {
      assert.ok(ITEMS[ch.itemId], `Item do baú ${ch.itemId} deve existir em ITEMS`);
    });
  });
});

test('SPRITE-01: Customizador 2D possui opções válidas de pele, cabelo e vestimenta', () => {
  assert.ok(SKIN_TONES.length >= 5);
  assert.ok(HAIR_STYLES.length >= 5);
  assert.ok(OUTFIT_TYPES.length >= 5);
  assert.ok(DEFAULT_APPEARANCE.skinTone);
  assert.ok(DEFAULT_APPEARANCE.outfitType);
});

test('STORY-07: Mapas das 4 Lands possuem arquitetura 2D própria (sem imagem estática de fundo) e pontos transitáveis', () => {
  STORY_CAMPAIGN.lands.forEach(land => {
    const preset = MAP_PRESETS.find(m => m.id === land.id);
    assert.ok(preset, `Preset ${land.id} deve existir`);
    assert.equal(preset.bgImage, undefined, `${land.id} deve usar renderização 2D própria no canvas sem bgImage estática`);
    assert.equal(preset.theme, land.theme);
    assert.ok(Array.isArray(preset.obstacles) && preset.obstacles.length >= 12, `${land.id} deve ter obstáculos regionais ricos`);

    // Verifica que startPosition e NPCs não estão dentro de paredes/obstáculos
    assert.equal(
      isTileBlocked(land.startPosition.x, land.startPosition.y, preset.obstacles, land.cols, land.rows),
      false,
      `startPosition de ${land.id} não pode estar bloqueada`
    );
    land.npcs.forEach(npc => {
      assert.equal(
        isTileBlocked(npc.x, npc.y, preset.obstacles, land.cols, land.rows),
        false,
        `NPC ${npc.name} em ${land.id} não pode estar bloqueado`
      );
    });
  });
});
