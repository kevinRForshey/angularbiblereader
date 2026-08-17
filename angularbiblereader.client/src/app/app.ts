import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  imports: [RouterLink, RouterOutlet],
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('angularbiblereader.client');
  protected readonly auth = inject(AuthService);

  ngOnInit(): void {
    this.auth.loadSession().subscribe();
  }

  onLogout(): void {
    this.auth.logout().subscribe();
  }
}
