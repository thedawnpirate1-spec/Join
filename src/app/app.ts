import { Component, ElementRef, signal, viewChild } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs';
import { Navbar } from './navbar/navbar';
import { Header } from './header/header';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Header, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('Join');
  private readonly mainContent = viewChild<ElementRef<HTMLElement>>('mainContent');

  constructor(router: Router) {
    router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.mainContent()?.nativeElement.scrollTo({ top: 0 });
    });
  }
}
