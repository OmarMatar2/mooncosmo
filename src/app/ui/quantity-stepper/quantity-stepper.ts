import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MAX_QUANTITY, MIN_QUANTITY } from '../../models/cart.model';

@Component({
  selector: 'quantity-stepper',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="stepper">
      <button
        type="button"
        class="stepper__btn"
        [disabled]="atMin()"
        [attr.aria-label]="'Decrease quantity of ' + label()"
        (click)="changed.emit(quantity() - 1)"
      >
        <span aria-hidden="true">−</span>
      </button>
      <output class="stepper__value" [attr.aria-label]="'Quantity of ' + label()">{{
        quantity()
      }}</output>
      <button
        type="button"
        class="stepper__btn"
        [disabled]="atMax()"
        [attr.aria-label]="'Increase quantity of ' + label()"
        (click)="changed.emit(quantity() + 1)"
      >
        <span aria-hidden="true">+</span>
      </button>
    </div>
  `,
  styleUrl: './quantity-stepper.scss',
})
export class QuantityStepper {
  readonly quantity = input.required<number>();
  readonly label = input('item');
  readonly changed = output<number>();

  protected readonly atMin = computed(() => this.quantity() <= MIN_QUANTITY);
  protected readonly atMax = computed(() => this.quantity() >= MAX_QUANTITY);
}
