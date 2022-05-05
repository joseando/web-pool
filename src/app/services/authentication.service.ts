import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  private isUserAuthenticated = new Subject<boolean>()

  getAuthentication() {
    return this.isUserAuthenticated.asObservable()
  }

  changeAuthentication(value: boolean) {
    this.isUserAuthenticated.next(value)
  }

}
