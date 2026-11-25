import { TestBed } from '@angular/core/testing';
import { ConfirmModal } from './confirm-modal';

describe('ConfirmModal', () => {
  function create(loading = false) {
    const fixture = TestBed.createComponent(ConfirmModal);
    fixture.componentRef.setInput('title', 'Confirmar reserva');
    fixture.componentRef.setInput('loading', loading);
    fixture.detectChanges();
    return fixture;
  }

  it('emits confirmed when the confirm button is clicked', () => {
    const fixture = create();
    let confirmed = false;
    fixture.componentInstance.confirmed.subscribe(() => (confirmed = true));

    const buttons = fixture.nativeElement.querySelectorAll('button');
    buttons[1].click();

    expect(confirmed).toBe(true);
  });

  it('disables both buttons while the request is running', () => {
    const fixture = create(true);
    const buttons: HTMLButtonElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('button'),
    );

    expect(buttons.every((b) => b.disabled)).toBe(true);
  });
});
