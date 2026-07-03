import { Component, ElementRef, HostListener, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  @Input() isLoggedIn: boolean = true;
  activeLink: string = 'Summary';

  constructor(private elementRef: ElementRef) {}

  setActiveLink(link: string): void {
    this.activeLink = link;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.activeLink = '';
    }
  }
}
