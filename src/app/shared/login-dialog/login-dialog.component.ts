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

  sendOtp(phone: string): void {
    if (!/^\d{10}$/.test(phone)) {
      this.error.set('Enter a valid 10-digit mobile number.');
      return;
    }
    this.error.set('');
    this.phone.set(phone);
    this.auth.requestOtp(phone);
    this.step.set('otp');
  }

  verify(code: string): void {
    const res = this.auth.verifyOtp(this.phone(), code);
    if (!res.ok) {
      this.error.set(res.message ?? 'Invalid code.');
      return;
    }
    this.ref.close(true);
  }

  google(): void {
    this.auth.loginWithGoogle();
    this.ref.close(true);
  }

  back(): void {
    this.error.set('');
    this.step.set('phone');
  }

  close(): void {
    this.ref.close(false);
  }
}
