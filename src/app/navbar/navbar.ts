import { Component, ElementRef, HostListener } from '@angular/core';

@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
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
