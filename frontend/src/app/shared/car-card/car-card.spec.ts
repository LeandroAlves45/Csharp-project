import { TestBed } from '@angular/core/testing';
import { MOCK_CARS } from '../../core/mocks/car.mock';
import { CarCard } from './car-card';

describe('CarCard', () => {
  function create(days: number) {
    const fixture = TestBed.createComponent(CarCard);
    fixture.componentRef.setInput('car', MOCK_CARS[0]);
    fixture.componentRef.setInput('days', days);
    fixture.detectChanges();
    return fixture;
  }

  it('disables Reservar while there are no valid dates', () => {
    const button: HTMLButtonElement = create(0).nativeElement.querySelector('button');
    expect(button.disabled).toBe(true);
  });

  it('emits reserve when Reservar is clicked', () => {
    const fixture = create(4);
    let reserved = false;
    fixture.componentInstance.reserve.subscribe(() => (reserved = true));

    fixture.nativeElement.querySelector('button').click();

    expect(reserved).toBe(true);
  });
});
