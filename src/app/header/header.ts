import { Component, HostListener, signal, OnInit, inject } from '@angular/core';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../core/services/auth-service';

/** Component representing the application header. */
@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header implements OnInit {
  readonly showHelpButton = signal(true);
  isMenuOpen = false;
  authService = inject(AuthService);

  constructor(private readonly router: Router) {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.showHelpButton.set(event.urlAfterRedirects !== '/help');
      });
  }

  ngOnInit() {
    this.showHelpButton.set(this.router.url !== '/help');
  }

  /** Toggles the user profile menu. */
  toggleMenu(event: Event) {
    event.stopPropagation();
    this.isMenuOpen = !this.isMenuOpen;
  }

  /** Closes the user profile menu. */
  closeMenu() {
    this.isMenuOpen = false;
  }

  async logout(): Promise<void> {
    this.closeMenu();
    await this.authService.logout();
    await this.router.navigateByUrl('/login');
  }

  /** Closes the user profile menu on outside clicks. */
  @HostListener('document:click')
  onDocumentClick() {
    this.closeMenu();
  }
}
