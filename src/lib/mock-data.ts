import type { User, Gift, SecretSantaAssignment } from './types';

export const users: User[] = [
  { id: '1', name: 'Ana', email: 'ana@example.com' },
  { id: '2', name: 'Ben', email: 'ben@example.com' },
  { id: '3', name: 'Carla', email: 'carla@example.com' },
  { id: '4', name: 'David', email: 'david@example.com' },
  { id: '5', name: 'Elena', email: 'elena@example.com' },
];

export const wishlists: Record<string, Gift[]> = {
  '1': [
    { id: 'g1', name: 'Libro de Ciencia Ficción', description: 'Último libro de mi autor favorito, Brandon Sanderson.', approximatePrice: '$20', isPurchased: false, image: 'gift-book' },
    { id: 'g2', name: 'Auriculares Inalámbricos', description: 'Con cancelación de ruido, para concentrarme.', approximatePrice: '$150', isPurchased: true, image: 'gift-headphones' },
    { id: 'g3', name: 'Suscripción a café', description: 'Café de especialidad entregado mensualmente.', approximatePrice: '$30/mes', isPurchased: false, image: 'gift-coffee' },
  ],
  '2': [
    { id: 'g4', name: 'Set de LEGO', description: 'El nuevo set de Star Wars: The Mandalorian.', approximatePrice: '$100', isPurchased: false, image: 'gift-lego' },
    { id: 'g5', name: 'Zapatillas de Correr', description: 'Para entrenamiento de maratón, marca Hoka.', approximatePrice: '$120', isPurchased: false, image: 'gift-shoes' },
  ],
  '3': [
    { id: 'g6', name: 'Clases de Cerámica', description: 'Un curso de iniciación para aprender a tornear.', approximatePrice: '$200', isPurchased: false, image: 'gift-pottery' },
    { id: 'g7', name: 'Planta de Interior', description: 'Una monstera grande para mi sala de estar.', approximatePrice: '$50', isPurchased: false, image: 'gift-plant' },
  ],
  '4': [
    { id: 'g8', name: 'Teclado Mecánico', description: 'Con interruptores silenciosos para la oficina.', approximatePrice: '$90', isPurchased: false, image: 'gift-keyboard' },
  ],
  '5': [],
};

export const assignments: SecretSantaAssignment[] = [
  { giverId: '1', receiverId: '3' }, // Ana gives to Carla
  { giverId: '2', receiverId: '1' }, // Ben gives to Ana
  { giverId: '3', receiverId: '4' }, // Carla gives to David
  { giverId: '4', receiverId: '5' }, // David gives to Elena
  { giverId: '5', receiverId: '2' }, // Elena gives to Ben
];

// Assume current logged in user is Ana
export const currentUserId = '1';

// Mock functions to simulate database access
export const getUserById = (id: string) => users.find(u => u.id === id);
export const getWishlistByUserId = (id: string) => wishlists[id] || [];
export const getAssignmentForGiver = (id: string) => assignments.find(a => a.giverId === id);
