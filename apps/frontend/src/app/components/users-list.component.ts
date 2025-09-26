import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService, User } from '../services/supabase.service';

@Component({
  selector: 'app-users-list',
  imports: [CommonModule],
  template: `
    <div class="users-container">
      <h2>Users List</h2>
      
      @if (loading()) {
        <p class="loading">Loading users...</p>
      } @else if (error()) {
        <p class="error">Error: {{ error() }}</p>
      } @else {
        <div class="users-grid">
          @for (user of users(); track user.id) {
            <div class="user-card">
              <h3>{{ user.name }}</h3>
              <p class="email">{{ user.email }}</p>
              <p class="date">Joined: {{ formatDate(user.created_at) }}</p>
            </div>
          } @empty {
            <p class="no-users">No users found</p>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .users-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    h2 {
      color: #333;
      margin-bottom: 20px;
      text-align: center;
    }

    .loading, .error, .no-users {
      text-align: center;
      padding: 20px;
      font-size: 16px;
    }

    .error {
      color: #e74c3c;
      background: #fdf2f2;
      border: 1px solid #e74c3c;
      border-radius: 4px;
    }

    .loading {
      color: #3498db;
    }

    .users-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }

    .user-card {
      background: white;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      transition: transform 0.2s ease;
    }

    .user-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }

    .user-card h3 {
      margin: 0 0 10px 0;
      color: #2c3e50;
      font-size: 18px;
    }

    .email {
      color: #7f8c8d;
      font-size: 14px;
      margin: 5px 0;
    }

    .date {
      color: #95a5a6;
      font-size: 12px;
      margin: 10px 0 0 0;
    }
  `]
})
export class UsersListComponent implements OnInit {
  private supabaseService = inject(SupabaseService);
  
  users = signal<User[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit() {
    this.loadUsers();
  }

  private loadUsers() {
    this.loading.set(true);
    this.error.set(null);
    
    this.supabaseService.getUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading users:', err);
        this.error.set('Failed to load users. Please try again.');
        this.loading.set(false);
      }
    });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
}