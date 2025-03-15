import React, { useState, useRef, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { X, MessageSquare, Send, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useSession } from "@supabase/auth-helpers-react";
import Draggable from 'react-draggable';

interface Message {
  role: 'user' | 'assistant' | 'notification';
  content: string;
  discountCode?: string;
  discountPercentage?: number;
  expiryDate?: Date;
}

// Special deals that can be shown as notification messages
const specialDeals = [
  {
    content: "🌟 Weekend Special! 20% off all Lattes this weekend.",
    discountCode: "LATTE20",
    discountPercentage: 20,
    expiryDays: 3
  },
  {
    content: "☕ Morning Boost! 15% off any drink before 10am.",
    discountCode: "MORNING15",
    discountPercentage: 15,
    expiryDays: 5
  },
  {
    content: "🎉 Happy Hour! Buy one get one free on all Cold Brews from 2-4pm.",
    discountCode: "BOGO24",
    discountPercentage: 50,
    expiryDays: 2
  }
];

const VirtualBarista = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi there! I\'m your virtual barista. Ask me anything about our menu, or tell me what you\'re in the mood for. I can also offer personalized discounts based on your previous orders!' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCodes, setActiveCodes] = useState<{code: string, percentage: number, expiry: Date}[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const session = useSession();
  const [hasShownDeal, setHasShownDeal] = useState(false);
  
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const nodeRef = useRef(null);

  useEffect(() => {
    const savedPosition = localStorage.getItem('chatPosition');
    if (savedPosition) {
      try {
        setPosition(JSON.parse(savedPosition));
      } catch (e) {
        console.error('Error parsing saved position:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    const savedCodes = localStorage.getItem('activeCodes');
    if (savedCodes) {
      try {
        const parsedCodes = JSON.parse(savedCodes);
        const validCodes = parsedCodes.filter((code: {expiry: string}) => 
          new Date(code.expiry) > new Date()
        ).map((code: {expiry: string, code: string, percentage: number}) => ({
          ...code,
          expiry: new Date(code.expiry)
        }));
        setActiveCodes(validCodes);
      } catch (e) {
        console.error("Error parsing saved discount codes:", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('activeCodes', JSON.stringify(activeCodes.map(code => ({
      ...code,
      expiry: code.expiry.toISOString()
    }))));
  }, [activeCodes]);

  useEffect(() => {
    if (open && !hasShownDeal && messages.length <= 2 && Math.random() < 0.3) {
      setTimeout(() => {
        const randomDeal = specialDeals[Math.floor(Math.random() * specialDeals.length)];
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + randomDeal.expiryDays);
        
        setMessages(prev => [
          ...prev,
          { 
            role: 'notification', 
            content: randomDeal.content,
            discountCode: randomDeal.discountCode,
            discountPercentage: randomDeal.discountPercentage,
            expiryDate
          }
        ]);
        
        setActiveCodes(prev => [
          ...prev, 
          {
            code: randomDeal.discountCode,
            percentage: randomDeal.discountPercentage,
            expiry: expiryDate
          }
        ]);
        
        setHasShownDeal(true);
      }, 2000);
    }
  }, [open, hasShownDeal, messages.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const userId = session?.user?.id || null;
      
      const { data, error } = await supabase.functions.invoke('virtual-barista', {
        body: { 
          message: userMessage,
          userId: userId,
          activeCodes: activeCodes.map(code => ({
            code: code.code,
            percentage: code.percentage,
            expiry: code.expiry.toISOString()
          }))
        }
      });

      if (error) throw error;

      if (data?.reply) {
        const newMessage: Message = { role: 'assistant', content: data.reply };
        
        if (data.discountCode) {
          newMessage.discountCode = data.discountCode;
          newMessage.discountPercentage = data.discountPercentage;
          const expiryDate = new Date();
          expiryDate.setDate(expiryDate.getDate() + (data.expiryDays || 7));
          newMessage.expiryDate = expiryDate;
          
          setActiveCodes(prev => [
            ...prev, 
            {
              code: data.discountCode,
              percentage: data.discountPercentage,
              expiry: expiryDate
            }
          ]);
          
          toast.success(`New discount code added: ${data.discountCode}`);
        }
        
        setMessages(prev => [...prev, newMessage]);
      } else {
        throw new Error('No reply received');
      }
    } catch (error) {
      console.error('Error calling virtual-barista function:', error);
      toast.error('Sorry, I couldn\'t process your request. Please try again.');
      setMessages(prev => [
        ...prev, 
        { role: 'assistant', content: 'Sorry, I seem to be having technical difficulties. Please try again in a moment.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatExpiryDate = (date?: Date) => {
    if (!date) return '';
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }).format(date);
  };

  const copyDiscountCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Copied ${code} to clipboard!`);
  };

  const handleDragStop = (e: any, data: { x: number; y: number }) => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    const element = nodeRef.current as HTMLElement | null;
    if (!element) return;
    const elementWidth = element.offsetWidth;
    const elementHeight = element.offsetHeight;
    
    let x = data.x;
    let y = data.y;
    
    if (x < 0) x = 0;
    if (x + elementWidth > viewportWidth) x = viewportWidth - elementWidth;
    if (y < 0) y = 0;
    if (y + elementHeight > viewportHeight) y = viewportHeight - elementHeight;
    
    const newPosition = { x, y };
    setPosition(newPosition);
    localStorage.setItem('chatPosition', JSON.stringify(newPosition));
  };

  return (
    <>
      {!open && (
        <Button 
          className="fixed left-6 bottom-6 rounded-full shadow-lg w-14 h-14 p-0 flex items-center justify-center transition-transform duration-300 hover:scale-110"
          size="icon"
          variant="secondary"
          onClick={() => setOpen(true)}
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      )}

      {open && (
        <Draggable
          position={position}
          onStop={handleDragStop}
          bounds="body"
          nodeRef={nodeRef}
          handle=".drag-handle"
        >
          <div 
            ref={nodeRef}
            className="fixed z-50 shadow-lg"
            style={{ left: 0, top: 0, transform: `translate(${position.x}px, ${position.y}px)` }}
          >
            <AnimatePresence>
              <motion.div 
                className="w-[350px] h-[400px] flex flex-col bg-popover rounded-md border"
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
              >
                <div className="flex justify-between items-center px-4 py-2 border-b drag-handle cursor-move">
                  <div className="font-semibold">Brew Barn Barista</div>
                  <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  <AnimatePresence>
                    {messages.map((message, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`flex ${
                          message.role === 'user' 
                            ? 'justify-end' 
                            : message.role === 'notification' 
                              ? 'justify-center' 
                              : 'justify-start'
                        } mb-3`}
                      >
                        {message.role === 'notification' ? (
                          <Card className="bg-amber-100 border-amber-200 text-amber-800 w-full">
                            <CardContent className="p-3 text-sm">
                              <div className="flex items-start gap-2">
                                <Tag className="h-4 w-4 mt-0.5" />
                                <div>
                                  <p className="break-words">{message.content}</p>
                                  {message.discountCode && (
                                    <div className="mt-2">
                                      <div 
                                        className="bg-white border border-amber-300 rounded px-2 py-1 font-mono text-sm inline-flex gap-2 items-center cursor-pointer hover:bg-amber-50"
                                        onClick={() => message.discountCode && copyDiscountCode(message.discountCode)}
                                      >
                                        {message.discountCode}
                                      </div>
                                      <p className="text-xs mt-1">
                                        Valid until: {formatExpiryDate(message.expiryDate)}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ) : (
                          <Card className={`max-w-[75%] ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                            <CardContent className="p-2 text-sm">
                              <p className="break-words">{message.content}</p>
                              {message.discountCode && (
                                <div className="mt-2 p-2 bg-white rounded border border-gray-200">
                                  <div className="flex justify-between items-center">
                                    <span className="font-medium text-xs">DISCOUNT CODE:</span>
                                    <span className="text-xs">{message.discountPercentage}% OFF</span>
                                  </div>
                                  <div 
                                    className="bg-gray-100 border border-gray-300 rounded px-2 py-1 font-mono text-sm mt-1 text-center cursor-pointer hover:bg-gray-200"
                                    onClick={() => message.discountCode && copyDiscountCode(message.discountCode)}
                                  >
                                    {message.discountCode}
                                  </div>
                                  <p className="text-xs mt-1 text-gray-500">
                                    Valid until: {formatExpiryDate(message.expiryDate)}
                                  </p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {isLoading && (
                    <div className="flex justify-start mb-3">
                      <Card className="bg-muted max-w-[75%]">
                        <CardContent className="p-2">
                          <div className="flex space-x-2">
                            <div className="h-2 w-2 bg-foreground/30 rounded-full animate-bounce"></div>
                            <div className="h-2 w-2 bg-foreground/30 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            <div className="h-2 w-2 bg-foreground/30 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
                
                <form onSubmit={handleSubmit} className="p-3 border-t">
                  <div className="flex gap-2">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask about our menu..."
                      disabled={isLoading}
                      className="flex-1 text-sm"
                    />
                    <Button 
                      type="submit" 
                      size="icon" 
                      disabled={isLoading || !input.trim()}
                      className="transition-transform active:scale-95"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </motion.div>
            </AnimatePresence>
          </div>
        </Draggable>
      )}
    </>
  );
};

export default VirtualBarista;
