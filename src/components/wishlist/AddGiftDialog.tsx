"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import type { Gift } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";

const giftSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().min(1, "La descripción es requerida"),
  approximatePrice: z.string().optional(),
  link: z.string().url("Debe ser una URL válida").optional().or(z.literal('')),
});

type AddGiftDialogProps = {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  onSave: (gift: Gift) => void;
  gift: Gift | null;
};

export function AddGiftDialog({ isOpen, setOpen, onSave, gift }: AddGiftDialogProps) {
  const form = useForm<z.infer<typeof giftSchema>>({
    resolver: zodResolver(giftSchema),
    defaultValues: {
      name: "",
      description: "",
      approximatePrice: "",
      link: "",
    },
  });

  useEffect(() => {
    if (gift) {
      form.reset(gift);
    } else {
      form.reset({
        name: "",
        description: "",
        approximatePrice: "",
        link: "",
      });
    }
  }, [gift, form, isOpen]);


  const onSubmit = (values: z.infer<typeof giftSchema>) => {
    onSave({
      ...values,
      id: gift?.id || `new-${Date.now()}`,
      isPurchased: gift?.isPurchased || false,
    });
    setOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{gift ? 'Editar Regalo' : 'Añadir Regalo'}</DialogTitle>
          <DialogDescription>
            {gift ? 'Actualiza los detalles de tu regalo.' : 'Añade un nuevo regalo a tu lista de deseos.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
             <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Regalo</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Libro de cocina" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe el regalo que te gustaría..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="approximatePrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio Aproximado</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: $50" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="link"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Enlace (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://ejemplo.com/producto" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            <DialogFooter>
              <Button type="submit">Guardar Cambios</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
