import { CommonModule } from '@angular/common';
import { SocketService } from './../../shared/services/socket.service';
import { Component } from '@angular/core';

import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-room',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './room.component.html',
  styleUrl: './room.component.css',
})
export class RoomComponent {
  roomForm!: FormGroup;

  constructor(private socketService: SocketService, private router: Router) {
    this.initializeForm();
  }

  ngOnInit() {}

  initializeForm() {
    this.roomForm = new FormGroup({
      roomname: new FormControl(null, Validators.required),
      email: new FormControl(null, Validators.required),
    });
  }

  join() {
    if (this.roomForm.valid) {
      console.log(this.roomForm.value.email, this.roomForm.value.roomname);
      this.socketService.server.emit('join-user', this.roomForm.value.email);
      this.router.navigate(['/home', this.roomForm.value.email]);

      // this.socketService.server.emit(
      //   'join-user',
      //   this.roomForm.value.email,
      //   this.roomForm.value.roomname
      // );

      // this.socketService.server.on('join-status', (data) => {
      //   if (data) {
      //     console.log('User joined successfully');
      //     this.router.navigate(['/home', this.roomForm.value.email]);
      //   }
      // });
    }
  }

  handleSocketEvents() {
    this.socketService.server.on('permission-granted', (data) => {
      if (data) {
        console.log('granted');
        this.router.navigate(['/home', this.roomForm.value.email]);
      }
    });
  }
}
