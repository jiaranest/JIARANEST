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

  readonly step = signal<'phone' | 'otp'>('phone');
  readonly phone = signal('');
  readonly error = signal('');
  /** True while an auth request is in flight — disables buttons / shows "…". */
  readonly busy = signal(false);

  sendOtp(phone: string): void {
    if (this.busy()) return;
    if (!/^\d{10}$/.test(phone)) {
      this.error.set('Enter a valid 10-digit mobile number.');
      return;
    }
    this.error.set('');
    this.phone.set(phone);
    this.busy.set(true);
    this.auth.requestOtp(phone).subscribe((res) => {
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
    this.auth.verifyOtp(this.phone(), code).subscribe((res) => {
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
    this.step.set('phone');
  }

  close(): void {
    this.ref.close(false);
  }
}
