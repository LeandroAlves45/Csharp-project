import { CurrencyPipe } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { Car } from '../../core/models/car';

// A API guarda a categoria em inglês; o ecrã mostra-a em português
const CATEGORY_LABELS: Record<string, string> = {
  Economy: 'Económico',
  Compact: 'Compacto',
  Premium: 'Premium',
};

@Component({
  selector: 'app-car-card',
  imports: [CurrencyPipe],
  templateUrl: './car-card.html',
  styleUrl: './car-card.css',
})
export class CarCard {
  readonly car = input.required<Car>();

  // 0 = ainda não há datas válidas: o cartão só mostra o preço por dia
  readonly days = input(0);

  // Se aparecer uma categoria nova sem tradução, mostra a chave em vez de ficar vazio
  protected readonly categoryLabel = computed(
    () => CATEGORY_LABELS[this.car().category] ?? this.car().category,
  );

  // O cartão só avisa que clicaram em Reservar; quem abre a janela é a página,
  // porque é ela que sabe as datas e fala com o serviço
  readonly reserve = output<void>();

  // Só uma estimativa (R5): o preço final é sempre o que a API devolver ao reservar
  protected readonly estimate = computed(() => this.days() * this.car().dailyPrice);
}
