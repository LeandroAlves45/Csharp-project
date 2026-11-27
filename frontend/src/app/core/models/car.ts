// Espelho do CarResponse da API (área do Rodrigo).
// Se o C# mudar, esta interface muda também, para o build apanhar as diferenças.

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
