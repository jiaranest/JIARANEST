import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/header/header.component';
import { FooterComponent } from './shared/footer/footer.component';
import { ContactFabComponent } from './shared/contact-fab/contact-fab.component';

@Component({
  selector: 'app-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, ContactFabComponent],
  template: `
    <zylo-header />
    <main class="app-main">
      <router-outlet />
    </main>
    <zylo-footer />
    <zylo-contact-fab />
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
      }
      .app-main {
        flex: 1;
      }
    `,
  ],
})
export class App {}
