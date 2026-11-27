import { Car } from '../models/car';

// Carros de exemplo (copiados do Data/SeedData.cs) usados só nos testes.
// A app real recebe os carros da API.
export const MOCK_CARS: Car[] = [
  {
    id: 1,
    brand: 'Toyota',
    model: 'Corolla',
    licensePlate: 'AA-00-BB',
    category: 'Economy',
    dailyPrice: 35,
    imageUrl: '',
  },
  {
    id: 2,
    brand: 'BMW',
    model: 'Serie 3',
    licensePlate: 'CC-11-DD',
    category: 'Premium',
    dailyPrice: 75,
    imageUrl: '',
  },
  {
    id: 3,
    brand: 'Volkswagen',
    model: 'Golf',
    licensePlate: 'EE-22-FF',
    category: 'Compact',
    dailyPrice: 45,
    imageUrl: '',
  },
  {
    id: 4,
    brand: 'Mercedes',
    model: 'Classe A',
    licensePlate: 'GG-33-HH',
    category: 'Premium',
    dailyPrice: 65,
    imageUrl: '',
  },
  {
    id: 5,
    brand: 'Renault',
    model: 'Clio',
    licensePlate: 'II-44-JJ',
    category: 'Economy',
    dailyPrice: 30,
    imageUrl: '',
  },
];
