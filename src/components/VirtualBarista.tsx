
import React, { useState, useRef, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerClose } from "@/components/ui/drawer";
import { X, Coffee, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const VirtualBarista = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi there! I\'m your virtual barista. Ask me anything about our menu or coffee recommendations!' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      const { data, error } = await supabase.functions.invoke('virtual-barista', {
        body: { message: userMessage }
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
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button 
          className="fixed right-6 bottom-6 rounded-full shadow-lg w-14 h-14 p-0 flex items-center justify-center"
          size="icon"
        >
          <Coffee className="h-6 w-6" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-[85vh] flex flex-col">
        <div className="flex justify-between items-center px-4 py-2">
          <DrawerHeader className="p-0">
            <DrawerTitle>Brew Barn Barista</DrawerTitle>
          </DrawerHeader>
          <DrawerClose asChild>
            <Button variant="ghost" size="icon">
              <X className="h-4 w-4" />
            </Button>
          </DrawerClose>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
              >
                <Card className={`max-w-[80%] ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  <CardContent className="p-3">
                    <p className="break-words">{message.content}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <div className="flex justify-start mb-4">
              <Card className="bg-muted max-w-[80%]">
                <CardContent className="p-3">
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
        
        <form onSubmit={handleSubmit} className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about our menu..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={isLoading || !input.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </DrawerContent>
    </Drawer>
  );
};

export default VirtualBarista;
