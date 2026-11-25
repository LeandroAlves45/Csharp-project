import { Component, computed, input, output } from '@angular/core';

// Tipo com só 3 valores possíveis: o build falha se alguém escrever type="sucess"
export type AlertType = 'success' | 'error' | 'warning';

// Texto do ecrã em português; o código (as chaves) fica em inglês
const LABELS: Record<AlertType, string> = {
  success: 'Sucesso',
  error: 'Erro',
  warning: 'Aviso',
};

@Component({
  selector: 'app-alert',
  templateUrl: './alert.html',
  styleUrl: './alert.css',
})
export class Alert {
  // input(): o pai passa o valor no HTML (<app-alert type="success" ...>).
  // É um signal, por isso lê-se como função: type()
  readonly type = input<AlertType>('error');

  // required: um alerta sem mensagem não faz sentido; se o pai se esquecer, o build falha.
  readonly message = input.required<string>();

  // Por omissão pode fechar-se; o pai passa false quando a mensagem tem de ficar visível
  readonly dismissible = input(true);

  // output(): o alerta só avisa que clicaram no X. Quem esconde é o pai,
  // porque é o pai que guarda a mensagem (o estado fica num só sítio)
  readonly closed = output<void>();

  protected readonly label = computed(() => LABELS[this.type()]);

  // Leitores de ecrã: "alert" interrompe e lê logo (erros);
  // "status" espera por uma pausa (sucesso e avisos não são urgentes)
  protected readonly role = computed(() => (this.type() === 'error' ? 'alert' : 'status'));
}
