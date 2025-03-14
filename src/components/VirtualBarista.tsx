
import React, { useState, useRef, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { X, MessageSquare, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useSession } from "@supabase/auth-helpers-react";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const VirtualBarista = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi there! I\'m your virtual barista. Ask me anything about our menu, or tell me what you\'re in the mood for. I can also offer personalized discounts based on your previous orders!' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const session = useSession();

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

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
          userId: userId
        }
      });

      if (error) throw error;

      if (data?.reply) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
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

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          className="fixed left-6 bottom-6 rounded-full shadow-lg w-14 h-14 p-0 flex items-center justify-center transition-transform duration-300 hover:scale-110"
          size="icon"
          variant="secondary"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[350px] h-[400px] flex flex-col p-0 ml-6 mb-20 shadow-lg"
        side="top"
        align="start"
        sideOffset={16}
        alignOffset={-8}
        forceMount
      >
        <AnimatePresence>
          {open && (
            <motion.div 
              className="w-full h-full flex flex-col"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
            >
              <div className="flex justify-between items-center px-4 py-2 border-b">
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
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-3`}
                    >
                      <Card className={`max-w-[75%] ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                        <CardContent className="p-2 text-sm">
                          <p className="break-words">{message.content}</p>
                        </CardContent>
                      </Card>
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
          )}
        </AnimatePresence>
      </PopoverContent>
    </Popover>
  );
};

export default VirtualBarista;
