import React, { useRef, useEffect } from 'react';
export {
  SKIN_TONES,
  HAIR_STYLES,
  HAIR_COLORS,
  OUTFIT_TYPES,
  OUTFIT_COLORS,
  HEADWEAR_TYPES,
  WEAPON_TYPES,
  DEFAULT_APPEARANCE
} from '../data/characterSpriteData.js';
import { DEFAULT_APPEARANCE } from '../data/characterSpriteData.js';

/**
 * Função de renderização pura em HTML5 Canvas para desenhar o personagem 2D
 */
export function drawCharacter2D(ctx, cx, cy, size = 52, appearance = {}, options = {}) {
  const app = { ...DEFAULT_APPEARANCE, ...appearance };
  const scale = size / 52;
  const isMoving = options.isMoving || false;
  const animOffset = isMoving ? Math.sin(Date.now() / 120) * (2 * scale) : 0;

  ctx.save();
  ctx.translate(cx, cy);

  // 1. Sombra oval no chão
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.beginPath();
  ctx.ellipse(0, 18 * scale, 14 * scale, 6 * scale, 0, 0, Math.PI * 2);
  ctx.fill();

  // 2. Capa traseira (se ranger ou robe)
  if (app.outfitType === 'ranger' || app.outfitType === 'robe') {
    ctx.fillStyle = app.outfitSecondaryColor || '#14532d';
    ctx.beginPath();
    ctx.moveTo(-10 * scale, -2 * scale);
    ctx.lineTo(10 * scale, -2 * scale);
    ctx.lineTo(13 * scale, 16 * scale + animOffset);
    ctx.lineTo(-13 * scale, 16 * scale + animOffset);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.lineWidth = 1 * scale;
    ctx.stroke();
  }

  // 3. Pernas e Botas
  const legOffset = isMoving ? Math.sin(Date.now() / 100) * (3 * scale) : 0;
  ctx.fillStyle = '#292524'; // calça escura
  ctx.fillRect(-6 * scale, 8 * scale, 4 * scale, 7 * scale);
  ctx.fillRect(2 * scale, 8 * scale, 4 * scale, 7 * scale);

  // Botas de couro
  ctx.fillStyle = '#451a03';
  ctx.beginPath();
  ctx.roundRect(-7 * scale, 13 * scale + legOffset, 5 * scale, 5 * scale, 2 * scale);
  ctx.roundRect(2 * scale, 13 * scale - legOffset, 5 * scale, 5 * scale, 2 * scale);
  ctx.fill();

  // 4. Tronco e Roupa / Armadura
  ctx.fillStyle = app.outfitColor || '#2563eb';
  ctx.beginPath();
  ctx.roundRect(-9 * scale, -4 * scale + animOffset, 18 * scale, 14 * scale, 3 * scale);
  ctx.fill();

  // Detalhes da Roupa (Golas, Fivelas, Placas)
  if (app.outfitType === 'plate') {
    // Placas de aço metálico com brilho
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(-7 * scale, -2 * scale + animOffset, 14 * scale, 10 * scale);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillRect(-6 * scale, -2 * scale + animOffset, 3 * scale, 8 * scale);
    // Cruz ou emblema
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(-1.5 * scale, 0 + animOffset, 3 * scale, 6 * scale);
    ctx.fillRect(-4 * scale, 2 * scale + animOffset, 8 * scale, 2 * scale);
  } else if (app.outfitType === 'chainmail') {
    // Malha texturizada
    ctx.fillStyle = '#64748b';
    ctx.fillRect(-7 * scale, -2 * scale + animOffset, 14 * scale, 10 * scale);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1 * scale;
    ctx.strokeRect(-7 * scale, -2 * scale + animOffset, 14 * scale, 10 * scale);
  } else {
    // Cinto e Fivela de Couro
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-9 * scale, 5 * scale + animOffset, 18 * scale, 3 * scale);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(-2 * scale, 4.5 * scale + animOffset, 4 * scale, 4 * scale);
  }

  // 5. Braços e Mãos
  // Braço esquerdo
  ctx.fillStyle = app.outfitColor || '#2563eb';
  ctx.beginPath();
  ctx.roundRect(-12 * scale, -3 * scale + animOffset, 4 * scale, 10 * scale, 2 * scale);
  ctx.fill();
  // Mão esquerda
  ctx.fillStyle = app.skinTone || '#f5c6a5';
  ctx.beginPath();
  ctx.arc(-10 * scale, 8 * scale + animOffset, 2.5 * scale, 0, Math.PI * 2);
  ctx.fill();

  // Braço direito
  ctx.fillStyle = app.outfitColor || '#2563eb';
  ctx.beginPath();
  ctx.roundRect(8 * scale, -3 * scale + animOffset, 4 * scale, 10 * scale, 2 * scale);
  ctx.fill();
  // Mão direita
  ctx.fillStyle = app.skinTone || '#f5c6a5';
  ctx.beginPath();
  ctx.arc(10 * scale, 8 * scale + animOffset, 2.5 * scale, 0, Math.PI * 2);
  ctx.fill();

  // 6. Cabeça e Rosto
  ctx.fillStyle = app.skinTone || '#f5c6a5';
  ctx.beginPath();
  ctx.arc(0, -11 * scale + animOffset, 7.5 * scale, 0, Math.PI * 2);
  ctx.fill();

  // Olhos
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(-3 * scale, -12 * scale + animOffset, 2 * scale, 2.5 * scale);
  ctx.fillRect(1.5 * scale, -12 * scale + animOffset, 2 * scale, 2.5 * scale);
  // Brilho dos olhos
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(-2.5 * scale, -12 * scale + animOffset, 1 * scale, 1 * scale);
  ctx.fillRect(2 * scale, -12 * scale + animOffset, 1 * scale, 1 * scale);

  // 7. Cabelo
  if (app.hairStyle !== 'bald') {
    ctx.fillStyle = app.hairColor || '#451a03';
    if (app.hairStyle === 'short') {
      ctx.beginPath();
      ctx.arc(0, -14 * scale + animOffset, 8 * scale, Math.PI, 0);
      ctx.lineTo(8 * scale, -10 * scale + animOffset);
      ctx.lineTo(-8 * scale, -10 * scale + animOffset);
      ctx.fill();
      // Franja
      ctx.fillRect(-6 * scale, -15 * scale + animOffset, 4 * scale, 3 * scale);
      ctx.fillRect(0, -15 * scale + animOffset, 4 * scale, 3 * scale);
    } else if (app.hairStyle === 'long') {
      ctx.beginPath();
      ctx.arc(0, -14 * scale + animOffset, 8.5 * scale, Math.PI, 0);
      ctx.lineTo(9 * scale, -4 * scale + animOffset);
      ctx.lineTo(7 * scale, -4 * scale + animOffset);
      ctx.lineTo(6 * scale, -10 * scale + animOffset);
      ctx.lineTo(-6 * scale, -10 * scale + animOffset);
      ctx.lineTo(-7 * scale, -4 * scale + animOffset);
      ctx.lineTo(-9 * scale, -4 * scale + animOffset);
      ctx.fill();
    } else if (app.hairStyle === 'ponytail') {
      ctx.beginPath();
      ctx.arc(0, -14 * scale + animOffset, 8 * scale, Math.PI, 0);
      ctx.fill();
      // Rabo lateral
      ctx.beginPath();
      ctx.ellipse(9 * scale, -12 * scale + animOffset, 3 * scale, 6 * scale, 0.4, 0, Math.PI * 2);
      ctx.fill();
    } else if (app.hairStyle === 'spiky') {
      ctx.beginPath();
      ctx.moveTo(-7 * scale, -13 * scale + animOffset);
      ctx.lineTo(-4 * scale, -19 * scale + animOffset);
      ctx.lineTo(-1 * scale, -14 * scale + animOffset);
      ctx.lineTo(2 * scale, -20 * scale + animOffset);
      ctx.lineTo(5 * scale, -14 * scale + animOffset);
      ctx.lineTo(7 * scale, -18 * scale + animOffset);
      ctx.lineTo(8 * scale, -12 * scale + animOffset);
      ctx.lineTo(-8 * scale, -12 * scale + animOffset);
      ctx.fill();
    } else { // curly
      ctx.beginPath();
      ctx.arc(0, -14 * scale + animOffset, 9 * scale, Math.PI * 0.8, Math.PI * 2.2);
      ctx.fill();
    }
  }

  // 8. Chapéu / Elmo (Headwear)
  if (app.headwear === 'iron_helmet') {
    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.arc(0, -13 * scale + animOffset, 8.5 * scale, Math.PI, 0);
    ctx.lineTo(8.5 * scale, -8 * scale + animOffset);
    ctx.lineTo(-8.5 * scale, -8 * scale + animOffset);
    ctx.fill();
    // Viseira
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-5 * scale, -11 * scale + animOffset, 10 * scale, 2.5 * scale);
  } else if (app.headwear === 'horned_helm') {
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.arc(0, -13 * scale + animOffset, 8.5 * scale, Math.PI, 0);
    ctx.fill();
    // Chifres brancos
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.moveTo(-7 * scale, -13 * scale + animOffset);
    ctx.quadraticCurveTo(-14 * scale, -17 * scale + animOffset, -12 * scale, -22 * scale + animOffset);
    ctx.lineTo(-9 * scale, -15 * scale + animOffset);
    ctx.moveTo(7 * scale, -13 * scale + animOffset);
    ctx.quadraticCurveTo(14 * scale, -17 * scale + animOffset, 12 * scale, -22 * scale + animOffset);
    ctx.lineTo(9 * scale, -15 * scale + animOffset);
    ctx.fill();
  } else if (app.headwear === 'wizard_hat') {
    // Chapéu pontudo de mago
    ctx.fillStyle = app.outfitSecondaryColor || '#4c1d95';
    // Aba do chapéu
    ctx.beginPath();
    ctx.ellipse(0, -13 * scale + animOffset, 12 * scale, 3 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    // Cone pontudo
    ctx.beginPath();
    ctx.moveTo(-7 * scale, -13 * scale + animOffset);
    ctx.lineTo(5 * scale, -25 * scale + animOffset);
    ctx.lineTo(7 * scale, -13 * scale + animOffset);
    ctx.closePath();
    ctx.fill();
    // Fita amarela
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(-6 * scale, -15 * scale + animOffset, 12 * scale, 2 * scale);
  } else if (app.headwear === 'hood') {
    // Capuz de ladino
    ctx.fillStyle = app.outfitColor || '#1e293b';
    ctx.beginPath();
    ctx.arc(0, -12 * scale + animOffset, 9.5 * scale, Math.PI * 0.7, Math.PI * 2.3);
    ctx.lineTo(0, -22 * scale + animOffset);
    ctx.closePath();
    ctx.fill();
  } else if (app.headwear === 'circlet') {
    // Diadema dourado com joia
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.arc(0, -11 * scale + animOffset, 7.5 * scale, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(0, -15 * scale + animOffset, 2 * scale, 0, Math.PI * 2);
    ctx.fill();
  }

  // 9. Arma na Mão Direita
  ctx.save();
  ctx.translate(11 * scale, 8 * scale + animOffset);
  if (app.weapon === 'sword') {
    // Espada brilhante
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(0, -16 * scale, 3 * scale, 18 * scale);
    // Guarda-mão
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(-3 * scale, 2 * scale, 9 * scale, 2.5 * scale);
    // Cabo
    ctx.fillStyle = '#78350f';
    ctx.fillRect(0.5 * scale, 4.5 * scale, 2 * scale, 5 * scale);
  } else if (app.weapon === 'axe') {
    // Cabo de madeira
    ctx.fillStyle = '#78350f';
    ctx.fillRect(0, -14 * scale, 2.5 * scale, 22 * scale);
    // Lâmina de machado
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.arc(4 * scale, -10 * scale, 6 * scale, -Math.PI / 2, Math.PI / 2);
    ctx.lineTo(1 * scale, -4 * scale);
    ctx.lineTo(1 * scale, -16 * scale);
    ctx.closePath();
    ctx.fill();
  } else if (app.weapon === 'staff') {
    // Cajado de madeira com orbe mágico pulsante
    ctx.fillStyle = '#854d0e';
    ctx.fillRect(0, -18 * scale, 2.5 * scale, 26 * scale);
    // Cristal no topo
    ctx.fillStyle = '#38bdf8';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 8 * scale;
    ctx.beginPath();
    ctx.arc(1.2 * scale, -19 * scale, 4 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  } else if (app.weapon === 'bow') {
    // Arco de madeira curvado
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.arc(4 * scale, -2 * scale, 10 * scale, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();
    // Corda
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1 * scale;
    ctx.beginPath();
    ctx.moveTo(4 * scale, -12 * scale);
    ctx.lineTo(4 * scale, 8 * scale);
    ctx.stroke();
  } else if (app.weapon === 'hammer') {
    // Martelo pesado
    ctx.fillStyle = '#78350f';
    ctx.fillRect(0, -12 * scale, 2.5 * scale, 20 * scale);
    ctx.fillStyle = '#475569';
    ctx.fillRect(-4 * scale, -16 * scale, 10 * scale, 7 * scale);
  } else { // dagger
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(0, -8 * scale, 2 * scale, 10 * scale);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(-2 * scale, 2 * scale, 6 * scale, 2 * scale);
  }
  ctx.restore();

  // 10. Escudo na Mão Esquerda (se ativo)
  if (app.hasShield) {
    ctx.save();
    ctx.translate(-11 * scale, 7 * scale + animOffset);
    // Escudo de brasão
    ctx.fillStyle = '#1e3a8a';
    ctx.beginPath();
    ctx.moveTo(-5 * scale, -8 * scale);
    ctx.lineTo(5 * scale, -8 * scale);
    ctx.lineTo(5 * scale, 2 * scale);
    ctx.lineTo(0, 8 * scale);
    ctx.lineTo(-5 * scale, 2 * scale);
    ctx.closePath();
    ctx.fill();
    // Borda metálica
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 1.5 * scale;
    ctx.stroke();
    // Cruz central
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(-1 * scale, -5 * scale, 2 * scale, 8 * scale);
    ctx.fillRect(-3 * scale, -3 * scale, 6 * scale, 2 * scale);
    ctx.restore();
  }

  ctx.restore();
}

/**
 * Componente React que encapsula o Canvas para visualização do personagem 2D
 */
export default function Character2DPreview({ appearance = {}, size = 96, className = '' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, size, size);

    // Desenha o personagem centralizado
    drawCharacter2D(ctx, size / 2, size / 2, size, appearance, { isMoving: false });
  }, [appearance, size]);

  return (
    <canvas 
      ref={canvasRef} 
      width={size} 
      height={size} 
      className={`inline-block drop-shadow-md ${className}`} 
      style={{ width: `${size}px`, height: `${size}px` }}
    />
  );
}
