import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { User } from 'src/app/interface/user';
import { AuthService } from 'src/app/service/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {
  userName: string;
  subscription: Subscription;
  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.subscription = this.authService.userInfo.subscribe(
      (response: User) => {
        console.log(`this is response -> ${JSON.stringify(response)}`);
        if (response) {
          this.userName = response.username;
        }
      }
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
