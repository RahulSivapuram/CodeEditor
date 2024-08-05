import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../shared/services/auth.service';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-authentication',
  standalone: true,
  imports: [
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    HeaderComponent,
    RouterModule,
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './authentication.component.html',
  styleUrl: './authentication.component.css',
})
export class AuthenticationComponent {
  authForm!: FormGroup;
  isLoginPage!: boolean;
  constructor(
    private activeRoute: Router,
    private authService: AuthService,
    private toast: ToastrService,
    private router: Router
  ) {}

  ngOnInit() {
    if (this.activeRoute.url == '/login') {
      this.isLoginPage = true;
    } else {
      this.isLoginPage = false;
    }
    this.initializeForm();
  }

  initializeForm() {
    this.authForm = new FormGroup({
      email: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required),
    });
  }

  submit() {
    if (this.authForm.valid) {
      if (this.isLoginPage) {
        console.log('login');
        this.loginUser();
      } else {
        console.log('register');
        this.registerUser();
      }
    }
  }

  loginUser() {
    this.authService
      .login(this.authForm.value.email, this.authForm.value.password)
      .subscribe((e: any) => {
        if (this.authService.isLoggedIn()) {
          this.toast.success('Logged In Successfully');
          this.router.navigate(['room']);
        }
      });
  }

  registerUser() {
    this.authService
      .register(this.authForm.value.email, this.authForm.value.password)
      .subscribe((e: any) => {
        this.toast.success(e.message);
        this.router.navigate(['login']);
      });
  }
}
