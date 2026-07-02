import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Mainside } from './mainside/mainside';
import { Navbar} from './navbar/navbar';
import { Header } from './header/header';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Mainside, Navbar, Header],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('Join');
}
