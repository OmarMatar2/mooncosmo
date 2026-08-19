import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FloatingCartButton } from './components/floating-cart-button/floating-cart-button';
import { WholesaleBar } from './components/wholesale-bar/wholesale-bar';
import { ToastHost } from './ui/toast-host/toast-host';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, FloatingCartButton, ToastHost, WholesaleBar],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
