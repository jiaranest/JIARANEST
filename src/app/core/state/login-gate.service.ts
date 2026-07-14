import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom, of } from 'rxjs';
import { AuthService } from './auth.service';
import { LoginDialogComponent } from '../../shared/login-dialog/login-dialog.component';

/**
 * Central place for the "login only when needed" rule. Browsing and cart are
 * open; this is invoked at Buy Now / Proceed to Checkout.
 */
@Injectable({ providedIn: 'root' })
export class LoginGateService {
  private readonly dialog = inject(MatDialog);
  private readonly auth = inject(AuthService);

  /** Resolves true if the user is (or becomes) logged in. */
  async ensureLoggedIn(): Promise<boolean> {
    if (this.auth.isLoggedIn()) {
      return true;
    }
    const ref = this.dialog.open(LoginDialogComponent, {
      panelClass: ['zylo-dialog', 'zylo-dialog--sm'],
      autoFocus: false,
    });
    const result = await firstValueFrom(ref.afterClosed() ?? of(false));
    return result === true;
  }
}
