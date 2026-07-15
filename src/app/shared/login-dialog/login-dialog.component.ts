import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { AuthService } from '../../core/state/auth.service';

@Component({
  selector: 'jiara-login-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule],
  templateUrl: './login-dialog.component.html',
  styleUrl: './login-dialog.component.scss',
})
export class LoginDialogComponent {
  private readonly auth = inject(AuthService);
  private readonly ref = inject(MatDialogRef<LoginDialogComponent, boolean>);

  readonly step = signal<'email' | 'otp'>('email');
  readonly email = signal('');
  readonly error = signal('');
  /** True while an auth request is in flight — disables buttons / shows "…". */
  readonly busy = signal(false);

  sendOtp(email: string): void {
    if (this.busy()) return;
    const addr = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addr)) {
      this.error.set('Enter a valid email address.');
      return;
    }
    this.error.set('');
    this.email.set(addr);
    this.busy.set(true);
    this.auth.requestOtp(addr).subscribe((res) => {
      this.busy.set(false);
      if (!res.ok) {
        this.error.set(res.message ?? 'Could not send the code. Try again.');
        return;
      }
      this.step.set('otp');
    });
  }

  verify(code: string): void {
    if (this.busy()) return;
    this.error.set('');
    this.busy.set(true);
    this.auth.verifyOtp(this.email(), code).subscribe((res) => {
      this.busy.set(false);
      if (!res.ok) {
        this.error.set(res.message ?? 'Invalid code.');
        return;
      }
      this.ref.close(true);
    });
  }

  google(): void {
    if (this.busy()) return;
    this.busy.set(true);
    this.auth.loginWithGoogle().subscribe((res) => {
      this.busy.set(false);
      if (!res.ok) {
        this.error.set(res.message ?? 'Google sign-in failed.');
        return;
      }
      this.ref.close(true);
    });
  }

  back(): void {
    this.error.set('');
    this.step.set('email');
  }

  close(): void {
    this.ref.close(false);
  }
}
