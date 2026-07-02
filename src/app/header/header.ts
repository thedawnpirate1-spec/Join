import { Component, HostListener, signal, OnInit } from '@angular/core';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header implements OnInit {
  readonly showHelpButton = signal(true);
  isMenuOpen = false;

  constructor(private readonly router: Router) {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event) => {
      this.showHelpButton.set(event.urlAfterRedirects !== '/help');
    });
  }

  ngOnInit() {
    this.showHelpButton.set(this.router.url !== '/help');
  }

  toggleMenu(event: Event) {
    event.stopPropagation();
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  @HostListener('document:click')
  onDocumentClick() {
    this.closeMenu();
  }
}
