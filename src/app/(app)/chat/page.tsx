'use client';
import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  collection,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { SendHorizonal, MessageSquare } from 'lucide-react';
import { useUser, useFirestore, useCollection, addDocumentNonBlocking } from '@/firebase';
import { useMemoFirebase } from '@/firebase/provider';
import type { ChatMessage, User } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

// Schema for the chat message form
const chatFormSchema = z.object({
  content: z.string().min(1, 'El mensaje no puede estar vacío.'),
});


// Component for an individual chat message
function ChatMessageItem({ message, isCurrentUser }: { message: ChatMessage, isCurrentUser: boolean }) {
  const alignment = isCurrentUser ? 'justify-end' : 'justify-start';
  const bubbleColor = isCurrentUser
    ? 'bg-primary text-primary-foreground'
    : 'bg-muted text-muted-foreground';
  
  const timestamp = message.timestamp?.toDate ? formatDistanceToNow(message.timestamp.toDate(), { addSuffix: true, locale: es }) : 'justo ahora';

  return (
    <div className={cn('flex items-end gap-2', alignment)}>
      {!isCurrentUser && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={message.senderProfilePictureUrl || `https://avatar.vercel.sh/${message.senderId}.png`} />
          <AvatarFallback>{message.senderName.charAt(0)}</AvatarFallback>
        </Avatar>
      )}
      <div className="flex flex-col">
        <div
          className={cn(
            'max-w-xs md:max-w-md rounded-lg px-3 py-2',
            bubbleColor,
             isCurrentUser ? 'rounded-br-none' : 'rounded-bl-none'
          )}
        >
          {!isCurrentUser && <p className="text-xs font-bold mb-1">{message.senderName}</p>}
          <p className="text-sm">{message.content}</p>
        </div>
        <p className={cn('text-xs text-muted-foreground mt-1', isCurrentUser ? 'text-right' : 'text-left')}>{timestamp}</p>
      </div>
       {isCurrentUser && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={message.senderProfilePictureUrl || `https://avatar.vercel.sh/${message.senderId}.png`} />
          <AvatarFallback>{message.senderName.charAt(0)}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}


export default function ChatPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const form = useForm<z.infer<typeof chatFormSchema>>({
    resolver: zodResolver(chatFormSchema),
    defaultValues: { content: '' },
  });

  const chatCollectionRef = useMemoFirebase(() => collection(firestore, 'chatMessages'), [firestore]);
  const chatQuery = useMemoFirebase(() => query(chatCollectionRef, orderBy('timestamp', 'asc')), [chatCollectionRef]);

  const { data: messages, isLoading } = useCollection<ChatMessage>(chatQuery);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const onSubmit = (values: z.infer<typeof chatFormSchema>) => {
    if (!user || !chatCollectionRef) return;
    
    addDocumentNonBlocking(chatCollectionRef, {
      senderId: user.uid,
      senderName: user.displayName || user.email,
      senderProfilePictureUrl: user.photoURL,
      content: values.content,
      timestamp: serverTimestamp(),
      recipientId: null, // This marks it as a group chat message
      giftExchangeId: 'global-chat' // A general identifier for the global chat
    });

    form.reset();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)]">
       <header className="p-4 border-b">
         <h2 className="text-xl font-bold tracking-tight font-headline flex items-center gap-2">
            <MessageSquare className="text-primary"/>
            Chat Grupal
        </h2>
       </header>
       <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="space-y-6">
           {isLoading && (
            <>
              <Skeleton className="h-16 w-3/4" />
              <Skeleton className="h-20 w-1/2 self-end" />
              <Skeleton className="h-12 w-2/3" />
            </>
           )}
          {!isLoading && messages && messages.length > 0 ? (
            messages.map(msg => (
              <ChatMessageItem
                key={msg.id}
                message={msg}
                isCurrentUser={msg.senderId === user?.uid}
              />
            ))
          ) : (
             !isLoading && <p className="text-center text-muted-foreground">Aún no hay mensajes. ¡Sé el primero en saludar!</p>
          )}
           <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="p-4 border-t bg-background">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center gap-2">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input placeholder="Escribe un mensaje..." autoComplete="off" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit" size="icon" disabled={form.formState.isSubmitting}>
              <SendHorizonal className="h-5 w-5" />
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
