'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/lib/i18n';

export default function JarvisWidget() {
    const { lang } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ role: 'bot' | 'user'; text: string }[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Initial greeting
    useEffect(() => {
        const greeting = lang === 'tr' 
            ? 'Merhaba, ben J.A.R.V.I.S. VANT Art Protokolü hakkında sormak istediğiniz bir şey var mı?'
            : 'Hello, I am J.A.R.V.I.S. Do you have any questions about the VANT Art Protocol?';
        
        if (messages.length === 0) {
            setMessages([{ role: 'bot', text: greeting }]);
        }
    }, [lang]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = input.trim();
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setInput('');
        setIsTyping(true);

        try {
            // This would normally call an API endpoint that talks to our bot's logic
            // For now, we simulate a response or call the chatbot_api if available
            // Since we are in the development environment, we'll implement a simple response logic
            // or a fetch to the local/deployed bot API if configured.
            
            // Simulating API delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            const botResponse = lang === 'tr'
                ? "Harika bir soru. VANT koleksiyonları sınırlı üretimdir ve her parça bir 'Protokol'ün parçasıdır. Size özel stil önerileri sunabilirim."
                : "Great question. VANT collections are limited editions and each piece is part of a 'Protocol'. I can offer personalized style suggestions.";
                
            setMessages(prev => [...prev, { role: 'bot', text: botResponse }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'bot', text: 'Error connecting to J.A.R.V.I.S.' }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[100] font-body">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="mb-4 w-[320px] sm:w-[380px] h-[500px] bg-vant-black border border-vant-purple/30 rounded-lg shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl bg-opacity-95"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-vant-purple/20 bg-vant-purple/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-vant-purple animate-pulse" />
                                <span className="font-heading uppercase tracking-widest text-xs text-vant-light">J.A.R.V.I.S. Core</span>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-vant-muted hover:text-vant-light transition-colors">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                            </button>
                        </div>

                        {/* Messages */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] p-3 text-sm ${
                                        msg.role === 'user' 
                                            ? 'bg-vant-purple text-white rounded-l-lg rounded-tr-lg' 
                                            : 'bg-vant-gray text-vant-light/90 border border-vant-light/10 rounded-r-lg rounded-tl-lg'
                                    }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-vant-gray text-vant-muted p-3 rounded-r-lg rounded-tl-lg text-xs animate-pulse">
                                        Processing...
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-vant-purple/20">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder={lang === 'tr' ? 'Mesaj yazın...' : 'Type a message...'}
                                    className="w-full bg-vant-gray border border-vant-purple/20 rounded-md px-4 py-2.5 text-sm text-vant-light focus:outline-none focus:border-vant-purple transition-colors pr-10"
                                />
                                <button 
                                    onClick={handleSend}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-vant-purple hover:text-vant-purple-light transition-colors"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="w-14 h-14 bg-vant-black border-2 border-vant-purple rounded-full flex items-center justify-center text-vant-purple shadow-lg hover:bg-vant-purple hover:text-white transition-all duration-300 relative overflow-hidden group"
            >
                <div className="absolute inset-0 bg-vant-purple/10 group-hover:bg-transparent" />
                {!isOpen ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                )}
            </motion.button>
        </div>
    );
}
