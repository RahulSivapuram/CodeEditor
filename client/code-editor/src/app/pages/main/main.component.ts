import {
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
  input,
} from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { VideoContainerComponent } from '../video-container/video-container.component';
import { Judge0apiService } from '../../shared/services/judge0api.service';
import { CodeExecutionRequest } from '../../utils/models/codeexecutionrequest';
import { ToastrService } from 'ngx-toastr';
import { SocketService } from '../../shared/services/socket.service';
import { debounceTime } from 'rxjs/internal/operators/debounceTime';
import { DialogContentComponent } from '../../shared/components/dialog-content/dialog-content.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    RouterOutlet,
    ReactiveFormsModule,
    CommonModule,
    VideoContainerComponent,
    DialogContentComponent,
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css',
})
export class MainComponent {
  editorForm!: FormGroup;
  languages!: any[];
  lang_id!: number;
  source_code!: string;
  stdin!: string;
  userName!: string;
  @Input() room!: string;
  @ViewChild('toggle') toggle!: ElementRef;
  @ViewChild('outputArea') outputArea!: ElementRef;
  @ViewChild('editorArea') editorArea!: ElementRef;

  constructor(
    private zeroapi: Judge0apiService,
    private toaster: ToastrService,
    private socketService: SocketService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.initializeForm();
    this.route.params.subscribe((e: any) => {
      this.userName = e.name;
    });
    this.handleSocketEvents();
  }

  initializeForm() {
    this.editorForm = new FormGroup({
      code: new FormControl('', Validators.required),
      language: new FormControl(null),
      input: new FormControl(''),
    });
    this.languages = this.zeroapi.programmingLanguages;
  }

  setTheme() {
    let isChecked = this.toggle.nativeElement.checked;
    if (isChecked) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }

  submit() {
    var ele = document.getElementById('editor-area') as HTMLTextAreaElement;
    console.log(ele);

    this.source_code = btoa(this.editorForm.controls['code'].value);
    this.lang_id = Number(this.editorForm.controls['language'].value);
    this.stdin = btoa(this.editorForm.controls['input'].value);
    let data: CodeExecutionRequest = new CodeExecutionRequest(
      this.lang_id,
      this.source_code,
      this.stdin
    );
    console.log(data);
    this.zeroapi.runCode(data).subscribe((e: any) => {
      localStorage.setItem('token', e.token);
      this.output(e.token);
    });
  }

  output(tkn: string) {
    let area = this.outputArea.nativeElement;
    console.log(this.outputArea);
    this.zeroapi.getResult(tkn).subscribe((e: any) => {
      if (e.stderr) {
        area.innerHTML = atob(e.stderr);
        this.toaster.error('error');
      } else {
        console.log(atob(e.stdout));
        if (area) {
          area.innerHTML = '';
          area.innerHTML = `${atob(e.stdout)}`;
        }
        this.toaster.success('Code executed successfully');
      }
    });
  }

  leave() {
    console.log('disconnected');
    this.socketService.server.disconnect();
    this.authService.logout();
    this.router.navigate(['']);
  }

  handleSocketEvents() {
    this.socketService.server.on('textUpdate', (data: string) => {
      this.editorForm.patchValue({ code: data });
    });

    this.socketService.server.on('inputUpdate', (data: string) => {
      this.editorForm.patchValue({ input: data });
    });

    this.editorForm
      .get('code')!
      .valueChanges.pipe(debounceTime(1000))
      .subscribe((value) => {
        this.socketService.server.emit('textChange', value);
      });

    this.editorForm
      .get('input')!
      .valueChanges.pipe(debounceTime(1000))
      .subscribe((value) => {
        this.socketService.server.emit('inputChange', value);
      });
  }
}
