import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UsersListComponent } from './components/users-list.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, UsersListComponent],
  template: `
    <header>
      <h1>{{ title() }} - Supabase Demo</h1>
    </header>
    
    <main>
      <app-users-list />
    </main>

    <router-outlet />
  `,
  styles: [`
    header {
      background: #2c3e50;
      color: white;
      padding: 20px;
      text-align: center;
      margin-bottom: 20px;
    }

    header h1 {
      margin: 0;
      font-size: 24px;
    }

    main {
      min-height: calc(100vh - 100px);
    }
  `],
})
export class App {
  protected readonly title = signal('Angular');
}
