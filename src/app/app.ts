import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/header/header.component';
import { FooterComponent } from './shared/footer/footer.component';
import { ContactFabComponent } from './shared/contact-fab/contact-fab.component';
import { ScrollGuideBirdComponent } from './shared/scroll-guide-bird/scroll-guide-bird.component';
import { BottomNavComponent } from './shared/bottom-nav/bottom-nav.component';

@Component({
  selector: 'app-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    ContactFabComponent,
    ScrollGuideBirdComponent,
    BottomNavComponent,
  ],
  template: `
    <jiara-header />
    <main class="app-main">
      <router-outlet />
    </main>
    <jiara-footer />
    <jiara-contact-fab />
    <jiara-scroll-guide-bird />
    <jiara-bottom-nav />
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
      // On mobile, leave room so the fixed bottom nav never covers the footer
      // or page content (bar height ~56px + iOS safe-area).
      @media (max-width: 900px) {
        :host {
          padding-bottom: calc(56px + env(safe-area-inset-bottom, 0));
        }
      }
    `,
  ],
})
export class App {}
