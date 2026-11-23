// Espelho do Car combinado com o Rodrigo. Atenção: a API (20/11) ainda devolve "image";
// enquanto não mudar para "imageUrl", o frontend usa dados mock nos carros.

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
