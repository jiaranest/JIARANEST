import { ChangeDetectionStrategy, Component, HostListener, signal } from '@angular/core';

/**
 * Floating contact button — a fixed round FAB in the bottom corner that opens
 * an expandable panel with contact details + WhatsApp + Instagram links.
 * The icon toggles between "chat" and "close (✕)". Fully self-contained.
 */
@Component({
  selector: 'zylo-contact-fab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './contact-fab.component.html',
  styleUrl: './contact-fab.component.scss',
})
export class ContactFabComponent {
  readonly open = signal(false);

  readonly phone = '+91 70108 61547';
  readonly phoneHref = 'tel:+917010861547';
  readonly email = 'jiaranest@gmail.com';
  readonly emailHref = 'mailto:jiaranest@gmail.com';
  readonly whatsappHref = 'https://wa.me/c/917010861547';
  readonly instagramHref = 'https://www.instagram.com/jiaranest?igsh=emh0anBvbHhsb2l1';

  toggle(): void {
    this.open.update((v) => !v);
  }

  close(): void {
    this.open.set(false);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open()) this.close();
  }
}
