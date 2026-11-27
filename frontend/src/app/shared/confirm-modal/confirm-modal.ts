import { Component, ElementRef, afterNextRender, input, output, viewChild } from '@angular/core';
import { Alert } from '../alert/alert';

// Janela de confirmação genérica: o conteúdo (o resumo) vem do pai com <ng-content>.
// Assim a mesma janela serve para confirmar a reserva e o cancelamento.
@Component({
  selector: 'app-confirm-modal',
  imports: [Alert],
  templateUrl: './confirm-modal.html',
  styleUrl: './confirm-modal.css',
})
export class ConfirmModal {
  readonly title = input.required<string>();
  readonly confirmLabel = input('Confirmar');

  // O pai é que sabe se o pedido está a decorrer e se algo falhou: a janela só mostra.
  readonly loading = input(false);
  readonly errorMessage = input<string | null>(null);
  readonly confirmDisabled = input(false);

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  constructor() {
    // showModal() precisa do <dialog> já desenhado; afterNextRender corre logo a seguir.
    // O <dialog> nativo dá de graça: fundo escuro, foco preso dentro da janela e tecla Esc.
    afterNextRender(() => this.dialog().nativeElement.showModal());
  }
}
