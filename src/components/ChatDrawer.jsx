import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  MessageSquare, 
  Sparkles, 
  AlertTriangle, 
  Volume2, 
  Dices,
  Crown
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';

export default function ChatDrawer({ 
  room, 
  socket, 
  player, 
  isDM 
}) {
  const [inputText, setInputText] = useState('');
  const [isNarrationMode, setIsNarrationMode] = useState(false);
  const messagesEndRef = useRef(null);

  const messages = room.chatHistory || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const senderName = player?.character?.name || (isDM ? 'Mestre da Mesa' : 'Aventureiro');
    const isNarrate = isDM && (isNarrationMode || inputText.startsWith('/narrar '));
    const content = inputText.startsWith('/narrar ') ? inputText.replace('/narrar ', '') : inputText;

    socket.emit('chat:send', {
      sender: senderName,
      senderType: isDM ? 'dm' : 'player',
      type: isNarrate ? 'narration' : 'chat',
      content: content.trim()
    });

    setInputText('');
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] bg-dnd-darker text-gray-200 p-4 flex flex-col justify-between max-w-4xl mx-auto select-none">
      
      {/* Chat Messages Feed */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-3">
        {messages.map((msg, index) => {
          const isSystem = msg.senderType === 'system';
          const isMsgDM = msg.senderType === 'dm';
          const isNarration = msg.type === 'narration';
          const isRoll = msg.type === 'roll';

          if (isNarration) {
            return (
              <div
                key={msg.id || index}
                className="bg-amber-950/40 border border-dnd-gold rounded-2xl p-4 text-center my-2 shadow-lg animate-fadeIn"
              >
                <div className="text-[10px] font-cinzel font-bold text-dnd-gold uppercase tracking-widest mb-1">
                  — Narração do Mestre —
                </div>
                <p className="font-serif italic text-sm text-amber-200 leading-relaxed">
                  "{msg.content}"
                </p>
              </div>
            );
          }

          if (isSystem) {
            return (
              <div
                key={msg.id || index}
                className="text-center text-xs font-mono text-gray-400 my-1 py-1 px-3 bg-dnd-panel/60 border border-dnd-border/50 rounded-lg max-w-lg mx-auto"
              >
                {msg.content}
              </div>
            );
          }

          return (
            <div
              key={msg.id || index}
              className={`flex flex-col text-xs rounded-2xl p-3 border shadow transition animate-fadeIn ${
                isMsgDM
                  ? 'bg-red-950/20 border-red-900/60'
                  : 'bg-dnd-panel border-dnd-border'
              }`}
            >
              {/* Message Header */}
              <div className="flex items-center justify-between pb-1.5 border-b border-dnd-border/40 mb-1.5">
                <div className="flex items-center space-x-1.5">
                  {isMsgDM && <Crown className="w-3.5 h-3.5 text-red-400" />}
                  <span className={`font-bold ${isMsgDM ? 'text-red-300' : 'text-dnd-gold'}`}>
                    {msg.sender}
                  </span>
                  {isMsgDM && (
                    <span className="text-[9px] bg-red-950 text-red-400 px-1.5 py-0.2 rounded font-bold uppercase border border-red-800">
                      DM
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-gray-500 font-mono">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {/* Message Body */}
              {isRoll && msg.rollData ? (
                <div className="space-y-1.5 mt-0.5">
                  <div className="text-gray-300">{msg.content}</div>
                  <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                    msg.rollData.isNat20
                      ? 'bg-amber-950/60 border-dnd-gold'
                      : msg.rollData.isNat1
                      ? 'bg-red-950/60 border-red-600'
                      : 'bg-dnd-darker border-dnd-border'
                  }`}>
                    <div className="flex items-center space-x-2">
                      <Dices className="w-4 h-4 text-dnd-gold" />
                      <div>
                        <div className="font-bold text-gray-200">{msg.rollData.title}</div>
                        {msg.rollData.rolls && (
                          <div className="text-[10px] text-gray-400 font-mono">
                            Dados: [{msg.rollData.rolls.join(', ')}]
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={`text-2xl font-cinzel font-black ${
                      msg.rollData.isNat20
                        ? 'text-amber-400 gold-glow'
                        : msg.rollData.isNat1
                        ? 'text-red-500'
                        : 'text-gray-100'
                    }`}>
                      {msg.rollData.total}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSend} className="bg-dnd-panel border border-dnd-border rounded-2xl p-2.5 shadow-xl flex items-center space-x-2">
        {isDM && (
          <button
            type="button"
            onClick={() => setIsNarrationMode(!isNarrationMode)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1 ${
              isNarrationMode ? 'bg-amber-500 text-black shadow' : 'bg-dnd-darker text-gray-400 hover:text-white'
            }`}
            title="Alternar Modo de Narração Fantástica"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Narrar</span>
          </button>
        )}

        <input
          type="text"
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          placeholder={isNarrationMode ? 'Descreva o que o grupo de aventureiros vê...' : 'Escreva uma mensagem ou use /narrar...'}
          className="flex-1 bg-dnd-darker border border-dnd-border rounded-xl px-4 py-2.5 text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-dnd-gold"
        />

        <button
          type="submit"
          disabled={!inputText.trim()}
          className={`p-2.5 rounded-xl transition ${
            inputText.trim()
              ? 'bg-dnd-gold hover:bg-amber-400 text-black shadow'
              : 'bg-gray-800 text-gray-600 cursor-not-allowed'
          }`}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
