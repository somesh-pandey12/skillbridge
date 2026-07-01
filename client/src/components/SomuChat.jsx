import { useState, useRef, useEffect } from 'react';
import api from '../lib/api';

const SOMU_INTRO = {
  role: 'assistant',
  content: "Hi! I'm **Somu** 👋, your AI career assistant. I can help you with:\n\n• Resume tips & improvements\n• Company-specific interview prep\n• LeetCode topic recommendations\n• Skill gap analysis questions\n\nWhat would you like to know? 🚀"
};

export default function SomuChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([SOMU_INTRO]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await api.post('/chat/somu', {
        message: input,
        history: messages.slice(-6)
      });
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, I'm having trouble connecting. Please try again! 🔄"
      }]);
    } finally {
      setLoading(false);
    }
  };

  const formatMessage = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/•/g, '•')
      .replace(/\n/g, '<br/>');
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-violet-600 to-blue-600 rounded-full shadow-2xl shadow-violet-500/40 flex items-center justify-center hover:scale-110 transition-transform"
      >
        {open ? (
          <span className="text-white text-xl">✕</span>
        ) : (
          <span className="text-2xl">🤖</span>
        )}
      </button>

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-96 h-[520px] bg-[#0f0f1a] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-lg">
              🤖
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Somu</p>
              <p className="text-violet-200 text-xs">AI Career Assistant • Online</p>
            </div>
            <div className="ml-auto w-2 h-2 bg-green-400 rounded-full animate-pulse"/>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 bg-violet-600 rounded-full flex items-center justify-center text-sm mr-2 mt-1 flex-shrink-0">
                    🤖
                  </div>
                )}
                <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed
                  ${msg.role === 'user'
                    ? 'bg-violet-600 text-white rounded-br-sm'
                    : 'bg-white/8 text-gray-200 rounded-bl-sm border border-white/5'
                  }`}
                  dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                />
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="w-7 h-7 bg-violet-600 rounded-full flex items-center justify-center text-sm mr-2 flex-shrink-0">
                  🤖
                </div>
                <div className="bg-white/8 border border-white/5 px-4 py-3 rounded-2xl rounded-bl-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{animationDelay:'0ms'}}/>
                    <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{animationDelay:'150ms'}}/>
                    <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{animationDelay:'300ms'}}/>
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef}/>
          </div>

          {/* Quick Questions */}
          <div className="px-3 pb-2 flex gap-2 overflow-x-auto">
            {['Resume tips', 'Google prep', 'LeetCode topics'].map(q => (
              <button
                key={q}
                onClick={() => { setInput(q); }}
                className="whitespace-nowrap text-xs bg-violet-500/10 text-violet-400 border border-violet-500/20 px-3 py-1 rounded-full hover:bg-violet-500/20 transition flex-shrink-0"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-white/8 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Ask Somu anything..."
              className="flex-1 bg-white/5 border border-white/10 text-white placeholder-gray-600 px-3 py-2 rounded-xl text-sm focus:outline-none focus:border-violet-500 transition"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="w-9 h-9 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 rounded-xl flex items-center justify-center transition"
            >
              <span className="text-white text-sm">➤</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}