import { registerLocaleData } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import localePt from '@angular/common/locales/pt-PT';
import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

// Regras de Portugal para números, moeda e datas: "140,00 €" em vez de "€140.00".
// Os dados vêm com o @angular/common (nenhum pacote novo).
registerLocaleData(localePt);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    // HttpClient para os serviços falarem com a API (usa o fetch do browser por omissão)
    provideHttpClient(),
    // Os pipes (currency, date) passam a usar pt-PT por omissão.
    { provide: LOCALE_ID, useValue: 'pt-PT' },
  ],
};
