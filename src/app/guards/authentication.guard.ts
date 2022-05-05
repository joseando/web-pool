import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../services/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationGuard implements CanActivate {

  isAuthenticated: boolean

  constructor(
    private authSvc: AuthenticationService
  ) { }

  canActivate() {
    const isAuthenticated = localStorage.getItem('test')
    if (isAuthenticated) { return true }
    return false
  }
}
