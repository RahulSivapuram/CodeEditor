import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SocketService } from '../../services/socket.service';

@Component({
  selector: 'app-dialog-content',
  standalone: true,
  imports: [],
  templateUrl: './dialog-content.component.html',
  styleUrl: './dialog-content.component.css',
})
export class DialogContentComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private socketService: SocketService
  ) {}

  accept() {
    console.log('clicked');
    // this.socketService.server.emit('accept-permission', this.data);
  }
}
