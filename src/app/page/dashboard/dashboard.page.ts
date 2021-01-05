import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/service/auth.service';
import { TodoService } from 'src/app/service/todo.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {
  todos: Observable<string[]>;

  constructor(
    private authService: AuthService,
    private todoService: TodoService
  ) {}

  ngOnInit() {
    this.onGetTodos();
  }

  onGetTodos(): void {
    this.todos = this.todoService.fetchTodos();
  }

  onLogout(): void {
    this.authService.revokeAllTokens();
  }

  trackByItem(index: number, item: string): string {
    return item;
  }
}
