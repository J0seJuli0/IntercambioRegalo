"use client";

import { useState } from "react";
import { useFlow } from "@genkit-ai/next/client";
import { generateWishlist } from "@/ai/flows/generate-wishlist-from-description";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2 } from "lucide-react";
import type { Gift } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

type GenerateWishlistDialogProps = {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  onGenerated: (items: Omit<Gift, 'id' | 'isPurchased'>[]) => void;
};

export function GenerateWishlistDialog({ isOpen, setOpen, onGenerated }: GenerateWishlistDialogProps) {
  const [description, setDescription] = useState("");
  const { flow, running } = useFlow(generateWishlist);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!description) return;
    try {
      const result = await flow({ description });
      if (result?.wishlistItems) {
        onGenerated(result.wishlistItems);
        setOpen(false);
        setDescription("");
         toast({
          title: "¡Lista de deseos generada!",
          description: "Hemos añadido algunas ideas a tu lista.",
        });
      }
    } catch (error) {
      console.error("Failed to generate wishlist:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo generar la lista de deseos. Por favor, inténtalo de nuevo.",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="text-primary" />
            Generar Lista con IA
          </DialogTitle>
          <DialogDescription>
            Describe qué tipo de cosas te gustan y dejaremos que la IA te dé algunas ideas para tu lista de deseos.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid w-full gap-2">
            <Label htmlFor="description">Describe tus intereses</Label>
            <Textarea
              id="description"
              placeholder="Ej: Me encanta la jardinería, leer novelas de misterio y cocinar comida italiana."
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={running}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => setOpen(false)} disabled={running}>
            Cancelar
          </Button>
          <Button onClick={handleGenerate} disabled={!description || running}>
            {running ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            Generar Ideas
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
