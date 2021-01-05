import { Component, OnDestroy, OnInit } from '@angular/core';
import { Credential } from 'src/app/interface/credential';
import { AuthService } from 'src/app/service/auth.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit, OnDestroy {
  credentials: Credential = { email: '', password: '' };
  subscription: Subscription;
  errorMessage: string;
  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onLogin(): void {
    this.subscription = this.authService
      .authenticate(this.credentials)
      .subscribe(
        (isSuccess: boolean) => {
          // console.log(response);
          if (isSuccess) {
            this.router.navigateByUrl('/home');
            console.log('Success');
          } else {
            console.log('Kindly insert the credentials');
            this.errorMessage = 'Kindly insert the credentials';
          }
        },
        error => {
          console.log(`error ${JSON.stringify(error)}`);
          this.errorMessage = 'Invalid username or password';
        }
      );
  }
}
