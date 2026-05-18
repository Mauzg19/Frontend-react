import React, { useState, useRef, useEffect } from 'react';
import { API_URL } from '../config/api';

const REPORT_LINK_REGEX = /GET\s+\/api\/reports\/([a-zA-Z0-9_-]+\.(?:csv|txt))/gi;

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      role: 'bot', 
      text: '¡Hola! Soy tu asistente IA. Puedo ayudarte con preguntas sobre nuestro restaurante, menú, la aplicación web y tus pedidos. ¿En qué puedo ayudarte?' 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleChat = () => setIsOpen(!isOpen);

  const getJwt = () => {
    try {
      const stored = localStorage.getItem('jwt');
      if (stored) return stored;
    } catch (_) {}
    return null;
  };

  const makeDownloadLink = (text, reportMatches) => {
    let links = [];
    for (const match of reportMatches) {
      if (match && match[1]) {
        links.push({ filename: match[1], url: `/api/reports/${match[1]}` });
      }
    }
    // deduplicate
    links = links.filter((v, i, a) => a.findIndex(l => l.filename === v.filename) === i);
    return links;
  };

  const sendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setIsLoading(true);

    const jwt = getJwt();
    const headers = { 'Content-Type': 'application/json' };
    if (jwt) {
      headers['Authorization'] = `Bearer ${jwt}`;
    }

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessages((prev) => [
          ...prev,
          { 
            role: 'bot', 
            text: data.error || 'Lo siento, hubo un error al procesar tu pregunta. Por favor, intenta de nuevo.',
            isError: true 
          }
        ]);
        return;
      }

      const botText = data.response || 'No se pudo generar una respuesta válida.';
      const reportMatches = [...botText.matchAll(REPORT_LINK_REGEX)];

      setMessages((prev) => [
        ...prev,
        { 
          role: 'bot', 
          text: botText,
          isError: false,
          downloadLinks: reportMatches.length > 0
            ? makeDownloadLink(botText, reportMatches) : undefined
        }
      ]);
    } catch (error) {
       console.error("Error calling AI: ", error);
       setMessages((prev) => [
        ...prev,
        { 
          role: 'bot', 
          text: 'Hubo un error de conexión. Asegúrate de que el servidor backend esté activo.',
          isError: true 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (url, filename) => {
    try {
      const jwt = getJwt();
      const headers = {};
      if (jwt) headers['Authorization'] = `Bearer ${jwt}`;
      const fullUrl = url.startsWith('http') ? url : `${API_URL}${url}`;
      const res = await fetch(fullUrl, { headers });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Download error:', err);
      alert('Error al descargar el reporte.');
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center transition-transform transform hover:scale-110 shadow-[0_0_15px_rgba(249,115,22,0.5)]"
          title="Abre el asistente IA del restaurante"
          style={{ width: '64px', height: '64px' }}
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
          </svg>
        </button>
      )}

      {isOpen && (
        <div 
          className="bg-[#1e1e1e] rounded-2xl shadow-2xl w-[350px] sm:w-[400px] overflow-hidden flex flex-col border border-gray-800 transition-all duration-300" 
          style={{ height: '550px', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}
        >
          <div className="bg-orange-500 text-white p-4 flex justify-between items-center shadow-md">
            <div className="flex items-center gap-3">
               <div className="relative">
                 <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                    <span className="text-2xl">🤖</span>
                 </div>
                 <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-orange-500 rounded-full"></div>
               </div>
               <div>
                 <h3 className="font-bold text-lg leading-tight">Asistente del Restaurante</h3>
                 <span className="text-xs text-orange-100 italic">Conocimiento especializado</span>
               </div>
            </div>
            <button 
              onClick={toggleChat} 
              className="text-orange-100 hover:text-white transition-colors bg-orange-600/50 hover:bg-orange-600 rounded-full p-2"
              title="Cierra el chat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto bg-[#121212] flex flex-col gap-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                <div className={`max-w-[85%] p-3.5 rounded-2xl shadow-md ${
                  msg.role === 'user' 
                    ? 'bg-orange-500 text-white rounded-tr-sm' 
                    : msg.isError
                    ? 'bg-red-900/30 border border-red-500/50 text-red-100 rounded-tl-sm'
                    : 'bg-[#2a2a2a] text-gray-200 border-none rounded-tl-sm'
                }`}>
                  {msg.text}
                  {msg.downloadLinks && msg.downloadLinks.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {msg.downloadLinks.map((link, i) => (
                        <button
                          key={i}
                          onClick={() => handleDownload(link.url, link.filename)}
                          className="text-xs bg-orange-600 hover:bg-orange-700 text-white px-3 py-1.5 rounded-full transition-colors flex items-center gap-1"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                          </svg>
                          {link.filename}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[#2a2a2a] text-gray-400 rounded-2xl rounded-tl-sm p-4 shadow-md flex gap-2 items-center">
                  <div className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                  <div className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                  <div className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 bg-[#1e1e1e] border-t border-gray-800">
            <form onSubmit={sendMessage} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Pregunta sobre el restaurante..."
                className="flex-1 bg-[#2a2a2a] rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-200 placeholder-gray-500 transition-shadow"
                disabled={isLoading}
              />
              <button 
                type="submit" 
                disabled={isLoading || !input.trim()}
                className={`rounded-full w-12 h-12 flex flex-shrink-0 items-center justify-center transition-all ${isLoading || !input.trim() ? 'bg-[#333333] text-gray-500 cursor-not-allowed' : 'bg-orange-500 text-white hover:bg-orange-600 hover:scale-105 shadow-md'}`}
                title="Envía tu pregunta"
              >
                <svg className="w-5 h-5 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatbotWidget;