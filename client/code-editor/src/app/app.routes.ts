import { Routes } from '@angular/router';
import { MainComponent } from './pages/main/main.component';
import { AuthenticationComponent } from './pages/authentication/authentication.component';
import { RoomComponent } from './pages/room/room.component';
import { AuthguardService } from './core/guards/authguard.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: AuthenticationComponent },
  { path: 'signup', component: AuthenticationComponent },
  {
    path: 'home/:name',
    component: MainComponent,
    canActivate: [AuthguardService.canActivate],
  },
  {
    path: 'room',
    component: RoomComponent,
    canActivate: [AuthguardService.canActivate],
  },
];
