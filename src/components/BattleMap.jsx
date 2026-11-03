import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Eye, 
  EyeOff, 
  MapPin, 
  Plus, 
  Trash2, 
  Heart, 
  Shield, 
  Swords,
  Sparkles,
  Bot,
  Play,
  ChevronRight,
  Crosshair,
  Compass,
  Skull,
  Users,
  Gift,
  MessageSquare,
  Flame,
  Moon,
  Sun,
  X,
  Target,
  Zap,
  Coins
} from 'lucide-react';
import { MAP_PRESETS, CONDITIONS, ADVENTURES, MONSTERS, SPELLS, STORY_CAMPAIGN, getAbilityMod, formatMod } from '../data/dndData';
import { sounds } from '../utils/soundEffects';
import { parseDiceFormula } from '../utils/dice';
import { findPath, hasLineOfSight, isTileBlocked } from '../utils/pathfinding';
import { 
  renderThemedFloor, 
  render3DObstacles, 
  renderLightingAndVignette, 
  renderPathfindingPreview, 
  renderActiveProjectiles,
  renderLandPortal,
  renderGatherables
} from '../utils/mapRenderer';
import { drawCharacter2D } from './Character2DSprite';
import NPCDialogueModal from './NPCDialogueModal';
import StoryQuestHUD from './StoryQuestHUD';

export default function BattleMap({ 
  room, 
  socket, 
  isDM, 
  player,
  onOpenSheet
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Viewport transformation
  const [zoom, setZoom] = useState(0.95);
  const [pan, setPan] = useState({ x: 240, y: 70 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Hover & Selection state
  const [hoverCell, setHoverCell] = useState(null);
  const [draggedToken, setDraggedToken] = useState(null);
  const [dragOrigin, setDragOrigin] = useState(null);
  const [dragCurrent, setDragCurrent] = useState(null);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);

  // Visual Combat Effects (Floating numbers & attack beams)
  const [visualEffects, setVisualEffects] = useState([]);
  const [actionAlert, setActionAlert] = useState(null);
  const [activeDialogueNpc, setActiveDialogueNpc] = useState(null);
  const [showStoryLoreModal, setShowStoryLoreModal] = useState(false);

  // UI Drawers & Modals on Map
  const [showAdventureModal, setShowAdventureModal] = useState(false);
  const [showRightLog, setShowRightLog] = useState(true);
  const [advantageMode, setAdvantageMode] = useState('normal');

  // Ping state
  const [pings, setPings] = useState([]);
  const [isPingToolActive, setIsPingToolActive] = useState(false);
  const [fogBrush, setFogBrush] = useState(null); // 'reveal' | 'hide' | null

  // Tibia Real-Time Mode States
  const [tibiaMode, setTibiaMode] = useState(true);
  const [cameraFollow, setCameraFollow] = useState(true);
  const [autoAttack, setAutoAttack] = useState(true);
  const [hasteUntil, setHasteUntil] = useState(0);
  const [corpses, setCorpses] = useState(room.corpses || []);
  const [lootModalCorpse, setLootModalCorpse] = useState(null);
  const [showBattleList, setShowBattleList] = useState(true);
  const [lastAttackTime, setLastAttackTime] = useState(0);
  const [hotkeyCooldowns, setHotkeyCooldowns] = useState({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  const [projectiles, setProjectiles] = useState([]);
  const [screenShakeUntil, setScreenShakeUntil] = useState(0);
  const [previewPath, setPreviewPath] = useState([]);

  const currentMap = room.map || MAP_PRESETS[0];
  const gridSize = currentMap.gridSize || 52;
  const cols = currentMap.cols || 22;
  const rows = currentMap.rows || 15;

  const myChar = player?.character;
  const myToken = (room.tokens || []).find(t => t.characterId === myChar?.id) || 
                  (room.tokens || []).find(t => t.type === 'player');
  const enemies = (room.tokens || []).filter(t => t.type === 'enemy');
  const partyTokens = (room.tokens || []).filter(t => t.type === 'player');

  // Auto-select first living enemy if selectedTarget is dead or null
  useEffect(() => {
    if (!selectedTarget || !room.tokens?.some(t => t.id === selectedTarget.id)) {
      const firstEnemy = enemies[0];
      if (firstEnemy) setSelectedTarget(firstEnemy);
      else setSelectedTarget(null);
    } else {
      const updated = room.tokens.find(t => t.id === selectedTarget.id);
      if (updated) setSelectedTarget(updated);
    }
  }, [room.tokens]);

  // Listen for socket visual effects, pings, and errors
  useEffect(() => {
    if (!socket) return;

    const handleVisualEffect = (eff) => {
      const id = Date.now() + Math.random();
      if (eff.effectType === 'explosion') {
        sounds.playExplosion();
        setScreenShakeUntil(Date.now() + 350);
      } else if (eff.effectType === 'alert') {
        sounds.playAlert();
      } else if (eff.effectType === 'arrow') {
        sounds.playBowShot();
      } else if (eff.effectType === 'heal') {
        sounds.playHeal();
      } else if (eff.effectType === 'fire') {
        sounds.playSpell();
      } else if (eff.isCrit) {
        sounds.playCriticalSuccess();
        setScreenShakeUntil(Date.now() + 250);
      } else {
        sounds.playAttack();
      }

      // If projectile coordinates are provided, spawn canvas flying projectile
      if (eff.fromX !== undefined && eff.toX !== undefined && (eff.fromX !== eff.toX || eff.fromY !== eff.toY)) {
        const projId = Date.now() + Math.random();
        setProjectiles(prev => [
          ...prev,
          {
            id: projId,
            fromX: eff.fromX,
            fromY: eff.fromY,
            toX: eff.toX,
            toY: eff.toY,
            type: eff.effectType === 'fire' ? 'fire' : eff.effectType === 'arrow' ? 'arrow' : 'magic',
            startTime: Date.now(),
            duration: 300
          }
        ]);
        setTimeout(() => {
          setProjectiles(prev => prev.filter(p => p.id !== projId));
        }, 340);
      }

      setVisualEffects(prev => [...prev, { ...eff, id, createdAt: Date.now() }]);
      setTimeout(() => {
        setVisualEffects(prev => prev.filter(e => e.id !== id));
      }, 2200);
    };

    const handleActionError = ({ message }) => {
      setActionAlert(message);
      setTimeout(() => setActionAlert(null), 3500);
    };

    const handlePing = ({ x, y, color }) => {
      const pingId = Date.now() + Math.random();
      setPings(prev => [...prev, { id: pingId, x, y, color }]);
      sounds.playSpell();
      setTimeout(() => {
        setPings(prev => prev.filter(p => p.id !== pingId));
      }, 2000);
    };

    const handleCorpses = (updatedCorpses) => {
      setCorpses(updatedCorpses || []);
    };

    socket.on('combat:visual_effect', handleVisualEffect);
    socket.on('combat:action_error', handleActionError);
    socket.on('map:ping_received', handlePing);
    socket.on('room:corpses_updated', handleCorpses);

    return () => {
      socket.off('combat:visual_effect', handleVisualEffect);
      socket.off('combat:action_error', handleActionError);
      socket.off('map:ping_received', handlePing);
      socket.off('room:corpses_updated', handleCorpses);
    };
  }, [socket]);

  // Center camera on a grid coordinate
  const centerOnGrid = (col, row) => {
    const width = containerRef.current?.clientWidth || 1000;
    const height = containerRef.current?.clientHeight || 700;
    setPan({
      x: width / 2 - (col * gridSize + gridSize / 2) * zoom,
      y: height / 2 - (row * gridSize + gridSize / 2) * zoom
    });
  };

  // Centraliza automaticamente a câmera no herói ao entrar no mapa ou mudar de Land
  useEffect(() => {
    if (myToken) {
      const timer = setTimeout(() => {
        centerOnGrid(myToken.x, myToken.y);
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [currentMap?.id, myToken?.id]);

  // Convert screen coords to grid coords
  const screenToGrid = useCallback((screenX, screenY) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { col: 0, row: 0 };
    const canvasX = (screenX - rect.left - pan.x) / zoom;
    const canvasY = (screenY - rect.top - pan.y) / zoom;
    return {
      col: Math.floor(canvasX / gridSize),
      row: Math.floor(canvasY / gridSize),
      canvasX,
      canvasY
    };
  }, [pan, zoom, gridSize]);

  // Animation loop for smooth torches, visual effects, and turn aura
  useEffect(() => {
    let animFrameId;
    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = containerRef.current?.clientWidth || 1000;
      const height = containerRef.current?.clientHeight || 700;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      ctx.clearRect(0, 0, width, height);
      ctx.save();

      // Screen Shake when critical hits or explosions occur
      const now = Date.now();
      const isShaking = now < screenShakeUntil;
      const shakeX = isShaking ? (Math.random() - 0.5) * 8 : 0;
      const shakeY = isShaking ? (Math.random() - 0.5) * 8 : 0;
      ctx.translate(pan.x + shakeX, pan.y + shakeY);
      ctx.scale(zoom, zoom);

      const totalWidth = cols * gridSize;
      const totalHeight = rows * gridSize;

      // 1. Draw High-Aesthetic Themed Floor (Flagstones, Wood Boards, Forest Earth, Volcanic Basalt)
      renderThemedFloor(ctx, cols, rows, gridSize, currentMap);

      // 2. Draw 3D Obstacles (Masonry Walls with Mortar, Column Pillars, Glowing Altars, Canopies)
      render3DObstacles(ctx, currentMap.obstacles, gridSize, now, currentMap);

      // 3. Draw Warm Atmospheric Torchlight & Dark Vignette
      renderLightingAndVignette(ctx, currentMap.torches, cols, rows, gridSize, now);

      // 4. Draw Pathfinding Trajectory Preview
      if (previewPath && previewPath.length > 0) {
        renderPathfindingPreview(ctx, previewPath, gridSize, 6);
      }

      // 5. Draw Active Flying Projectiles (Arrows, Fireballs, Magic Missiles)
      renderActiveProjectiles(ctx, projectiles, gridSize, now);

      // 4. Draw Grid Lines & Coordinates
      ctx.strokeStyle = currentMap.gridColor || 'rgba(255, 255, 255, 0.09)';
      ctx.lineWidth = 1;
      for (let c = 0; c <= cols; c++) {
        ctx.beginPath();
        ctx.moveTo(c * gridSize, 0);
        ctx.lineTo(c * gridSize, totalHeight);
        ctx.stroke();
      }
      for (let r = 0; r <= rows; r++) {
        ctx.beginPath();
        ctx.moveTo(0, r * gridSize);
        ctx.lineTo(totalWidth, r * gridSize);
        ctx.stroke();
      }

      ctx.font = '10px monospace';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      for (let c = 0; c < cols; c++) {
        const letter = String.fromCharCode(65 + (c % 26));
        ctx.fillText(letter, c * gridSize + gridSize / 2, 3);
      }
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      for (let r = 0; r < rows; r++) {
        ctx.fillText(`${r + 1}`, 4, r * gridSize + gridSize / 2);
      }

      // 5. Hover Cell Highlight
      if (hoverCell && hoverCell.col >= 0 && hoverCell.col < cols && hoverCell.row >= 0 && hoverCell.row < rows) {
        ctx.fillStyle = 'rgba(197, 155, 39, 0.15)';
        ctx.fillRect(hoverCell.col * gridSize, hoverCell.row * gridSize, gridSize, gridSize);
        ctx.strokeStyle = 'rgba(197, 155, 39, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(hoverCell.col * gridSize, hoverCell.row * gridSize, gridSize, gridSize);
      }

      // 6. Draw Treasure Chests on Map
      (room.chests || []).forEach(chest => {
        const cx = chest.x * gridSize + gridSize / 2;
        const cy = chest.y * gridSize + gridSize / 2;

        ctx.beginPath();
        ctx.arc(cx, cy, gridSize * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = chest.opened ? 'rgba(55, 65, 81, 0.6)' : 'rgba(180, 83, 9, 0.85)';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = chest.opened ? '#6B7280' : '#FBBF24';
        ctx.stroke();

        ctx.font = '22px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(chest.opened ? '📦' : '🎁', cx, cy);

        ctx.font = 'bold 10px Inter, sans-serif';
        ctx.fillStyle = chest.opened ? '#9CA3AF' : '#FDE68A';
        ctx.fillText(chest.opened ? 'Baú Aberto' : `Baú (${chest.gold} PO)`, cx, cy + gridSize * 0.48);

        // Action Prompt [E] if adjacent
        if (!chest.opened && myToken) {
          const isNear = Math.max(Math.abs(chest.x - myToken.x), Math.abs(chest.y - myToken.y)) <= 1.5;
          if (isNear) {
            ctx.save();
            ctx.fillStyle = '#F59E0B';
            ctx.shadowColor = '#F59E0B';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.roundRect(cx - 36, cy - gridSize * 0.62, 72, 18, 5);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.font = 'bold 10px monospace';
            ctx.fillStyle = '#000000';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('[E] Abrir Baú', cx, cy - gridSize * 0.62 + 9);
            ctx.restore();
          }
        }
      });

      // 6.1 Draw Corpses on Map (Tibia Style)
      (corpses && corpses.length > 0 ? corpses : (room.corpses || [])).forEach(corpse => {
        const cx = corpse.x * gridSize + gridSize / 2;
        const cy = corpse.y * gridSize + gridSize / 2;

        ctx.font = '24px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(corpse.opened ? '🦴' : '💀', cx, cy);

        // Gold sparkle if contains loot
        if (!corpse.opened && (corpse.gold > 0 || (corpse.items && corpse.items.length > 0))) {
          const glint = Math.sin(Date.now() / 200) > 0 ? '✨' : '💰';
          ctx.font = '14px serif';
          ctx.fillText(glint, cx + 12, cy - 10);
        }

        ctx.font = 'bold 9px Inter, sans-serif';
        ctx.fillStyle = corpse.opened ? '#9CA3AF' : '#FDE68A';
        ctx.fillText(corpse.opened ? 'Restos Mortais' : corpse.name, cx, cy + gridSize * 0.44);

        // Action Prompt [E] if adjacent
        if (!corpse.opened && myToken) {
          const isNear = Math.max(Math.abs(corpse.x - myToken.x), Math.abs(corpse.y - myToken.y)) <= 1.2;
          if (isNear) {
            ctx.save();
            ctx.fillStyle = '#10B981';
            ctx.shadowColor = '#10B981';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.roundRect(cx - 38, cy - gridSize * 0.6, 76, 18, 5);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.font = 'bold 10px monospace';
            ctx.fillStyle = '#000000';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('[E] Saquear', cx, cy - gridSize * 0.6 + 9);
            ctx.restore();
          }
        }
      });

      // 6.2 Draw Altar Action Prompt [E] if adjacent
      if (currentMap.obstacles && myToken) {
        currentMap.obstacles.forEach(obs => {
          if (obs.type === 'altar') {
            const isNear = Math.max(Math.abs(obs.x - myToken.x), Math.abs(obs.y - myToken.y)) <= 2.2;
            if (isNear) {
              const ox = obs.x * gridSize + (obs.w || 1) * gridSize / 2;
              const oy = obs.y * gridSize + (obs.h || 1) * gridSize / 2;
              ctx.save();
              ctx.fillStyle = '#A855F7';
              ctx.shadowColor = '#C084FC';
              ctx.shadowBlur = 10;
              ctx.beginPath();
              ctx.roundRect(ox - 46, oy - gridSize * 0.72, 92, 20, 5);
              ctx.fill();
              ctx.shadowBlur = 0;
              ctx.font = 'bold 10px monospace';
              ctx.fillStyle = '#FFFFFF';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText('[E] Rezar no Altar', ox, oy - gridSize * 0.72 + 10);
              ctx.restore();
            }
          }
        });
      }

      // 6.3 Render Land Portal / Archway
      const pPos = room.portalPosition || currentMap.portalPosition;
      if (pPos) {
        renderLandPortal(ctx, pPos, gridSize, room.bossDefeated, room.portalName, myToken);
      }

      // 6.4 Render Interactive Gatherables (Herbs, Crystals, Relics)
      if (room.gatherables) {
        renderGatherables(ctx, room.gatherables, gridSize, myToken);
      }

      // 7. Draw Aiming / Target Line between My Token and Selected Target
      if (myToken && selectedTarget && selectedTarget.id !== myToken.id) {
        const sx = myToken.x * gridSize + (myToken.size || 1) * gridSize / 2;
        const sy = myToken.y * gridSize + (myToken.size || 1) * gridSize / 2;
        const tx = selectedTarget.x * gridSize + (selectedTarget.size || 1) * gridSize / 2;
        const ty = selectedTarget.y * gridSize + (selectedTarget.size || 1) * gridSize / 2;

        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(tx, ty);
        ctx.strokeStyle = selectedTarget.type === 'enemy' ? 'rgba(239, 68, 68, 0.45)' : 'rgba(59, 130, 246, 0.45)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);

        const distSq = Math.max(Math.abs(selectedTarget.x - myToken.x), Math.abs(selectedTarget.y - myToken.y));
        const distM = (distSq * 1.5).toFixed(1);
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.fillStyle = '#FCA5A5';
        ctx.textAlign = 'center';
        ctx.fillText(`🎯 ${distM}m (${distSq}q)`, (sx + tx) / 2, (sy + ty) / 2 - 8);
      }

      // 8. Drag Distance Ruler
      if (draggedToken && dragOrigin && dragCurrent) {
        const startX = dragOrigin.x * gridSize + gridSize / 2;
        const startY = dragOrigin.y * gridSize + gridSize / 2;
        const endX = dragCurrent.x * gridSize + gridSize / 2;
        const endY = dragCurrent.y * gridSize + gridSize / 2;

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 3;
        ctx.setLineDash([6, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        const dx = Math.abs(dragCurrent.x - dragOrigin.x);
        const dy = Math.abs(dragCurrent.y - dragOrigin.y);
        const distSquares = Math.max(dx, dy);
        const distMeters = (distSquares * 1.5).toFixed(1);

        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.fillStyle = '#FBBF24';
        ctx.fillText(`👣 ${distMeters}m (${distSquares}q)`, (startX + endX) / 2, (startY + endY) / 2 - 12);
      }

      // 9. Draw Tokens (Players & Enemies)
      (room.tokens || []).forEach(tok => {
        const isDraggingThis = draggedToken?.id === tok.id && dragCurrent;
        const drawX = isDraggingThis ? dragCurrent.x : tok.x;
        const drawY = isDraggingThis ? dragCurrent.y : tok.y;

        const tx = drawX * gridSize;
        const ty = drawY * gridSize;
        const tSize = (tok.size || 1) * gridSize;
        const radius = (tSize / 2) - 4;
        const cx = tx + tSize / 2;
        const cy = ty + tSize / 2;

        const isTurn = room.combat?.active && room.combat.turnOrder[room.combat.currentTurnIndex] === tok.id;
        const isTargeted = selectedTarget?.id === tok.id;
        const isMe = myChar && tok.characterId === myChar.id;

        // Active Combat Turn Golden Aura
        if (isTurn) {
          const pulse = 5 + Math.sin(Date.now() / 180) * 3;
          ctx.beginPath();
          ctx.arc(cx, cy, radius + pulse, 0, Math.PI * 2);
          ctx.strokeStyle = '#FBBF24';
          ctx.lineWidth = 4;
          ctx.shadowColor = '#F59E0B';
          ctx.shadowBlur = 16;
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        // Selected Target Crosshair Ring & Tibia Corner Brackets
        if (isTargeted) {
          ctx.beginPath();
          ctx.arc(cx, cy, radius + 6, 0, Math.PI * 2);
          ctx.strokeStyle = tok.type === 'enemy' ? '#EF4444' : '#60A5FA';
          ctx.lineWidth = 2.5;
          ctx.setLineDash([6, 4]);
          ctx.stroke();
          ctx.setLineDash([]);

          // Classic Tibia 4 Red Corner Brackets [ ]
          const bSize = radius + 8;
          const cLen = 9;
          ctx.strokeStyle = tok.type === 'enemy' ? '#EF4444' : '#60A5FA';
          ctx.lineWidth = 3;
          ctx.shadowColor = tok.type === 'enemy' ? '#DC2626' : '#2563EB';
          ctx.shadowBlur = 8;

          // Top-Left corner
          ctx.beginPath();
          ctx.moveTo(cx - bSize, cy - bSize + cLen);
          ctx.lineTo(cx - bSize, cy - bSize);
          ctx.lineTo(cx - bSize + cLen, cy - bSize);
          ctx.stroke();

          // Top-Right corner
          ctx.beginPath();
          ctx.moveTo(cx + bSize - cLen, cy - bSize);
          ctx.lineTo(cx + bSize, cy - bSize);
          ctx.lineTo(cx + bSize, cy - bSize + cLen);
          ctx.stroke();

          // Bottom-Left corner
          ctx.beginPath();
          ctx.moveTo(cx - bSize, cy + bSize - cLen);
          ctx.lineTo(cx - bSize, cy + bSize);
          ctx.lineTo(cx - bSize + cLen, cy + bSize);
          ctx.stroke();

          // Bottom-Right corner
          ctx.beginPath();
          ctx.moveTo(cx + bSize - cLen, cy + bSize);
          ctx.lineTo(cx + bSize, cy + bSize);
          ctx.lineTo(cx + bSize, cy + bSize - cLen);
          ctx.stroke();

          ctx.shadowBlur = 0;
        }

        // 9.1 Render 2D Player / NPC Character or Enemy Token
        if (tok.type === 'player') {
          // Render 2D Customizable Character Sprite
          const playerApp = tok.appearance || (isMe ? myChar?.appearance : null) || {
            outfitColor: tok.color || '#3B82F6',
            skinTone: '#f5c6a5',
            hairStyle: 'short',
            weapon: 'sword',
            hasShield: true
          };
          drawCharacter2D(ctx, cx, cy, tSize * 1.15, playerApp, { isMoving: isDraggingThis });
        } else if (tok.type === 'npc') {
          // Render 2D NPC Character Sprite
          const npcApp = tok.appearance || {
            skinTone: '#d49870',
            hairStyle: 'long',
            hairColor: '#e5e7eb',
            outfitType: 'robe',
            outfitColor: '#15803d',
            headwear: 'none',
            weapon: 'staff',
            hasShield: false
          };
          drawCharacter2D(ctx, cx, cy, tSize * 1.15, npcApp, { isMoving: false });

          // Prompt [E] Falar com NPC se jogador adjacente
          if (myToken) {
            const isNear = Math.max(Math.abs(tok.x - myToken.x), Math.abs(tok.y - myToken.y)) <= 1.8;
            if (isNear) {
              ctx.save();
              ctx.fillStyle = '#F59E0B';
              ctx.shadowColor = '#F59E0B';
              ctx.shadowBlur = 10;
              ctx.beginPath();
              ctx.roundRect(cx - 45, cy - gridSize * 0.72, 90, 20, 5);
              ctx.fill();
              ctx.shadowBlur = 0;
              ctx.font = 'bold 10px monospace';
              ctx.fillStyle = '#000000';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText('[E] Conversar', cx, cy - gridSize * 0.72 + 10);
              ctx.restore();
            }
          }
        } else {
          // Indicador de Raio de Aggro MMORPG (2 quadrados) ao selecionar ou passar o mouse sobre o inimigo
          const isHoveredEnemy = hoverCell && hoverCell.col >= drawX && hoverCell.col < drawX + (tok.size || 1) && hoverCell.row >= drawY && hoverCell.row < drawY + (tok.size || 1);
          if (isTargeted || isHoveredEnemy || tok.aggroTargetId) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(cx, cy, gridSize * 2.5, 0, Math.PI * 2);
            ctx.strokeStyle = tok.aggroTargetId ? 'rgba(239, 68, 68, 0.35)' : 'rgba(245, 158, 11, 0.25)';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([6, 6]);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.restore();
          }

          // Aura de Perseguição MMORPG (quando o inimigo detectou um jogador a <= 2 de distância)
          if (tok.aggroTargetId) {
            const aggroPulse = Math.sin(Date.now() / 120) * 3;
            ctx.save();
            ctx.beginPath();
            ctx.arc(cx, cy, radius + 7 + aggroPulse, 0, Math.PI * 2);
            ctx.strokeStyle = '#EF4444';
            ctx.lineWidth = 3;
            ctx.shadowColor = '#DC2626';
            ctx.shadowBlur = 14;
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Badge "❗ PERSEGUINDO"
            ctx.fillStyle = 'rgba(185, 28, 28, 0.92)';
            ctx.beginPath();
            ctx.roundRect(cx - 42, ty - 28, 84, 15, 4);
            ctx.fill();
            ctx.font = 'bold 9px monospace';
            ctx.fillStyle = '#FEF2F2';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('❗ PERSEGUINDO', cx, ty - 20.5);
            ctx.restore();
          }

          // Boss Aura se for o Chefão da Land
          if (tok.isBoss) {
            const bossPulse = Math.sin(Date.now() / 150) * 4;
            ctx.beginPath();
            ctx.arc(cx, cy, radius + 10 + bossPulse, 0, Math.PI * 2);
            ctx.strokeStyle = '#DC2626';
            ctx.lineWidth = 3.5;
            ctx.shadowColor = '#EF4444';
            ctx.shadowBlur = 16;
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Coroa de Boss
            ctx.font = '16px serif';
            ctx.textAlign = 'center';
            ctx.fillText('👑', cx, ty - (tok.aggroTargetId ? 36 : 16));
          }

          // Enemy Token Base Circle
          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.fillStyle = '#450a0a';
          ctx.fill();

          // Border Ring
          ctx.lineWidth = tok.isBoss ? 4 : 3;
          ctx.strokeStyle = tok.isBoss ? '#F59E0B' : '#EF4444';
          ctx.stroke();

          // Avatar Emoji
          ctx.font = `${Math.floor(radius * (tok.isBoss ? 1.3 : 1.15))}px serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(tok.avatar || '👹', cx, cy + 1);
        }

        // HP Bar Above Token
        if (tok.maxHp && tok.maxHp > 0) {
          const barW = tSize - 6;
          const barH = 6;
          const barX = tx + 3;
          const barY = ty - 9;
          const hpPercent = Math.max(0, Math.min(1, (tok.hp || 0) / tok.maxHp));

          ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
          ctx.fillRect(barX, barY, barW, barH);
          ctx.fillStyle = hpPercent > 0.5 ? '#10B981' : hpPercent > 0.25 ? '#F59E0B' : '#EF4444';
          ctx.fillRect(barX + 1, barY + 1, (barW - 2) * hpPercent, barH - 2);

          // HP text inside or above
          ctx.font = 'bold 9px monospace';
          ctx.fillStyle = '#FFFFFF';
          ctx.textAlign = 'center';
          ctx.fillText(`${tok.hp}/${tok.maxHp}`, cx, barY - 5);
        }

        // AC Shield Badge (Top-Right of Token)
        ctx.beginPath();
        ctx.arc(tx + tSize - 8, ty + 8, 9, 0, Math.PI * 2);
        ctx.fillStyle = '#1E293B';
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#94A3B8';
        ctx.stroke();
        ctx.font = 'bold 9px monospace';
        ctx.fillStyle = '#E2E8F0';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${tok.ac || 10}`, tx + tSize - 8, ty + 8);

        // Token Nameplate Below
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.fillStyle = tok.type === 'enemy' ? '#FCA5A5' : isMe ? '#93C5FD' : '#6EE7B7';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.shadowColor = 'black';
        ctx.shadowBlur = 4;
        ctx.fillText(isMe ? `${tok.name} (Você)` : tok.name, cx, cy + radius + 3);
        ctx.shadowBlur = 0;

        // Condition Badges on Canvas Token
        if (tok.conditions && tok.conditions.length > 0) {
          ctx.font = '12px serif';
          ctx.textBaseline = 'middle';
          tok.conditions.forEach((cId, cIdx) => {
            const cond = CONDITIONS.find(c => c.id === cId) || { icon: '⚠️', name: cId };
            const badgeOffset = (cIdx - (tok.conditions.length - 1) / 2) * 16;
            ctx.fillText(cond.icon || '⚠️', cx + badgeOffset, cy + radius + 17);
          });
        }
      });

      // 10. Optional Fog of War (Only if explicitly enabled by DM)
      if (room.fogEnabled) {
        const revealedSet = new Set(room.fog || []);
        ctx.fillStyle = isDM ? 'rgba(0, 0, 0, 0.5)' : 'rgba(6, 7, 10, 0.92)';
        for (let c = 0; c < cols; c++) {
          for (let r = 0; r < rows; r++) {
            // Always reveal around player tokens!
            const nearPlayer = partyTokens.some(pt => Math.abs(pt.x - c) <= 3 && Math.abs(pt.y - r) <= 3);
            if (!nearPlayer && !revealedSet.has(`${c},${r}`)) {
              ctx.fillRect(c * gridSize, r * gridSize, gridSize, gridSize);
            }
          }
        }
      }

      // 11. Draw Visual Combat Effects (Attack beams & Floating combat text)
      visualEffects.forEach(eff => {
        const age = now - eff.createdAt;
        const progress = Math.min(1, age / 2000);
        const sx = (eff.fromX ?? 0) * gridSize + gridSize / 2;
        const sy = (eff.fromY ?? 0) * gridSize + gridSize / 2;
        const tx = (eff.toX ?? 0) * gridSize + gridSize / 2;
        const ty = (eff.toY ?? 0) * gridSize + gridSize / 2;

        // Draw projectile/beam during first 450ms
        if (age < 450 && (sx !== tx || sy !== ty)) {
          const beamProg = age / 450;
          const curX = sx + (tx - sx) * beamProg;
          const curY = sy + (ty - sy) * beamProg;

          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(curX, curY);
          ctx.strokeStyle = eff.color || '#F59E0B';
          ctx.lineWidth = 4;
          ctx.shadowColor = eff.color || '#F59E0B';
          ctx.shadowBlur = 12;
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        // Draw floating combat text rising up
        const floatY = ty - 20 - progress * 45;
        ctx.font = 'bold 15px Cinzel, serif';
        ctx.fillStyle = eff.color || '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'black';
        ctx.shadowBlur = 6;
        ctx.fillText(eff.text, tx, floatY);
        ctx.shadowBlur = 0;
      });

      // 12. Draw Pings
      pings.forEach(p => {
        const px = p.x * gridSize + gridSize / 2;
        const py = p.y * gridSize + gridSize / 2;
        ctx.beginPath();
        ctx.arc(px, py, 24, 0, Math.PI * 2);
        ctx.strokeStyle = p.color || '#F59E0B';
        ctx.lineWidth = 4;
        ctx.stroke();
      });

      ctx.restore();
      animFrameId = requestAnimationFrame(render);
    };

    animFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animFrameId);
  }, [pan, zoom, currentMap, room, isDM, myChar, myToken, draggedToken, dragOrigin, dragCurrent, selectedTarget, hoverCell, visualEffects, pings, cols, rows, gridSize, previewPath, projectiles, screenShakeUntil]);

  // Mouse handlers
  const handleWheel = (e) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    setZoom(z => Math.min(Math.max(0.45, z * factor), 2.2));
  };

  const handleMouseDown = (e) => {
    if (e.button === 1 || e.spaceKey) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }

    const { col, row } = screenToGrid(e.clientX, e.clientY);

    if (isPingToolActive || e.altKey) {
      if (col >= 0 && col < cols && row >= 0 && row < rows) {
        socket.emit('map:ping', { x: col, y: row, color: myChar?.color || '#F59E0B' });
        setIsPingToolActive(false);
      }
      return;
    }

    if (fogBrush && isDM) {
      if (col >= 0 && col < cols && row >= 0 && row < rows) {
        const tile = `${col},${row}`;
        socket.emit(fogBrush === 'reveal' ? 'fog:reveal' : 'fog:hide', { tiles: [tile] });
      }
      return;
    }

    if (e.button === 0) {
      // Check if clicked on a Corpse (Tibia Style)
      const allCorpses = corpses.length > 0 ? corpses : (room.corpses || []);
      const clickedCorpse = allCorpses.find(c => c.x === col && c.y === row);
      if (clickedCorpse) {
        sounds.playCoins();
        setLootModalCorpse(clickedCorpse);
        return;
      }

      // Check if clicked on an unopened Treasure Chest
      const clickedChest = (room.chests || []).find(c => !c.opened && c.x === col && c.y === row);
      if (clickedChest) {
        sounds.playCoins();
        socket.emit('chest:open', { chestId: clickedChest.id });
        return;
      }

      // Check if clicked on a Token
      const clickedToken = (room.tokens || []).find(t => {
        const size = t.size || 1;
        return col >= t.x && col < t.x + size && row >= t.y && row < t.y + size;
      });

      if (clickedToken) {
        setSelectedTarget(clickedToken);
        setContextMenu(null);

        // Allow dragging own token, or any player/enemy token if DM or Co-op
        const canDrag = isDM || clickedToken.type === 'player';
        if (canDrag) {
          setDraggedToken(clickedToken);
          setDragOrigin({ x: clickedToken.x, y: clickedToken.y });
          setDragCurrent({ x: clickedToken.x, y: clickedToken.y });
        }
      } else {
        if (myToken && col >= 0 && col < cols && row >= 0 && row < rows) {
          if (isTileBlocked(col, row, currentMap.obstacles, cols, rows)) {
            setActionAlert('Posição bloqueada por obstáculo do mapa!');
          } else {
            const path = findPath(myToken.x, myToken.y, col, row, currentMap.obstacles, cols, rows);
            if (path && path.length > 0) {
              // Movimentação MMORPG 100% em Tempo Real (sem bloqueio por turnos)
              const dest = path[path.length - 1];
              myTokenPosRef.current = { x: dest.x, y: dest.y };
              myToken.x = dest.x;
              myToken.y = dest.y;
              socket.emit('token:move', { tokenId: myToken.id, x: dest.x, y: dest.y });
              if (cameraFollow) centerOnGrid(dest.x, dest.y);
              setPreviewPath([]);
              return;
            }
          }
        }
        // Pan map if clicking empty background
        setIsPanning(true);
        setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
        setContextMenu(null);
      }
    }
  };

  const handleMouseMove = (e) => {
    const { col, row } = screenToGrid(e.clientX, e.clientY);
    setHoverCell({ col, row });

    // Pathfinding Hover Preview
    if (myToken && !draggedToken && !isPanning && col >= 0 && col < cols && row >= 0 && row < rows) {
      if (!isTileBlocked(col, row, currentMap.obstacles, cols, rows)) {
        const p = findPath(myToken.x, myToken.y, col, row, currentMap.obstacles, cols, rows);
        setPreviewPath(p);
      } else {
        setPreviewPath([]);
      }
    } else if (previewPath.length > 0) {
      setPreviewPath([]);
    }

    if (fogBrush && isDM && e.buttons === 1) {
      if (col >= 0 && col < cols && row >= 0 && row < rows) {
        const tile = `${col},${row}`;
        socket.emit(fogBrush === 'reveal' ? 'fog:reveal' : 'fog:hide', { tiles: [tile] });
      }
      return;
    }

    if (isPanning) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
      return;
    }

    if (draggedToken) {
      setDragCurrent({
        x: Math.max(1, Math.min(cols - (draggedToken.size || 1) - 1, col)),
        y: Math.max(1, Math.min(rows - (draggedToken.size || 1) - 1, row))
      });
    }
  };

  const handleMouseUp = () => {
    if (isPanning) setIsPanning(false);
    if (draggedToken && dragCurrent) {
      if (dragCurrent.x !== dragOrigin.x || dragCurrent.y !== dragOrigin.y) {
        socket.emit('token:move', {
          tokenId: draggedToken.id,
          x: dragCurrent.x,
          y: dragCurrent.y
        });
      }
      setDraggedToken(null);
      setDragOrigin(null);
      setDragCurrent(null);
    }
  };

  // Execute Weapon or Spell Attack against Selected Target
  const executeCombatAction = (actionType, item) => {
    if (!myToken) {
      setActionAlert('Seu token não está no mapa! Crie ou selecione seu herói.');
      return;
    }

    let target = selectedTarget;
    if (actionType === 'spell' && item.heal) {
      // If healing spell and an enemy is selected, heal self instead!
      if (!target || target.type === 'enemy') {
        target = myToken;
      }
    } else {
      // Offensive attack: if no enemy selected, pick closest enemy
      if (!target || target.type !== 'enemy') {
        if (enemies.length === 0) {
          setActionAlert('Não há inimigos vivos no mapa! Clique em "Missões & Inimigos" para gerar um encontro!');
          return;
        }
        const sorted = [...enemies].sort((a, b) => {
          const da = Math.max(Math.abs(a.x - myToken.x), Math.abs(a.y - myToken.y));
          const db = Math.max(Math.abs(b.x - myToken.x), Math.abs(b.y - myToken.y));
          return da - db;
        });
        target = sorted[0];
        setSelectedTarget(target);
      }
    }

    // Line-of-Sight & Obstacle Check
    const distSq = Math.max(Math.abs(target.x - myToken.x), Math.abs(target.y - myToken.y));
    if (distSq > 1 && !hasLineOfSight(myToken.x, myToken.y, target.x, target.y, currentMap.obstacles)) {
      setActionAlert('Linha de visão bloqueada por parede ou pilar!');
      return;
    }

    // Spawn client-side projectile if ranged
    const isRanged = (item.range && item.range > 3) || item.properties?.some(p => p.includes('Munição') || p.includes('Arremesso')) || actionType === 'spell';
    if (isRanged) {
      const projId = Date.now() + Math.random();
      setProjectiles(prev => [
        ...prev,
        {
          id: projId,
          fromX: myToken.x,
          fromY: myToken.y,
          toX: target.x,
          toY: target.y,
          type: actionType === 'spell' ? 'fire' : 'arrow',
          startTime: Date.now(),
          duration: 280
        }
      ]);
      setTimeout(() => setProjectiles(prev => prev.filter(p => p.id !== projId)), 320);
      if (actionType === 'spell') sounds.playSpell();
      else sounds.playBowShot();
    }

    socket.emit('combat:execute_action', {
      actorTokenId: myToken.id,
      targetTokenId: target.id,
      actionType,
      item,
      advantageType: advantageMode
    });
  };

  // Drink Potion from Bottom Bar
  const handleQuickPotion = () => {
    if (!myChar) return;
    const potIdx = (myChar.inventory || []).findIndex(i => i.type === 'consumable');
    if (potIdx === -1) {
      setActionAlert('Você não tem Poções de Cura na mochila! Compre no Mercado ou abra Baús!');
      return;
    }
    const pot = myChar.inventory[potIdx];
    sounds.playHeal();
    const parsed = pot.heal ? parseDiceFormula(pot.heal) : null;
    const healAmount = parsed?.total || (pot.id === 'pocao_cura_maior' ? (Math.floor(Math.random() * 13) + 8) : (Math.floor(Math.random() * 7) + 4));
    const newHp = Math.min(myChar.maxHp, (myChar.hp || 0) + healAmount);
    const newInv = [...myChar.inventory];
    newInv.splice(potIdx, 1);

    const updatedChar = { ...myChar, hp: newHp, inventory: newInv };
    socket.emit('character:update', { character: updatedChar });
    socket.emit('chat:send', {
      sender: myChar.name,
      senderType: 'player',
      type: 'chat',
      content: `🧪 **${myChar.name}** bebeu **${pot.name}** e recuperou **+${healAmount} PV**! (${newHp}/${myChar.maxHp} PV)`
    });
  };

  // Quick Spawn Single Monster
  const handleQuickSpawnMonster = (monster) => {
    sounds.playAttack();
    socket.emit('token:add', {
      name: monster.name,
      type: 'enemy',
      hp: monster.hp,
      maxHp: monster.maxHp,
      ac: monster.ac,
      speed: monster.speed,
      xp: monster.xp,
      goldDrop: monster.goldDrop,
      avatar: monster.avatar,
      color: monster.color,
      size: monster.size === 'Grande' ? 2 : 1,
      x: 13 + Math.floor(Math.random() * 5),
      y: 4 + Math.floor(Math.random() * 7),
      actions: monster.actions,
      stats: monster.stats
    });
  };

  const myWeapons = (myChar?.inventory || []).filter(i => i.type === 'weapon');
  const myPotionsCount = (myChar?.inventory || []).filter(i => i.type === 'consumable').length;
  const activeTurnTokenId = room.combat?.active ? room.combat.turnOrder[room.combat.currentTurnIndex] : null;
  const activeTurnToken = (room.tokens || []).find(t => t.id === activeTurnTokenId);

  const lastStepTimeRef = useRef(0);
  const myTokenPosRef = useRef(myToken ? { x: myToken.x, y: myToken.y } : { x: 3, y: 7 });

  useEffect(() => {
    if (myToken) {
      myTokenPosRef.current = { x: myToken.x, y: myToken.y };
    }
  }, [myToken?.x, myToken?.y]);

  // Center camera on hero when moving if cameraFollow is active
  useEffect(() => {
    if (cameraFollow && myToken && tibiaMode) {
      centerOnGrid(myToken.x, myToken.y);
    }
  }, [myToken?.x, myToken?.y, cameraFollow, tibiaMode]);

  const targetNearestEnemy = useCallback(() => {
    if (!myToken || enemies.length === 0) return;
    const sorted = [...enemies].sort((a, b) => {
      const da = Math.max(Math.abs(a.x - myToken.x), Math.abs(a.y - myToken.y));
      const db = Math.max(Math.abs(b.x - myToken.x), Math.abs(b.y - myToken.y));
      return da - db;
    });
    setSelectedTarget(sorted[0]);
    sounds.playAttack();
  }, [myToken, enemies]);

  const lootAdjacentCorpse = useCallback(() => {
    if (!myToken) return;
    const allCorpses = corpses.length > 0 ? corpses : (room.corpses || []);
    const unlooted = allCorpses.filter(c => !c.opened);
    const adjacent = unlooted.find(c => 
      Math.max(Math.abs(c.x - myToken.x), Math.abs(c.y - myToken.y)) <= 1
    );
    if (adjacent) {
      sounds.playCoins();
      setLootModalCorpse(adjacent);
    } else if (unlooted.length > 0) {
      setActionAlert('Aproxime-se do cadáver para saquear! (1 quadrado de distância)');
    } else {
      setActionAlert('Nenhum cadáver por perto para saquear.');
    }
  }, [myToken, corpses, room.corpses]);

  // Action Key [E] to interact with Portal, NPCs, Gatherables, Chests, Altars, and Corpses
  const handleActionKeyE = useCallback(() => {
    if (!myToken) return;

    // 0. Check adjacent Land Portal
    const portalPos = room.portalPosition || currentMap.portalPosition;
    if (portalPos && Math.max(Math.abs(portalPos.x - myToken.x), Math.abs(portalPos.y - myToken.y)) <= 1.8) {
      if (room.bossDefeated) {
        sounds.playCriticalSuccess();
        socket.emit('land:advance');
        return;
      } else {
        sounds.playAlert();
        setActionAlert('O Portal está selado! Derrotem o Boss da Land para abrir a passagem.');
        return;
      }
    }

    // 0.5 Check adjacent NPC
    const nearNpc = (room.tokens || []).find(t => 
      t.type === 'npc' && Math.max(Math.abs(t.x - myToken.x), Math.abs(t.y - myToken.y)) <= 1.8
    );
    if (nearNpc) {
      sounds.playShrineBuff();
      setActiveDialogueNpc(nearNpc);
      return;
    }

    // 0.8 Check adjacent Gatherable (Herb, Crystal)
    const nearGatherable = (room.gatherables || []).find(g => 
      !g.gathered && Math.max(Math.abs(g.x - myToken.x), Math.abs(g.y - myToken.y)) <= 1.5
    );
    if (nearGatherable) {
      sounds.playHeal();
      socket.emit('gatherable:collect', { id: nearGatherable.id });
      return;
    }

    // 1. Check adjacent unopened chest
    const allChests = room.chests || [];
    const adjacentChest = allChests.find(c => 
      !c.opened && Math.max(Math.abs(c.x - myToken.x), Math.abs(c.y - myToken.y)) <= 1.5
    );
    if (adjacentChest) {
      sounds.playCoins();
      socket.emit('chest:open', { chestId: adjacentChest.id });
      return;
    }

    // 2. Check adjacent altar / shrine
    const obstacles = currentMap.obstacles || [];
    const adjacentAltar = obstacles.find(obs => 
      obs.type === 'altar' && 
      Math.max(Math.abs(obs.x - myToken.x), Math.abs(obs.y - myToken.y)) <= 2.2
    );
    if (adjacentAltar) {
      sounds.playShrineBuff();
      socket.emit('shrine:pray', { shrineId: adjacentAltar.label || 'altar' });
      return;
    }

    // 3. Check adjacent corpse
    lootAdjacentCorpse();
  }, [myToken, room.portalPosition, room.bossDefeated, room.tokens, room.gatherables, room.chests, currentMap.obstacles, currentMap.portalPosition, socket, lootAdjacentCorpse]);

  const triggerHotkey = useCallback((slot) => {
    if (!myChar || !myToken) return;
    const now = Date.now();
    if (hotkeyCooldowns[slot] && now < hotkeyCooldowns[slot]) {
      return;
    }

    if (slot === 1) {
      // Hotkey 1: Exura (Cura Rápida)
      const healAmt = Math.floor(Math.random() * 7) + 4;
      const newHp = Math.min(myChar.maxHp, (myChar.hp || 0) + healAmt);
      sounds.playHeal();
      setHotkeyCooldowns(prev => ({ ...prev, 1: now + 1500 }));
      socket.emit('character:update', { character: { ...myChar, hp: newHp } });
      socket.emit('combat:visual_effect', {
        fromX: myToken.x,
        fromY: myToken.y,
        toX: myToken.x,
        toY: myToken.y,
        text: `✨ +${healAmt} PV (Exura)`,
        color: '#10B981',
        effectType: 'heal'
      });
      socket.emit('chat:send', {
        sender: myChar.name,
        senderType: 'player',
        type: 'chat',
        content: `✨ **${myChar.name}** bradou ***Exura!*** e recuperou **+${healAmt} PV**!`
      });
    } else if (slot === 2) {
      // Hotkey 2: Exori (Golpe em Área ao Redor)
      setHotkeyCooldowns(prev => ({ ...prev, 2: now + 3500 }));
      sounds.playAttack();
      socket.emit('tibia:exori', { actorTokenId: myToken.id });
    } else if (slot === 3) {
      // Hotkey 3: Exori Flam (Lança Chamas no Alvo Selecionado)
      if (!selectedTarget || selectedTarget.type !== 'enemy') {
        setActionAlert('Selecione um inimigo para lançar Exori Flam!');
        return;
      }
      setHotkeyCooldowns(prev => ({ ...prev, 3: now + 2000 }));
      sounds.playSpell();
      executeCombatAction('spell', {
        name: 'Exori Flam',
        damage: '2d6+3',
        damageType: 'fogo',
        range: 12
      });
    } else if (slot === 4) {
      // Hotkey 4: Poção de Vida
      setHotkeyCooldowns(prev => ({ ...prev, 4: now + 1000 }));
      handleQuickPotion();
    } else if (slot === 5) {
      // Hotkey 5: Utevo Hur (Haste - Acelera Movimento)
      setHotkeyCooldowns(prev => ({ ...prev, 5: now + 10000 }));
      setHasteUntil(now + 8000);
      sounds.playSpell();
      socket.emit('combat:visual_effect', {
        fromX: myToken.x,
        fromY: myToken.y,
        toX: myToken.x,
        toY: myToken.y,
        text: `⚡ UTEVO HUR! (+50% Vel)`,
        color: '#38BDF8',
        effectType: 'heal'
      });
      socket.emit('chat:send', {
        sender: myChar.name,
        senderType: 'player',
        type: 'chat',
        content: `⚡ **${myChar.name}** bradou ***Utevo Hur!*** Seus passos agora são ultra-rápidos!`
      });
    }
  }, [myChar, myToken, hotkeyCooldowns, selectedTarget, socket, executeCombatAction, handleQuickPotion]);

  // Keyboard navigation & Tibia Hotkeys
  useEffect(() => {
    if (!tibiaMode) return;

    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      const now = Date.now();
      const isHaste = now < hasteUntil;
      const stepDelay = isHaste ? 130 : 200;

      let dx = 0;
      let dy = 0;

      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
        case 'Numpad8':
          dy = -1;
          break;
        case 'KeyS':
        case 'ArrowDown':
        case 'Numpad2':
          dy = 1;
          break;
        case 'KeyA':
        case 'ArrowLeft':
        case 'Numpad4':
          dx = -1;
          break;
        case 'KeyD':
        case 'ArrowRight':
        case 'Numpad6':
          dx = 1;
          break;
        case 'Numpad7':
        case 'KeyQ':
          dx = -1; dy = -1;
          break;
        case 'Numpad9':
          dx = 1; dy = -1;
          break;
        case 'Numpad1':
        case 'KeyZ':
          dx = -1; dy = 1;
          break;
        case 'Numpad3':
        case 'KeyC':
          dx = 1; dy = 1;
          break;

        case 'Digit1':
          e.preventDefault();
          triggerHotkey(1);
          return;
        case 'Digit2':
          e.preventDefault();
          triggerHotkey(2);
          return;
        case 'Digit3':
          e.preventDefault();
          triggerHotkey(3);
          return;
        case 'Digit4':
          e.preventDefault();
          triggerHotkey(4);
          return;
        case 'Digit5':
          e.preventDefault();
          triggerHotkey(5);
          return;

        case 'Space':
          e.preventDefault();
          targetNearestEnemy();
          return;

        case 'Escape':
          setSelectedTarget(null);
          return;

        case 'KeyE':
        case 'KeyL':
        case 'KeyF':
          e.preventDefault();
          handleActionKeyE();
          return;

        default:
          return;
      }

      if (dx !== 0 || dy !== 0) {
        e.preventDefault();
        if (!myToken || !socket) return;
        if (now - lastStepTimeRef.current < stepDelay) return;

        const cur = myTokenPosRef.current;
        const newX = cur.x + dx;
        const newY = cur.y + dy;

        // Collision check with walls & pillars
        if (isTileBlocked(newX, newY, currentMap.obstacles, cols, rows)) {
          return;
        }

        if (newX !== cur.x || newY !== cur.y) {
          lastStepTimeRef.current = now;
          myTokenPosRef.current = { x: newX, y: newY };
          myToken.x = newX;
          myToken.y = newY;
          socket.emit('token:move', { tokenId: myToken.id, x: newX, y: newY });
          if (cameraFollow) centerOnGrid(newX, newY);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tibiaMode, myToken, socket, cols, rows, cameraFollow, hasteUntil, triggerHotkey, targetNearestEnemy, handleActionKeyE, room.combat, currentMap.obstacles]);

  // Real-Time Auto-Attack Loop
  useEffect(() => {
    if (!tibiaMode || !autoAttack || !myToken || !selectedTarget || selectedTarget.type !== 'enemy') return;
    if ((selectedTarget.hp || 0) <= 0) return;

    const interval = setInterval(() => {
      const now = Date.now();
      if (now - lastAttackTime < 1800) return;

      const distSquares = Math.max(Math.abs(selectedTarget.x - myToken.x), Math.abs(selectedTarget.y - myToken.y));
      const distMeters = distSquares * 1.5;

      const mainWeapon = myWeapons[0] || { name: 'Ataque Desarmado', damage: '1d4', range: 1.5, type: 'weapon' };
      const maxRange = mainWeapon.range || (mainWeapon.properties?.some(p => p.includes('Munição') || p.includes('Arremesso')) ? 18 : 1.5);

      if (distMeters <= maxRange + 0.5) {
        setLastAttackTime(now);
        executeCombatAction('weapon', mainWeapon);
      }
    }, 250);

    return () => clearInterval(interval);
  }, [tibiaMode, autoAttack, myToken, selectedTarget, lastAttackTime, myWeapons, executeCombatAction]);

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-[calc(100vh-3.5rem)] overflow-hidden bg-dnd-darker select-none"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onContextMenu={e => e.preventDefault()}
    >
      <canvas ref={canvasRef} className="block cursor-grab active:cursor-grabbing" />

      {/* FLOATING ERROR / RANGE ALERT BANNER */}
      {actionAlert && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-red-950/95 border-2 border-red-500 text-red-100 px-5 py-2.5 rounded-xl shadow-2xl z-50 text-xs font-bold flex items-center space-x-2 animate-bounce">
          <Crosshair className="w-4 h-4 text-red-400" />
          <span>{actionAlert}</span>
        </div>
      )}

      {/* TOP BAR: INITIATIVE TRACKER + AUTO-DM + MISSIONS */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 flex flex-wrap items-center justify-center gap-2 z-30 max-w-[95vw]">
        {/* Tibia Mode Toggle */}
        <button
          onClick={() => setTibiaMode(!tibiaMode)}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-black shadow-lg backdrop-blur transition ${
            tibiaMode
              ? 'bg-amber-950/90 border-amber-500 text-amber-300 ring-1 ring-amber-500'
              : 'bg-dnd-panel/90 border-dnd-border text-gray-400 hover:text-white'
          }`}
          title="Modo Tibia: Movimentação livre por WASD/Setas, Auto-Ataque contínuo, Hotkeys 1-5 e Cadáveres com Loot!"
        >
          <span>🗡️ Tibia: {tibiaMode ? 'ATIVO (WASD)' : 'OFF'}</span>
        </button>

        {/* Camera Follow Toggle */}
        <button
          onClick={() => setCameraFollow(!cameraFollow)}
          className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold shadow-lg backdrop-blur transition ${
            cameraFollow
              ? 'bg-blue-950/90 border-blue-500 text-blue-300'
              : 'bg-dnd-panel/90 border-dnd-border text-gray-400 hover:text-white'
          }`}
          title="Manter a câmera centralizada no herói enquanto se movimenta"
        >
          <Target className="w-3.5 h-3.5 text-blue-400" />
          <span>Câmera: {cameraFollow ? 'Seguindo' : 'Livre'}</span>
        </button>

        {/* Respawn Monsters Button */}
        <button
          onClick={() => {
            sounds.playAttack();
            socket.emit('room:respawn_monsters');
          }}
          className="flex items-center space-x-1.5 bg-red-950/90 hover:bg-red-900 border border-red-500 text-red-200 px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg transition"
          title="Invocar horda de monstros para caçar (Respawn contínuo estilo Tibia)"
        >
          <Skull className="w-3.5 h-3.5 text-red-400" />
          <span>Respawn</span>
        </button>

        {/* Toggle Battle List Button */}
        <button
          onClick={() => setShowBattleList(!showBattleList)}
          className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold shadow-lg backdrop-blur transition ${
            showBattleList
              ? 'bg-red-950/90 border-red-500 text-red-300'
              : 'bg-dnd-panel/90 border-dnd-border text-gray-400 hover:text-white'
          }`}
          title="Alternar exibição da Lista de Batalha (Inimigos próximos)"
        >
          <Swords className="w-3.5 h-3.5 text-red-400" />
          <span>Batalha ({enemies.length})</span>
        </button>

        {/* Auto-DM Toggle Button */}
        <button
          onClick={() => socket.emit('autodm:toggle', { enabled: !room.autoDM })}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold shadow-lg backdrop-blur transition ${
            room.autoDM
              ? 'bg-emerald-950/90 border-emerald-500 text-emerald-300'
              : 'bg-dnd-panel/90 border-dnd-border text-gray-400 hover:text-white'
          }`}
          title="Quando ativo, o Mestre Automático move e ataca com os monstros sozinho nos turnos deles!"
        >
          <Bot className={`w-4 h-4 ${room.autoDM ? 'text-emerald-400 animate-pulse' : 'text-gray-400'}`} />
          <span>Mestre Automático: {room.autoDM ? 'ATIVO' : 'OFF'}</span>
        </button>

        {/* Adventures / Encounters Spawner Button */}
        <button
          onClick={() => setShowAdventureModal(true)}
          className="flex items-center space-x-1.5 bg-amber-500 hover:bg-amber-400 text-black px-3.5 py-1.5 rounded-xl text-xs font-black shadow-lg transition"
        >
          <Compass className="w-4 h-4" />
          <span>Missões & Gerar Inimigos</span>
        </button>

        {/* DM Fog of War Controls */}
        {isDM && (
          <div className="flex items-center space-x-1.5 bg-dnd-panel/95 backdrop-blur border border-purple-900/60 rounded-xl px-2.5 py-1 shadow-xl">
            <button
              onClick={() => socket.emit('fog:toggle_enabled', { enabled: !room.fogEnabled })}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                room.fogEnabled
                  ? 'bg-purple-950/90 border border-purple-500 text-purple-300 shadow'
                  : 'text-gray-400 hover:text-white hover:bg-dnd-hover'
              }`}
              title="Ativar ou desativar Neblina de Guerra no mapa"
            >
              {room.fogEnabled ? <EyeOff className="w-3.5 h-3.5 text-purple-400" /> : <Eye className="w-3.5 h-3.5" />}
              <span>Neblina: {room.fogEnabled ? 'ATIVA' : 'OFF'}</span>
            </button>

            {room.fogEnabled && (
              <>
                <button
                  onClick={() => setFogBrush(b => b === 'reveal' ? null : 'reveal')}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold transition border ${
                    fogBrush === 'reveal'
                      ? 'bg-emerald-600 border-emerald-400 text-white'
                      : 'border-dnd-border text-gray-300 hover:bg-dnd-hover'
                  }`}
                  title="Pincel Revelar: Clique ou arraste no mapa para dissipar a névoa"
                >
                  Revelar
                </button>
                <button
                  onClick={() => setFogBrush(b => b === 'hide' ? null : 'hide')}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold transition border ${
                    fogBrush === 'hide'
                      ? 'bg-red-600 border-red-400 text-white'
                      : 'border-dnd-border text-gray-300 hover:bg-dnd-hover'
                  }`}
                  title="Pincel Ocultar: Clique ou arraste no mapa para cobrir com névoa"
                >
                  Ocultar
                </button>
              </>
            )}
          </div>
        )}

        {/* Status MMORPG Tempo Real (Sem Turnos • Aggro por Proximidade <= 2q) */}
        <div className="flex items-center bg-dnd-panel/95 backdrop-blur border border-dnd-border rounded-xl px-3 py-1.5 shadow-xl space-x-2.5">
          {(() => {
            const chasingMonsters = enemies.filter(e => e.aggroTargetId && (e.hp || 0) > 0);
            return chasingMonsters.length > 0 ? (
              <div className="flex items-center space-x-2">
                <span className="flex items-center gap-1.5 text-xs font-bold text-red-400 animate-pulse">
                  <Swords className="w-3.5 h-3.5 text-red-500" />
                  <span>❗ {chasingMonsters.length} {chasingMonsters.length === 1 ? 'Inimigo Perseguindo!' : 'Inimigos Perseguindo!'}</span>
                </span>
                <div className="flex items-center space-x-1 max-w-xs overflow-x-auto">
                  {chasingMonsters.map(m => (
                    <button
                      key={m.id}
                      onClick={() => {
                        setSelectedTarget(m);
                        centerOnGrid(m.x, m.y);
                      }}
                      className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-red-950/80 border border-red-600 text-red-200 hover:bg-red-900 transition flex items-center space-x-1"
                      title={`Focar em ${m.name} (${m.hp}/${m.maxHp} PV)`}
                    >
                      <span>{m.avatar}</span>
                      <span className="truncate max-w-[75px]">{m.name.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5 text-xs text-emerald-400 font-semibold" title="Aproxime-se a até 2 quadrados de um monstro para atrair o aggro dele em tempo real!">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>MMORPG Tempo Real</span>
                <span className="text-[10px] text-gray-400 font-normal">• Aggro: 2 quadrados</span>
              </div>
            );
          })()}
        </div>
      </div>

      {/* LEFT SIDEBAR: PARTY HEROES & ENEMIES ON MAP */}
      <div className="absolute top-16 left-3 w-56 space-y-2.5 z-20 max-h-[calc(100vh-13rem)] overflow-y-auto pr-1">
        {/* Party Members Panel */}
        <div className="bg-dnd-panel/95 backdrop-blur border border-dnd-border rounded-2xl p-2.5 shadow-xl">
          <div className="flex items-center justify-between text-[11px] font-bold text-blue-400 uppercase tracking-wider pb-1.5 border-b border-dnd-border mb-2">
            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> Heróis na Sala ({partyTokens.length})</span>
          </div>
          <div className="space-y-1.5">
            {partyTokens.map(pt => {
              const isMe = myChar && pt.characterId === myChar.id;
              return (
                <div
                  key={pt.id}
                  onClick={() => {
                    setSelectedTarget(pt);
                    centerOnGrid(pt.x, pt.y);
                  }}
                  className={`cursor-pointer p-2 rounded-xl border transition ${
                    selectedTarget?.id === pt.id
                      ? 'bg-blue-950/60 border-blue-400'
                      : 'bg-dnd-darker/80 border-dnd-border hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{pt.avatar}</span>
                      <div>
                        <div className="text-xs font-bold text-gray-100 leading-tight">
                          {pt.name} {isMe && <span className="text-[10px] text-amber-400">(Você)</span>}
                        </div>
                        <div className="text-[10px] text-gray-400 font-mono">
                          CA {pt.ac} • PV {pt.hp}/{pt.maxHp}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-dnd-darker rounded-full overflow-hidden mt-1.5">
                    <div
                      className="h-full bg-emerald-500 transition-all"
                      style={{ width: `${Math.max(0, Math.min(100, (pt.hp / pt.maxHp) * 100))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Enemies on Map Panel */}
        <div className="bg-dnd-panel/95 backdrop-blur border border-red-900/60 rounded-2xl p-2.5 shadow-xl">
          <div className="flex items-center justify-between text-[11px] font-bold text-red-400 uppercase tracking-wider pb-1.5 border-b border-dnd-border mb-2">
            <span className="flex items-center gap-1"><Skull className="w-3.5 h-3.5" /> Inimigos ({enemies.length})</span>
            <button
              onClick={() => setShowAdventureModal(true)}
              className="text-[10px] bg-red-950 hover:bg-red-900 text-red-300 px-1.5 py-0.5 rounded border border-red-800"
            >
              + Invocar
            </button>
          </div>

          {enemies.length === 0 ? (
            <div className="text-center py-3">
              <p className="text-[11px] text-gray-400 mb-2">Área limpa! Nenhum inimigo vivo.</p>
              <button
                onClick={() => socket.emit('adventure:random_encounter', { difficulty: 'medium' })}
                className="w-full py-1.5 bg-red-800 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition shadow"
              >
                ⚔️ Gerar Novos Inimigos
              </button>
            </div>
          ) : (
            <div className="space-y-1.5">
              {enemies.map(en => {
                const isTargeted = selectedTarget?.id === en.id;
                return (
                  <div
                    key={en.id}
                    onClick={() => {
                      setSelectedTarget(en);
                      centerOnGrid(en.x, en.y);
                    }}
                    className={`cursor-pointer p-2 rounded-xl border transition ${
                      isTargeted
                        ? 'bg-red-950/70 border-red-500 shadow-md'
                        : 'bg-dnd-darker/80 border-dnd-border hover:border-red-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{en.avatar}</span>
                        <div>
                          <div className="text-xs font-bold text-red-200 leading-tight">{en.name}</div>
                          <div className="text-[10px] text-gray-400 font-mono">
                            CA {en.ac} • PV {en.hp}/{en.maxHp}
                          </div>
                        </div>
                      </div>
                      {isTargeted && (
                        <span className="text-[9px] bg-red-600 text-white px-1.5 py-0.5 rounded font-bold">
                          ALVO
                        </span>
                      )}
                    </div>
                    <div className="w-full h-1.5 bg-dnd-darker rounded-full overflow-hidden mt-1.5">
                      <div
                        className="h-full bg-red-500 transition-all"
                        style={{ width: `${Math.max(0, Math.min(100, (en.hp / en.maxHp) * 100))}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Camera Zoom & Center Controls */}
        <div className="flex items-center gap-1 bg-dnd-panel/90 backdrop-blur border border-dnd-border rounded-xl p-1 shadow-lg">
          <button
            onClick={() => setZoom(z => Math.min(2.2, z + 0.15))}
            className="flex-1 py-1 rounded hover:bg-dnd-hover text-gray-300 flex justify-center"
            title="Mais Zoom"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(z => Math.max(0.45, z - 0.15))}
            className="flex-1 py-1 rounded hover:bg-dnd-hover text-gray-300 flex justify-center"
            title="Menos Zoom"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (myToken) centerOnGrid(myToken.x, myToken.y);
              else setPan({ x: 240, y: 70 });
            }}
            className="flex-1 py-1 rounded hover:bg-dnd-hover text-amber-400 text-[10px] font-bold"
            title="Centralizar no Meu Herói"
          >
            Centrar
          </button>
        </div>
      </div>

      {/* RIGHT SIDEBAR: LIVE COMBAT LOG & NARRATION */}
      <div className="absolute top-16 right-3 z-20 flex flex-col items-end">
        <button
          onClick={() => setShowRightLog(!showRightLog)}
          className="bg-dnd-panel/90 border border-dnd-border px-3 py-1.5 rounded-xl text-xs font-bold text-gray-300 hover:text-white mb-2 flex items-center space-x-1.5 shadow-lg"
        >
          <MessageSquare className="w-3.5 h-3.5 text-dnd-gold" />
          <span>{showRightLog ? 'Ocultar Registro' : 'Ver Registro de Combate'}</span>
        </button>

        {showRightLog && (
          <div className="w-72 sm:w-80 h-[calc(100vh-16rem)] bg-dnd-panel/95 backdrop-blur border border-dnd-border rounded-2xl p-3 flex flex-col shadow-2xl">
            <div className="text-[11px] font-bold text-dnd-gold uppercase tracking-wider pb-2 border-b border-dnd-border mb-2 flex items-center justify-between">
              <span>📜 Registro de Ações & Mestre</span>
              <span className="text-[10px] text-emerald-400 font-mono">Ao Vivo</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
              {(room.chatHistory || []).slice(-25).map((msg, i) => (
                <div
                  key={msg.id || i}
                  className={`p-2 rounded-xl border ${
                    msg.type === 'narration'
                      ? 'bg-amber-950/40 border-dnd-gold/60 text-amber-200'
                      : msg.senderType === 'dm'
                      ? 'bg-red-950/30 border-red-800/50 text-gray-200'
                      : 'bg-dnd-darker/80 border-dnd-border text-gray-300'
                  }`}
                >
                  <div className="font-bold text-[10px] text-dnd-gold mb-0.5">{msg.sender}</div>
                  <div className="leading-snug text-[11px]">{msg.content.replace(/\*\*/g, '')}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM ACTION HOTBAR (PLAYER COMBAT CONTROLS) */}
      {myChar && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-dnd-panel/95 backdrop-blur-md border-2 border-dnd-border rounded-2xl px-4 py-2.5 shadow-2xl z-30 flex flex-wrap items-center gap-3 max-w-[96vw]">
          
          {/* Hero Portrait & Vitals */}
          <div 
            onClick={onOpenSheet}
            className="cursor-pointer flex items-center space-x-2.5 pr-3 border-r border-dnd-border hover:opacity-90 transition"
            title="Clique para abrir sua Ficha Completa e Atributos"
          >
            <div className="relative w-11 h-11 rounded-xl bg-dnd-darker border-2 border-dnd-gold flex items-center justify-center text-2xl shadow">
              {myChar.avatar || '⚔️'}
              {myChar.unspentStatPoints > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-black text-[9px] font-black px-1.5 py-0.5 rounded-full animate-bounce">
                  +{myChar.unspentStatPoints} ATR
                </span>
              )}
            </div>
            <div>
              <div className="font-cinzel font-bold text-xs text-dnd-gold flex items-center gap-1.5">
                <span>{myChar.name}</span>
                <span className="text-[10px] bg-dnd-darker px-1.5 py-0.2 rounded text-gray-300 border border-dnd-border">
                  Nv.{myChar.level || 1}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-xs font-mono mt-0.5">
                <span className="text-emerald-400 font-bold">❤️ {myChar.hp}/{myChar.maxHp}</span>
                <span className="text-blue-400 font-bold">🛡️ CA {myChar.ac}</span>
                <span className="text-amber-400 font-bold">💰 {myChar.gold || 0} PO</span>
              </div>
            </div>
          </div>

          {/* Current Target Indicator */}
          <div className="px-2 border-r border-dnd-border text-xs">
            <div className="text-[9px] uppercase font-bold text-gray-400">Alvo Selecionado:</div>
            {selectedTarget ? (
              <div className="font-bold text-red-400 flex items-center space-x-1">
                <span>{selectedTarget.avatar}</span>
                <span className="truncate max-w-[110px]">{selectedTarget.name}</span>
                <span className="text-[10px] text-gray-400 font-mono">({selectedTarget.hp} PV)</span>
              </div>
            ) : (
              <div className="text-gray-500 text-[11px]">Clique num inimigo</div>
            )}
          </div>

          {/* Weapon Attack Buttons */}
          <div className="flex items-center gap-1.5">
            {myWeapons.slice(0, 3).map((w, idx) => (
              <button
                key={idx}
                onClick={() => executeCombatAction('weapon', w)}
                className="bg-red-900/80 hover:bg-red-700 border border-red-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition shadow flex flex-col items-center"
                title={`Atacar alvo com ${w.name} (Dano: ${w.damage} ${w.damageType}, Alcance: ${w.range || 1.5}m)`}
              >
                <div className="flex items-center space-x-1">
                  <Swords className="w-3.5 h-3.5 text-amber-300" />
                  <span>{w.name}</span>
                </div>
                <span className="text-[9px] text-red-200 font-mono">{w.damage} • {w.range || 1.5}m</span>
              </button>
            ))}

            {/* Quick Spell Buttons */}
            {SPELLS.slice(0, 2).map(sp => (
              <button
                key={sp.id}
                onClick={() => executeCombatAction('spell', sp)}
                className="bg-purple-950/90 hover:bg-purple-800 border border-purple-600 text-purple-100 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow flex flex-col items-center"
                title={sp.desc}
              >
                <div className="flex items-center space-x-1">
                  <Flame className="w-3.5 h-3.5 text-purple-300" />
                  <span>{sp.name}</span>
                </div>
                <span className="text-[9px] text-purple-300 font-mono">
                  {sp.damage ? `${sp.damage} (${sp.range}m)` : `Cura ${sp.heal}`}
                </span>
              </button>
            ))}

            {/* Healing Spell / Second Wind */}
            <button
              onClick={() => executeCombatAction('spell', SPELLS.find(s => s.id === 'cure_wounds'))}
              className="bg-emerald-950/90 hover:bg-emerald-800 border border-emerald-600 text-emerald-200 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow flex flex-col items-center"
              title="Restaura 1d8+4 PV"
            >
              <div className="flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Curar</span>
              </div>
              <span className="text-[9px] text-emerald-300 font-mono">1d8+4 PV</span>
            </button>

            {/* Quick Potion Button */}
            <button
              onClick={handleQuickPotion}
              className="bg-dnd-darker hover:bg-dnd-hover border border-dnd-border text-gray-200 px-3 py-1.5 rounded-xl text-xs font-bold transition flex flex-col items-center"
              title="Beber Poção de Cura da mochila"
            >
              <span>🧪 Poção ({myPotionsCount})</span>
              <span className="text-[9px] text-emerald-400 font-mono">+2d4+2 PV</span>
            </button>

            {/* TIBIA HOTBAR (1 a 5) & AUTO-ATTACK */}
            <div className="flex items-center space-x-1.5 pl-2.5 border-l-2 border-amber-600/60">
              {/* Auto-Attack Toggle */}
              <button
                onClick={() => setAutoAttack(!autoAttack)}
                className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold flex flex-col items-center transition ${
                  autoAttack
                    ? 'bg-amber-950/90 border-amber-500 text-amber-200'
                    : 'bg-dnd-darker border-dnd-border text-gray-400'
                }`}
                title="Auto-Ataque: Quando ativo, golpeia o inimigo selecionado a cada 1.8s ao estar no alcance"
              >
                <div className="flex items-center space-x-1">
                  <Swords className="w-3.5 h-3.5 text-amber-400" />
                  <span>Auto-Atk</span>
                </div>
                <span className="text-[9px] text-amber-300 font-mono">{autoAttack ? 'ATIVO' : 'OFF'}</span>
              </button>

              {/* Hotkey 1: Exura */}
              <button
                onClick={() => triggerHotkey(1)}
                className="relative px-2.5 py-1.5 bg-emerald-950/90 hover:bg-emerald-900 border border-emerald-500 text-emerald-200 rounded-xl font-bold text-xs flex flex-col items-center shadow transition"
                title="Atalho [1]: Exura (Cura Rápida)"
              >
                <span className="text-[8px] bg-black/70 px-1 rounded text-gray-300 font-mono absolute -top-1 -left-1 border border-emerald-700">1</span>
                <span>✨ Exura</span>
                <span className="text-[9px] text-emerald-300 font-mono">+2d4+2 PV</span>
              </button>

              {/* Hotkey 2: Exori */}
              <button
                onClick={() => triggerHotkey(2)}
                className="relative px-2.5 py-1.5 bg-red-950/90 hover:bg-red-900 border border-red-500 text-red-200 rounded-xl font-bold text-xs flex flex-col items-center shadow transition"
                title="Atalho [2]: Exori (Golpe em Área em todos ao redor)"
              >
                <span className="text-[8px] bg-black/70 px-1 rounded text-gray-300 font-mono absolute -top-1 -left-1 border border-red-700">2</span>
                <span>⚔️ Exori</span>
                <span className="text-[9px] text-red-300 font-mono">1d8+Mod</span>
              </button>

              {/* Hotkey 3: Exori Flam */}
              <button
                onClick={() => triggerHotkey(3)}
                className="relative px-2.5 py-1.5 bg-amber-950/90 hover:bg-amber-900 border border-amber-500 text-amber-200 rounded-xl font-bold text-xs flex flex-col items-center shadow transition"
                title="Atalho [3]: Exori Flam (Lança Chamas no Alvo Selecionado)"
              >
                <span className="text-[8px] bg-black/70 px-1 rounded text-gray-300 font-mono absolute -top-1 -left-1 border border-amber-700">3</span>
                <span>🔥 Flam</span>
                <span className="text-[9px] text-amber-300 font-mono">2d6+3</span>
              </button>

              {/* Hotkey 4: Poção */}
              <button
                onClick={() => triggerHotkey(4)}
                className="relative px-2.5 py-1.5 bg-blue-950/90 hover:bg-blue-900 border border-blue-500 text-blue-200 rounded-xl font-bold text-xs flex flex-col items-center shadow transition"
                title="Atalho [4]: Beber Poção de Vida da Mochila"
              >
                <span className="text-[8px] bg-black/70 px-1 rounded text-gray-300 font-mono absolute -top-1 -left-1 border border-blue-700">4</span>
                <span>🧪 Poção</span>
                <span className="text-[9px] text-blue-300 font-mono">x{myPotionsCount}</span>
              </button>

              {/* Hotkey 5: Utevo Hur */}
              <button
                onClick={() => triggerHotkey(5)}
                className={`relative px-2.5 py-1.5 border rounded-xl font-bold text-xs flex flex-col items-center shadow transition ${
                  Date.now() < hasteUntil
                    ? 'bg-cyan-950/90 border-cyan-400 text-cyan-200 animate-pulse'
                    : 'bg-dnd-darker border-dnd-border text-gray-300 hover:text-white'
                }`}
                title="Atalho [5]: Utevo Hur (Haste - Acelera Movimento por 8s)"
              >
                <span className="text-[8px] bg-black/70 px-1 rounded text-gray-300 font-mono absolute -top-1 -left-1 border border-cyan-700">5</span>
                <span>⚡ Hur</span>
                <span className="text-[9px] text-cyan-300 font-mono">+50% Vel</span>
              </button>

              {/* Action Key [E] Shortcut Button */}
              <button
                onClick={handleActionKeyE}
                className="relative px-2.5 py-1.5 bg-purple-950/90 hover:bg-purple-900 border border-purple-500 text-purple-200 rounded-xl font-bold text-xs flex flex-col items-center shadow transition"
                title="Atalho [E] no teclado: Interagir com Baús de Tesouro, Altares Rúnicos e Cadáveres adjacentes!"
              >
                <span className="text-[8px] bg-black/70 px-1 rounded text-purple-300 font-mono absolute -top-1 -left-1 border border-purple-700">E</span>
                <span>✨ Ação [E]</span>
                <span className="text-[9px] text-purple-300 font-mono">Interagir</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADVENTURES, CAMPAIGNS & MONSTER SPAWNER MODAL */}
      {showAdventureModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dnd-panel border border-dnd-gold rounded-2xl w-full max-w-3xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden animate-fadeIn">
            <div className="bg-dnd-darker border-b border-dnd-border px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Bot className="w-6 h-6 text-dnd-gold" />
                <div>
                  <h3 className="font-cinzel font-black text-lg text-dnd-gold">
                    Mestre Automático — Missões, Mapas & Encontros
                  </h3>
                  <p className="text-xs text-gray-400">
                    Escolha uma missão da campanha, gere encontros aleatórios ou invoque monstros no mapa!
                  </p>
                </div>
              </div>
              <button onClick={() => setShowAdventureModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {/* 1. Random Encounter Generator */}
              <div>
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2.5">
                  ⚡ Gerador Instantâneo de Encontros (No Mapa Atual)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'easy', label: 'Patrulha Fácil', sub: '3 Inimigos Nv.1', color: 'border-emerald-600 bg-emerald-950/40 text-emerald-300' },
                    { id: 'medium', label: 'Emboscada Média', sub: '4 Inimigos Nv.1-2', color: 'border-amber-600 bg-amber-950/40 text-amber-300' },
                    { id: 'hard', label: 'Horda Difícil', sub: '4 Inimigos Elite', color: 'border-orange-600 bg-orange-950/40 text-orange-300' },
                    { id: 'boss', label: 'Chefão Lendário', sub: 'Dragão / Beholder', color: 'border-red-600 bg-red-950/50 text-red-300' }
                  ].map(diff => (
                    <button
                      key={diff.id}
                      onClick={() => {
                        sounds.playAttack();
                        socket.emit('adventure:random_encounter', { difficulty: diff.id });
                        setShowAdventureModal(false);
                      }}
                      className={`p-3 rounded-xl border text-left transition hover:scale-[1.02] ${diff.color}`}
                    >
                      <div className="font-cinzel font-bold text-xs">{diff.label}</div>
                      <div className="text-[10px] opacity-80 mt-0.5">{diff.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Pre-built Campaign Acts */}
              <div>
                <h4 className="text-xs font-bold text-dnd-gold uppercase tracking-wider mb-2.5">
                  🗺️ Atos da Campanha (Carrega Mapa + Monstros + Baús de Tesouro)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ADVENTURES.map(adv => (
                    <div
                      key={adv.id}
                      className="bg-dnd-darker border border-dnd-border hover:border-dnd-gold rounded-xl p-3.5 flex flex-col justify-between transition"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-cinzel font-bold text-sm text-gray-100">{adv.name}</span>
                          <span className="text-[10px] bg-dnd-panel px-2 py-0.5 rounded text-amber-400 border border-dnd-border">
                            {adv.difficulty}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400 line-clamp-2 mb-3">
                          {adv.narration.replace('📜 MESTRE AUTOMÁTICO: ', '')}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          sounds.playCriticalSuccess();
                          socket.emit('adventure:load', { adventureId: adv.id });
                          setShowAdventureModal(false);
                        }}
                        className="w-full py-2 bg-dnd-gold hover:bg-amber-400 text-black font-bold text-xs rounded-lg transition shadow"
                      >
                        Iniciar Missão
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Individual Monster Spawner */}
              <div>
                <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2.5">
                  👹 Adicionar Monstro Individual ao Mapa
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {MONSTERS.map(m => (
                    <button
                      key={m.id}
                      onClick={() => {
                        handleQuickSpawnMonster(m);
                        setShowAdventureModal(false);
                      }}
                      className="bg-dnd-darker hover:bg-red-950/40 border border-dnd-border hover:border-red-600 rounded-xl p-2 text-left flex items-center space-x-2 transition"
                    >
                      <span className="text-2xl">{m.avatar}</span>
                      <div className="overflow-hidden">
                        <div className="font-bold text-xs text-gray-200 truncate">{m.name}</div>
                        <div className="text-[10px] text-gray-400 font-mono">PV {m.hp} • CA {m.ac}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RETRO TIBIA LOOT MODAL */}
      {lootModalCorpse && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dnd-panel border-2 border-amber-500 rounded-2xl w-full max-w-sm p-4 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between pb-2 border-b border-dnd-border mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{lootModalCorpse.opened ? '🦴' : '💀'}</span>
                <div>
                  <h3 className="font-cinzel font-bold text-sm text-dnd-gold">{lootModalCorpse.name}</h3>
                  <p className="text-[10px] text-gray-400">Conteúdo do Cadáver</p>
                </div>
              </div>
              <button 
                onClick={() => setLootModalCorpse(null)}
                className="text-gray-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-dnd-darker rounded-xl p-3 border border-dnd-border mb-4 space-y-2">
              {lootModalCorpse.opened ? (
                <div className="text-center py-4 text-xs text-gray-400 italic">
                  O cadáver já foi saqueado e está vazio.
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-amber-950/40 border border-amber-600/50 text-amber-200 text-xs font-bold">
                    <span className="flex items-center space-x-2">
                      <span className="text-lg">🪙</span>
                      <span>Moedas de Ouro</span>
                    </span>
                    <span className="font-mono text-sm font-bold text-amber-400">+{lootModalCorpse.gold || 0} PO</span>
                  </div>

                  {(lootModalCorpse.items || []).map((it, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-dnd-panel border border-dnd-border text-gray-200 text-xs font-bold">
                      <span className="flex items-center space-x-2">
                        <span className="text-lg">🗡️</span>
                        <span>{it.name}</span>
                      </span>
                      <span className="text-[10px] text-dnd-gold font-mono">{it.damage || it.heal || it.type}</span>
                    </div>
                  ))}
                </>
              )}
            </div>

            {!lootModalCorpse.opened && (
              <button
                onClick={() => {
                  sounds.playCoins();
                  socket.emit('corpse:loot', { corpseId: lootModalCorpse.id });
                  setLootModalCorpse(null);
                }}
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs rounded-xl shadow-lg flex items-center justify-center space-x-2 transition"
              >
                <span>💰 Pegar Tudo (Loot All)</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* STORY QUEST HUD & RELIC PROGRESS */}
      <StoryQuestHUD
        currentLandId={room.currentLandId || 'land_forest'}
        bossDefeated={room.bossDefeated}
        collectedRelics={room.collectedRelics || []}
        onOpenStoryModal={() => setShowStoryLoreModal(true)}
      />

      {/* NPC DIALOGUE & INTERACTION MODAL */}
      {activeDialogueNpc && (
        <NPCDialogueModal
          npc={activeDialogueNpc}
          onClose={() => setActiveDialogueNpc(null)}
          onOpenShop={(npc) => {
            if (socket) {
              socket.emit('chat:send', {
                sender: npc.name,
                senderType: 'system',
                content: `🛒 **${npc.name}** abriu seus suprimentos! Cliquem no Mercado na barra superior para comprar ou vender equipamentos.`
              });
            }
          }}
          onFullHeal={() => {
            if (myChar && socket) {
              myChar.hp = myChar.maxHp;
              socket.emit('character:update', { character: { ...myChar, hp: myChar.maxHp } });
              sounds.playHeal();
            }
          }}
        />
      )}

      {/* COMPLETE STORY LORE MODAL */}
      {showStoryLoreModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-dnd-panel border-2 border-dnd-gold rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="bg-dnd-darker border-b border-dnd-border px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">📜</span>
                <div>
                  <h3 className="font-cinzel font-bold text-lg text-dnd-gold">{STORY_CAMPAIGN.title}</h3>
                  <p className="text-xs text-gray-400">Crônicas das Quatro Terras de Eldoria</p>
                </div>
              </div>
              <button 
                onClick={() => setShowStoryLoreModal(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-sm text-gray-200">
              <p className="italic text-amber-200/90 leading-relaxed bg-amber-950/20 border border-amber-500/20 p-3 rounded-xl font-serif">
                "{STORY_CAMPAIGN.synopsis}"
              </p>

              <div className="space-y-3 pt-2">
                {STORY_CAMPAIGN.lands.map((l, i) => (
                  <div key={l.id} className="p-3.5 bg-dnd-darker border border-dnd-border rounded-xl">
                    <div className="flex items-center justify-between font-bold text-dnd-gold text-xs mb-1">
                      <span>Land {i + 1}: {l.name}</span>
                      <span className="text-red-400">Boss: {l.bossName}</span>
                    </div>
                    <p className="text-xs text-gray-400 mb-2">{l.description}</p>
                    <div className="text-[11px] text-emerald-400 bg-emerald-950/30 px-2 py-1 rounded border border-emerald-800/40">
                      🏆 Recompensa: {l.relicReward.name} ({l.relicReward.icon}) — {l.relicReward.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
