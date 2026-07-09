import { Component, ElementRef, HostListener, Input, OnInit, inject } from '@angular/core';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar implements OnInit {
  @Input() isLoggedIn: boolean = true;
  activeLink: string = 'Summary';
  private router = inject(Router);

  constructor(private elementRef: ElementRef) {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event) => {
      this.updateActiveLink(event.urlAfterRedirects);
    });
  }

  ngOnInit() {
    this.updateActiveLink(this.router.url);
  }

  updateActiveLink(url: string) {
    if (url.includes('/contacts')) {
      this.activeLink = 'Contacts';
    } else if (url.includes('/board')) {
      this.activeLink = 'Board';
    } else if (url === '/' || url.includes('/summary')) {
      this.activeLink = 'Summary';
    } else {
      this.activeLink = '';
    }
  }

  setActiveLink(link: string): void {
    this.activeLink = link;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.updateActiveLink(this.router.url);
    }
  }
}
