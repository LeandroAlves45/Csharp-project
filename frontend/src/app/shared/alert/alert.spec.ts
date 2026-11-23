import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Alert, AlertType } from './alert';

describe('Alert', () => {
  // Cria o alerta como se fosse o pai a passar os inputs no HTML
  function render(type: AlertType, message: string, dismissible = true): ComponentFixture<Alert> {
    const fixture = TestBed.createComponent(Alert);
    fixture.componentRef.setInput('type', type);
    fixture.componentRef.setInput('message', message);
    fixture.componentRef.setInput('dismissible', dismissible);
    fixture.detectChanges();
    return fixture;
  }

  it('shows the message with the variant class', () => {
    const el: HTMLElement = render('success', 'Reserva criada.').nativeElement;

    expect(el.querySelector('.alert__message')?.textContent).toContain('Reserva criada.');
    expect(el.querySelector('.alert')?.classList).toContain('alert--success');
    expect(el.querySelector('.alert__label')?.textContent).toContain('Sucesso');
  });

  it('uses role alert for errors and role status for the others', () => {
    const error: HTMLElement = render('error', 'x').nativeElement;
    const warning: HTMLElement = render('warning', 'x').nativeElement;

    expect(error.querySelector('.alert')?.getAttribute('role')).toBe('alert');
    expect(warning.querySelector('.alert')?.getAttribute('role')).toBe('status');
  });

  it('emits closed when the close button is clicked', () => {
    const fixture = render('error', 'x');
    let closedCount = 0;
    fixture.componentInstance.closed.subscribe(() => closedCount++);

    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLButtonElement>('.alert__close')
      ?.click();

    expect(closedCount).toBe(1);
  });

  it('hides the close button when dismissible is false', () => {
    const el: HTMLElement = render('warning', 'x', false).nativeElement;

    expect(el.querySelector('.alert__close')).toBeNull();
  });
});
