import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'zylo-footer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  readonly year = 2026;
  readonly subscribed = signal(false);

  subscribe(email: string): void {
    if (email && email.includes('@')) {
      this.subscribed.set(true);
    }
  }
}
