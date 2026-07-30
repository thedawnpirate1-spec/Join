import { Component, ElementRef, signal, viewChild } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { filter } from 'rxjs';
import { Navbar } from './navbar/navbar';
import { Header } from './header/header';
import { Toast } from './shared/toast/toast';

/** Root shell: hosts the routed page plus the navbar/header/toast chrome around it. */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Header, CommonModule, Toast, CdkScrollable],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('Join');
  private readonly mainContent = viewChild<ElementRef<HTMLElement>>('mainContent');

  constructor(public router: Router) {
    router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.mainContent()?.nativeElement.scrollTo({ top: 0 });
    });
  }

  /** Whether the current route is login/signup, which hide the navbar/header chrome. */
  get isAuthPage(): boolean {
    return this.router.url === '/login' || this.router.url === '/signup';
  }
}
