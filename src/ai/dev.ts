'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-gift-ideas.ts';
import '@/ai/flows/assign-secret-santa.ts';
