"use client";

import { useState } from "react";
import { runFlow } from "@genkit-ai/next/client";
import { suggestGiftIdeas } from "@/ai/flows/suggest-gift-ideas";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Sparkles, Loader2, Gift } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "../ui/scroll-area";

type AIGiftSuggesterProps = {
  wishlistItems: string[];
  userInterests: string;
};

export default function AIGiftSuggester({ wishlistItems, userInterests }: AIGiftSuggesterProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const { toast } = useToast();

  const handleSuggest = async () => {
    setRunning(true);
    setSuggestions([]);
    try {
      const result = await runFlow(suggestGiftIdeas, { wishlistItems, userInterests });
      if (result?.giftIdeas) {
        setSuggestions(result.giftIdeas);
      } else {
         setSuggestions([]);
         toast({
          variant: "default",
          title: "No se encontraron sugerencias",
          description: "La IA no pudo encontrar sugerencias. ¡Inténtalo de nuevo!",
        });
      }
    } catch (error) {
      console.error("Failed to suggest gifts:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron obtener sugerencias. Por favor, inténtalo de nuevo.",
      });
    } finally {
      setRunning(false);
    }
  };

  return (
    <Sheet onOpenChange={(open) => !open && setSuggestions([])}>
      <SheetTrigger asChild>
        <Button variant="outline" onClick={handleSuggest}>
           {running ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
          Sugerencias IA
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="text-primary" />
            Sugerencias de Regalos de IA
          </SheetTitle>
          <SheetDescription>
            Basado en la lista de deseos de esta persona, aquí tienes algunas ideas adicionales.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100%-8rem)]">
        <div className="py-4">
          {running && (
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Buscando ideas...</span>
            </div>
          )}
          {!running && suggestions.length > 0 && (
            <ul className="space-y-3">
              {suggestions.map((idea, index) => (
                <li key={index} className="flex gap-3 items-start">
                  <Gift className="h-5 w-5 mt-1 text-primary shrink-0" />
                  <span>{idea}</span>
                </li>
              ))}
            </ul>
          )}
          {!running && suggestions.length === 0 && (
            <div className="text-center text-muted-foreground pt-10">
                <p>La IA está lista para darte ideas de regalos.</p>
            </div>
          )}
        </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
