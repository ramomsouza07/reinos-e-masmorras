import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Eye, 
  EyeOff, 
  Brush, 
  Eraser, 
  MapPin, 
  Plus, 
  Trash2, 
  Heart, 
  Shield, 
  RotateCcw,
  Sparkles,
  Layers,
  ChevronDown
} from 'lucide-react';
import { MAP_PRESETS, CONDITIONS } from '../data/dndData';
import { sounds } from '../utils/soundEffects';

export default function BattleMap({ 
  room, 
  socket, 
  isDM, 
  player, 
  onSpawnMonster 
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Viewport transformation
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 50, y: 50 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // DM Fog tools: 'none' | 'reveal' | 'hide'
  const [fogTool, setFogTool] = useState('none');
  const [brushSize, setBrushSize] = useState(1); // 1 or 3
  const [isFogPainting, setIsFogPainting] = useState(false);

  // Token dragging & selection
  const [draggedToken, setDraggedToken] = useState(null);
  const [dragOrigin, setDragOrigin] = useState(null);
  const [dragCurrent, setDragCurrent] = useState(null);
  const [selectedToken, setSelectedToken] = useState(null);
  const [contextMenu, setContextMenu] = useState(null); // { x, y, token }

  // Ping state
  const [pings, setPings] = useState([]);
  const [isPingToolActive, setIsPingToolActive] = useState(false);

  // Map settings dropdown
  const [showMapSelector, setShowMapSelector] = useState(false);
  const [customImgUrl, setCustomImgUrl] = useState('');

  const currentMap = room.map || MAP_PRESETS[0];
  const gridSize = currentMap.gridSize || 50;
  const cols = currentMap.cols || 24;
  const rows = currentMap.rows || 18;

  // Listen for socket ping
  useEffect(() => {
    if (!socket) return;
    const handlePing = ({ x, y, color }) => {
      const pingId = Date.now() + Math.random();
      setPings(prev => [...prev, { id: pingId, x, y, color }]);
      sounds.playSpell();
      setTimeout(() => {
        setPings(prev => prev.filter(p => p.id !== pingId));
      }, 2000);
    };

    socket.on('map:ping_received', handlePing);
    return () => socket.off('map:ping_received', handlePing);
  }, [socket]);

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

  // Main Canvas Render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize canvas to parent container
    const width = containerRef.current?.clientWidth || 1000;
    const height = containerRef.current?.clientHeight || 700;
    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);

    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    const totalWidth = cols * gridSize;
    const totalHeight = rows * gridSize;

    // 1. Draw Map Background
    ctx.fillStyle = currentMap.bgColor || '#14161f';
    ctx.fillRect(0, 0, totalWidth, totalHeight);

    // Obstacles / Map features
    if (currentMap.obstacles) {
      currentMap.obstacles.forEach(obs => {
        const ox = obs.x * gridSize;
        const oy = obs.y * gridSize;
        const ow = obs.w * gridSize;
        const oh = obs.h * gridSize;

        if (obs.type === 'wall') {
          ctx.fillStyle = '#2d3345';
          ctx.fillRect(ox, oy, ow, oh);
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 2;
          ctx.strokeRect(ox, oy, ow, oh);
        } else if (obs.type === 'water') {
          ctx.fillStyle = 'rgba(30, 64, 175, 0.4)';
          ctx.fillRect(ox, oy, ow, oh);
        } else if (obs.type === 'lava') {
          ctx.fillStyle = 'rgba(220, 38, 38, 0.6)';
          ctx.fillRect(ox, oy, ow, oh);
        } else if (obs.type === 'table' || obs.type === 'bar') {
          ctx.fillStyle = '#78350f';
          ctx.fillRect(ox, oy, ow, oh);
          ctx.strokeStyle = '#92400e';
          ctx.strokeRect(ox, oy, ow, oh);
        } else {
          ctx.fillStyle = 'rgba(75, 85, 99, 0.5)';
          ctx.fillRect(ox, oy, ow, oh);
        }

        if (obs.label) {
          ctx.font = '10px Inter, sans-serif';
          ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(obs.label, ox + ow / 2, oy + oh / 2);
        }
      });
    }

    // 2. Draw Grid Lines
    ctx.strokeStyle = currentMap.gridColor || 'rgba(255, 255, 255, 0.08)';
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

    // Coordinates (A, B, C... and 1, 2, 3...)
    ctx.font = '10px monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let c = 0; c < cols; c++) {
      const letter = String.fromCharCode(65 + (c % 26)) + (c >= 26 ? Math.floor(c / 26) : '');
      ctx.fillText(letter, c * gridSize + gridSize / 2, 2);
    }
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    for (let r = 0; r < rows; r++) {
      ctx.fillText(`${r + 1}`, 3, r * gridSize + gridSize / 2);
    }

    // 3. Fog of War
    const revealedSet = new Set(room.fog || []);
    if (isDM) {
      // DM sees dimmed fog
      ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          if (!revealedSet.has(`${c},${r}`)) {
            ctx.fillRect(c * gridSize, r * gridSize, gridSize, gridSize);
          }
        }
      }
    } else {
      // Player sees pitch-black fog
      ctx.fillStyle = '#06070a';
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          if (!revealedSet.has(`${c},${r}`)) {
            ctx.fillRect(c * gridSize, r * gridSize, gridSize, gridSize);
          }
        }
      }
    }

    // 4. Drag distance ruler
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
      ctx.fillStyle = '#F59E0B';
      ctx.fillText(`${distSquares}q (${distMeters}m)`, (startX + endX) / 2, (startY + endY) / 2 - 10);
    }

    // 5. Draw Tokens
    (room.tokens || []).forEach(tok => {
      // If player and token is in fog, do not render unless revealed or token is player's own
      const inFog = !revealedSet.has(`${tok.x},${tok.y}`);
      if (!isDM && inFog && tok.characterId !== player?.character?.id) {
        return;
      }

      const tx = tok.x * gridSize;
      const ty = tok.y * gridSize;
      const tSize = (tok.size || 1) * gridSize;
      const radius = (tSize / 2) - 4;
      const cx = tx + tSize / 2;
      const cy = ty + tSize / 2;

      const isTurn = room.combat?.active && room.combat.turnOrder[room.combat.currentTurnIndex] === tok.id;
      const isSelected = selectedToken?.id === tok.id;

      // Combat turn aura
      if (isTurn) {
        ctx.beginPath();
        ctx.arc(cx, cy, radius + 7, 0, Math.PI * 2);
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#F59E0B';
        ctx.shadowBlur = 15;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Selection outline
      if (isSelected) {
        ctx.beginPath();
        ctx.arc(cx, cy, radius + 4, 0, Math.PI * 2);
        ctx.strokeStyle = '#60A5FA';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Token circular body
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = tok.type === 'enemy' ? '#450a0a' : tok.type === 'npc' ? '#14532d' : '#1e3a8a';
      ctx.fill();

      // Border ring
      ctx.lineWidth = 3;
      ctx.strokeStyle = tok.color || (tok.type === 'enemy' ? '#EF4444' : '#3B82F6');
      ctx.stroke();

      // Token Avatar or Emoji
      ctx.font = `${Math.floor(radius * 1.1)}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(tok.avatar || (tok.type === 'enemy' ? '💀' : '🛡️'), cx, cy + 1);

      // HP Ring Arc
      if (tok.maxHp && tok.maxHp > 0) {
        const hpPercent = Math.max(0, Math.min(1, (tok.hp || 0) / tok.maxHp));
        ctx.beginPath();
        ctx.arc(cx, cy, radius + 2, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * hpPercent));
        ctx.strokeStyle = hpPercent > 0.5 ? '#10B981' : hpPercent > 0.25 ? '#F59E0B' : '#EF4444';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Token Nameplate
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.fillStyle = '#F3F4F6';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      // Name shadow for legibility
      ctx.shadowColor = 'black';
      ctx.shadowBlur = 4;
      ctx.fillText(tok.name, cx, cy + radius + 4);
      ctx.shadowBlur = 0;

      // Token Conditions
      if (tok.conditions && tok.conditions.length > 0) {
        const condText = tok.conditions.map(c => {
          const match = CONDITIONS.find(item => item.id === c);
          return match ? match.icon : '⚠️';
        }).join(' ');
        ctx.font = '12px serif';
        ctx.fillText(condText, cx, cy - radius - 14);
      }
    });

    // 6. Draw Map Pings
    pings.forEach(p => {
      const px = p.x * gridSize + gridSize / 2;
      const py = p.y * gridSize + gridSize / 2;
      ctx.beginPath();
      ctx.arc(px, py, 25, 0, Math.PI * 2);
      ctx.strokeStyle = p.color || '#F59E0B';
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(px, py, 12, 0, Math.PI * 2);
      ctx.fillStyle = p.color || '#F59E0B';
      ctx.fill();
    });

    ctx.restore();
  }, [pan, zoom, currentMap, room.tokens, room.fog, isDM, player, draggedToken, dragOrigin, dragCurrent, selectedToken, pings, cols, rows, gridSize]);

  // Pan / Zoom event handlers
  const handleWheel = (e) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    const newZoom = Math.min(Math.max(0.4, zoom * factor), 2.5);
    setZoom(newZoom);
  };

  const handleMouseDown = (e) => {
    // Middle click or spacebar held down for pan
    if (e.button === 1 || e.spaceKey || isPanning) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }

    const { col, row, canvasX, canvasY } = screenToGrid(e.clientX, e.clientY);

    // Ping tool
    if (isPingToolActive || e.altKey || e.shiftKey) {
      if (col >= 0 && col < cols && row >= 0 && row < rows) {
        socket.emit('map:ping', { x: col, y: row, color: player?.character?.color || '#F59E0B' });
        setIsPingToolActive(false);
      }
      return;
    }

    // Fog painting tool (DM only)
    if (isDM && fogTool !== 'none') {
      setIsFogPainting(true);
      applyFogBrush(col, row, fogTool);
      return;
    }

    // Left click on token -> select / start drag
    if (e.button === 0) {
      const clickedToken = (room.tokens || []).find(t => {
        const size = t.size || 1;
        return col >= t.x && col < t.x + size && row >= t.y && row < t.y + size;
      });

      if (clickedToken) {
        // Can only drag if DM or token belongs to player's character
        const canDrag = isDM || clickedToken.characterId === player?.character?.id;
        if (canDrag) {
          setDraggedToken(clickedToken);
          setDragOrigin({ x: clickedToken.x, y: clickedToken.y });
          setDragCurrent({ x: clickedToken.x, y: clickedToken.y });
        }
        setSelectedToken(clickedToken);
        setContextMenu(null);
      } else {
        setSelectedToken(null);
        setContextMenu(null);
      }
    }
  };

  const handleMouseMove = (e) => {
    if (isPanning) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
      return;
    }

    const { col, row } = screenToGrid(e.clientX, e.clientY);

    if (isDM && isFogPainting && fogTool !== 'none') {
      applyFogBrush(col, row, fogTool);
      return;
    }

    if (draggedToken) {
      setDragCurrent({ x: Math.max(0, Math.min(cols - 1, col)), y: Math.max(0, Math.min(rows - 1, row)) });
    }
  };

  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
    }
    if (isFogPainting) {
      setIsFogPainting(false);
    }

    if (draggedToken && dragCurrent) {
      if (dragCurrent.x !== dragOrigin.x || dragCurrent.y !== dragOrigin.y) {
        // Emit token move
        socket.emit('token:move', {
          tokenId: draggedToken.id,
          x: dragCurrent.x,
          y: dragCurrent.y
        });
        sounds.playAttack();
      }
      setDraggedToken(null);
      setDragOrigin(null);
      setDragCurrent(null);
    }
  };

  // Right Click context menu for tokens
  const handleContextMenu = (e) => {
    e.preventDefault();
    const { col, row } = screenToGrid(e.clientX, e.clientY);
    const clickedToken = (room.tokens || []).find(t => {
      const size = t.size || 1;
      return col >= t.x && col < t.x + size && row >= t.y && row < t.y + size;
    });

    if (clickedToken) {
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        token: clickedToken
      });
      setSelectedToken(clickedToken);
    } else {
      setContextMenu(null);
    }
  };

  // Fog brush application helper
  const applyFogBrush = (centerCol, centerRow, tool) => {
    const tiles = [];
    const radius = brushSize === 3 ? 1 : 0;

    for (let dc = -radius; dc <= radius; dc++) {
      for (let dr = -radius; dr <= radius; dr++) {
        const c = centerCol + dc;
        const r = centerRow + dr;
        if (c >= 0 && c < cols && r >= 0 && r < rows) {
          tiles.push(`${c},${r}`);
        }
      }
    }

    if (tool === 'reveal') {
      socket.emit('fog:reveal', { tiles });
    } else if (tool === 'hide') {
      socket.emit('fog:hide', { tiles });
    }
  };

  // Token HP modifier
  const adjustTokenHp = (tokenId, delta) => {
    const tok = room.tokens.find(t => t.id === tokenId);
    if (!tok) return;
    const newHp = Math.max(0, Math.min(tok.maxHp || 999, (tok.hp || 0) + delta));
    socket.emit('token:update', { id: tok.id, hp: newHp });
    if (delta > 0) sounds.playHeal();
    else sounds.playAttack();
  };

  // Token Condition toggle
  const toggleCondition = (tokenId, condId) => {
    const tok = room.tokens.find(t => t.id === tokenId);
    if (!tok) return;
    let conds = tok.conditions || [];
    if (conds.includes(condId)) {
      conds = conds.filter(c => c !== condId);
    } else {
      conds = [...conds, condId];
    }
    socket.emit('token:update', { id: tok.id, conditions: conds });
  };

  // Delete token
  const deleteToken = (tokenId) => {
    socket.emit('token:delete', { tokenId });
    setContextMenu(null);
    setSelectedToken(null);
  };

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-[calc(100vh-3.5rem)] overflow-hidden bg-dnd-darker select-none"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onContextMenu={handleContextMenu}
    >
      <canvas ref={canvasRef} className="block cursor-crosshair" />

      {/* Top Floating Controls */}
      <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2 z-20">
        {/* Zoom Controls */}
        <div className="flex items-center bg-dnd-panel/90 backdrop-blur border border-dnd-border rounded-lg p-1 shadow-lg">
          <button
            onClick={() => setZoom(z => Math.min(2.5, z + 0.15))}
            className="p-1.5 rounded hover:bg-dnd-hover text-gray-300 hover:text-white"
            title="Aumentar Zoom"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono font-bold px-2 text-gray-400">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(z => Math.max(0.4, z - 0.15))}
            className="p-1.5 rounded hover:bg-dnd-hover text-gray-300 hover:text-white"
            title="Diminuir Zoom"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setZoom(1); setPan({ x: 50, y: 50 }); }}
            className="p-1.5 rounded hover:bg-dnd-hover text-gray-300 hover:text-white border-l border-dnd-border ml-1"
            title="Resetar Câmera"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Ping Beacon Button */}
        <button
          onClick={() => setIsPingToolActive(!isPingToolActive)}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold shadow-lg backdrop-blur transition ${
            isPingToolActive
              ? 'bg-amber-500 text-black border-amber-400 animate-pulse'
              : 'bg-dnd-panel/90 text-amber-300 border-dnd-border hover:bg-dnd-hover'
          }`}
          title="Clique no mapa para sinalizar (Ping) aos amigos"
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Sinalizar (Ping)</span>
        </button>

        {/* DM Fog of War Tools */}
        {isDM && (
          <div className="flex items-center bg-dnd-panel/90 backdrop-blur border border-red-900/60 rounded-lg p-1 shadow-lg space-x-1">
            <span className="text-[11px] font-bold text-red-400 px-2 uppercase">Neblina:</span>
            <button
              onClick={() => setFogTool(fogTool === 'reveal' ? 'none' : 'reveal')}
              className={`p-1.5 rounded text-xs flex items-center space-x-1 transition ${
                fogTool === 'reveal'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-gray-300 hover:bg-dnd-hover'
              }`}
              title="Revelar Área (Pincel)"
            >
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
              <span>Revelar</span>
            </button>
            <button
              onClick={() => setFogTool(fogTool === 'hide' ? 'none' : 'hide')}
              className={`p-1.5 rounded text-xs flex items-center space-x-1 transition ${
                fogTool === 'hide'
                  ? 'bg-red-700 text-white font-bold'
                  : 'text-gray-300 hover:bg-dnd-hover'
              }`}
              title="Ocultar Área (Neblina)"
            >
              <EyeOff className="w-3.5 h-3.5 text-red-400" />
              <span>Ocultar</span>
            </button>
            <button
              onClick={() => setBrushSize(brushSize === 1 ? 3 : 1)}
              className="p-1.5 rounded text-xs font-mono font-bold bg-dnd-darker text-gray-300 hover:text-white"
              title="Tamanho do Pincel"
            >
              {brushSize}x{brushSize}
            </button>
            <button
              onClick={() => socket.emit('fog:reveal_all', { cols, rows })}
              className="px-2 py-1 text-[11px] rounded bg-dnd-hover text-gray-300 hover:text-white"
              title="Revelar todo o mapa"
            >
              Tudo
            </button>
            <button
              onClick={() => socket.emit('fog:reset_all')}
              className="px-2 py-1 text-[11px] rounded bg-red-950 text-red-300 hover:bg-red-900"
              title="Cobrir todo o mapa"
            >
              Cobrir
            </button>
          </div>
        )}

        {/* DM Map Presets Selector */}
        {isDM && (
          <div className="relative">
            <button
              onClick={() => setShowMapSelector(!showMapSelector)}
              className="flex items-center space-x-1.5 bg-dnd-panel/90 backdrop-blur border border-dnd-border hover:border-gray-500 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-200 shadow-lg"
            >
              <Layers className="w-3.5 h-3.5 text-dnd-gold" />
              <span>{currentMap.name || 'Mudar Mapa'}</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>

            {showMapSelector && (
              <div className="absolute top-10 left-0 w-64 bg-dnd-panel border border-dnd-border rounded-lg shadow-xl p-2 z-50">
                <div className="text-[11px] font-bold text-gray-400 uppercase pb-1.5 border-b border-dnd-border mb-2">
                  Cenários D&D 5e
                </div>
                <div className="space-y-1">
                  {MAP_PRESETS.map(preset => (
                    <button
                      key={preset.id}
                      onClick={() => {
                        socket.emit('map:change', preset);
                        setShowMapSelector(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded text-xs flex items-center justify-between transition ${
                        currentMap.id === preset.id
                          ? 'bg-dnd-gold text-black font-semibold'
                          : 'text-gray-300 hover:bg-dnd-hover'
                      }`}
                    >
                      <span>{preset.name}</span>
                      <span className="text-[10px] opacity-70">{preset.cols}x{preset.rows}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected Token Quick Info Card (Bottom-Left) */}
      {selectedToken && (
        <div className="absolute bottom-4 left-4 w-72 bg-dnd-panel/95 backdrop-blur border border-dnd-border rounded-xl p-3 shadow-2xl z-20 animate-fadeIn">
          <div className="flex items-center justify-between pb-2 border-b border-dnd-border">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{selectedToken.avatar}</span>
              <div>
                <h4 className="font-cinzel font-bold text-sm text-gray-100">{selectedToken.name}</h4>
                <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                  selectedToken.type === 'enemy' ? 'bg-red-950 text-red-400' : 'bg-blue-950 text-blue-400'
                }`}>
                  {selectedToken.type === 'enemy' ? 'Inimigo' : 'Aventureiro'}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-xs font-mono text-gray-400">CA:</span>
              <span className="text-xs font-mono font-bold text-dnd-gold bg-dnd-darker px-1.5 py-0.5 rounded border border-dnd-border">
                {selectedToken.ac || 10}
              </span>
            </div>
          </div>

          {/* HP Bar */}
          <div className="mt-2.5">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-400 flex items-center gap-1">
                <Heart className="w-3 h-3 text-red-500 fill-red-500" /> PV:
              </span>
              <span className="font-mono font-bold text-gray-200">
                {selectedToken.hp} / {selectedToken.maxHp}
              </span>
            </div>
            <div className="w-full h-2.5 bg-dnd-darker rounded-full overflow-hidden border border-dnd-border">
              <div
                className={`h-full transition-all duration-300 ${
                  (selectedToken.hp / selectedToken.maxHp) > 0.5
                    ? 'bg-emerald-500'
                    : (selectedToken.hp / selectedToken.maxHp) > 0.25
                    ? 'bg-amber-500'
                    : 'bg-red-600'
                }`}
                style={{ width: `${Math.max(0, Math.min(100, (selectedToken.hp / selectedToken.maxHp) * 100))}%` }}
              />
            </div>
          </div>

          {/* Quick HP adjustment buttons */}
          <div className="flex items-center justify-between gap-1.5 mt-3 pt-2 border-t border-dnd-border">
            <button
              onClick={() => adjustTokenHp(selectedToken.id, -5)}
              className="flex-1 py-1 bg-red-950/70 hover:bg-red-900 border border-red-800 text-red-300 text-xs rounded font-bold transition"
            >
              -5
            </button>
            <button
              onClick={() => adjustTokenHp(selectedToken.id, -1)}
              className="flex-1 py-1 bg-red-950/70 hover:bg-red-900 border border-red-800 text-red-300 text-xs rounded font-bold transition"
            >
              -1
            </button>
            <button
              onClick={() => adjustTokenHp(selectedToken.id, 1)}
              className="flex-1 py-1 bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 text-xs rounded font-bold transition"
            >
              +1
            </button>
            <button
              onClick={() => adjustTokenHp(selectedToken.id, 5)}
              className="flex-1 py-1 bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 text-xs rounded font-bold transition"
            >
              +5
            </button>
          </div>
        </div>
      )}

      {/* Right Click Context Menu */}
      {contextMenu && (
        <div
          className="fixed bg-dnd-panel border border-dnd-border rounded-lg shadow-2xl p-2 z-50 w-52 text-xs"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <div className="font-bold text-gray-200 pb-1.5 border-b border-dnd-border mb-1.5 flex items-center justify-between">
            <span>{contextMenu.token.name}</span>
            <span className="text-[10px] text-gray-400">CA {contextMenu.token.ac}</span>
          </div>

          <div className="py-1">
            <div className="text-[10px] text-gray-400 font-semibold mb-1">Condições:</div>
            <div className="grid grid-cols-4 gap-1 mb-2">
              {CONDITIONS.map(cond => {
                const has = (contextMenu.token.conditions || []).includes(cond.id);
                return (
                  <button
                    key={cond.id}
                    onClick={() => toggleCondition(contextMenu.token.id, cond.id)}
                    className={`p-1 rounded text-center text-sm border transition ${
                      has ? 'bg-amber-900/60 border-amber-500' : 'bg-dnd-darker border-dnd-border hover:border-gray-500'
                    }`}
                    title={cond.name}
                  >
                    {cond.icon}
                  </button>
                );
              })}
            </div>
          </div>

          {(isDM || contextMenu.token.characterId === player?.character?.id) && (
            <button
              onClick={() => deleteToken(contextMenu.token.id)}
              className="w-full text-left px-2 py-1.5 rounded text-red-400 hover:bg-red-950/60 flex items-center space-x-1.5 transition border-t border-dnd-border mt-1 pt-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remover do Mapa</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
