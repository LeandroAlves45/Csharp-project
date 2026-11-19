// Espelho do Car que a API devolve HOJE.

export interface Car {
  id: number;
  brand: string;
  model: string;
  licensePlate: string;
  /** Chave em inglês (Economy, Compact, Premium); o ecrã traduz para português */
  category: string;
  /** decimal no C# chega como number no JSON */
  dailyPrice: number;
  imageUrl: string;
}
