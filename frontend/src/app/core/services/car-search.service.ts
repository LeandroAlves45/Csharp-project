import { Injectable, signal } from '@angular/core';

// Guarda as datas da pesquisa de carros enquanto a app está aberta.
// A página Carros é destruída quando se vai para "As minhas reservas"; os signals dela
// perdiam-se e, ao voltar, a lista aparecia sem filtro (com os carros já reservados).
// Um serviço providedIn: 'root' existe uma só vez na app, por isso sobrevive à mudança de página.
@Injectable({
  providedIn: 'root',
})
export class CarSearchService {
  readonly startDate = signal('');
  readonly endDate = signal('');

  clear() {
    this.startDate.set('');
    this.endDate.set('');
  }
}
