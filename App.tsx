
import React, { useState, useRef, useEffect } from 'react';
import { Message, Role } from './types';
import { sendMessageToTutor } from './services/geminiService';
import MathRenderer from './components/MathRenderer';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      parts: [{ text: "Hello! I'm Socratica. I'm here to help you master math. Upload a photo of a problem you're working on, or just type it out, and we'll walk through it together. What's on your mind today?" }],
      timestamp: Date.now()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async (customText?: string) => {
    const text = customText || inputText;
    if (!text.trim() && !selectedImage) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      parts: [
        { text: text || (selectedImage ? "I've uploaded an image of a problem. Can you help me with the first step?" : "") },
        ...(selectedImage ? [{ image: selectedImage }] : [])
      ],
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setSelectedImage(null);
    setIsLoading(true);

    try {
      const response = await sendMessageToTutor([...messages, userMessage], { thinkingBudget: 32768 });
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        parts: [{ text: response }],
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        parts: [{ text: "I'm sorry, I hit a snag while thinking. Could we try that step again?" }],
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const askWhy = () => {
    handleSend("Why did we do that? I want to understand the concept behind this step.");
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-white shadow-2xl overflow-hidden">
      {/* Header */}
      <header className="bg-indigo-600 p-4 flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-400 rounded-full flex items-center justify-center text-xl">
            🎓
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Socratica</h1>
            <p className="text-xs text-indigo-100 italic">Your Compassionate Math Mentor</p>
          </div>
        </div>
        <div className="flex gap-2">
           <span className="hidden sm:inline text-xs bg-indigo-500/50 px-2 py-1 rounded-full border border-indigo-400">Thinking Mode Active</span>
        </div>
      </header>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50"
      >
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-white text-slate-800 rounded-tl-none border border-slate-200'
            }`}>
              {msg.parts.map((part, idx) => (
                <div key={idx} className="space-y-3">
                  {part.image && (
                    <img 
                      src={part.image} 
                      alt="Uploaded math problem" 
                      className="rounded-lg max-w-full h-auto border border-white/20 mb-2"
                    />
                  )}
                  {part.text && (
                    <MathRenderer 
                      content={part.text} 
                      className={msg.role === 'user' ? 'text-white' : ''}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white text-slate-500 border border-slate-200 rounded-2xl rounded-tl-none p-4 shadow-sm flex items-center gap-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-150"></div>
              </div>
              <span className="text-sm italic">Socratica is thinking deeply...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-200">
        {selectedImage && (
          <div className="mb-3 relative inline-block">
            <img 
              src={selectedImage} 
              alt="Preview" 
              className="w-24 h-24 object-cover rounded-lg border-2 border-indigo-500 shadow-md"
            />
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
        
        <div className="flex flex-col gap-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button 
              onClick={askWhy}
              disabled={isLoading || messages.length < 2}
              className="whitespace-nowrap px-4 py-2 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-full border border-emerald-200 hover:bg-emerald-100 transition-colors disabled:opacity-50"
            >
              💡 Why did we do that?
            </button>
            <button 
              onClick={() => handleSend("I'm stuck, can you show me the next step?")}
              disabled={isLoading || messages.length < 2}
              className="whitespace-nowrap px-4 py-2 bg-amber-50 text-amber-700 text-sm font-medium rounded-full border border-amber-200 hover:bg-amber-100 transition-colors disabled:opacity-50"
            >
              🧭 Next step, please
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-3 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
              title="Upload photo"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              accept="image/*" 
              className="hidden" 
            />
            
            <div className="relative flex-1">
              <input 
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your math question..."
                className="w-full pl-4 pr-12 py-3 bg-slate-100 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
              />
              <button 
                onClick={() => handleSend()}
                disabled={isLoading || (!inputText.trim() && !selectedImage)}
                className="absolute right-2 top-1.5 p-1.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
