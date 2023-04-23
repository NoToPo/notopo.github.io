import { Injectable, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { UserRole } from '../constants/user-role';
import { HttpServerService } from './http-server.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private router: Router, private httpServer: HttpServerService) { }

  public setToken(token: string) {
    if (!token) {
      this.removeToken();
      return;
    }

    const jwtHelper = new JwtHelperService()
    const decodedToken = jwtHelper.decodeToken(token);
    let userRole = this.GetUserRole(decodedToken);

    localStorage.setItem('token', token);
    localStorage.setItem('userRole', userRole);

    const expirationDate = jwtHelper.getTokenExpirationDate(token);
    const isExpired = jwtHelper.isTokenExpired(token);
  }

  public removeToken() {
    localStorage.removeItem('token');
  }

  public removeUserRole() {
    localStorage.removeItem('userRole');
  }

  public getToken() {
    return localStorage.getItem('token');
  }

  public getUserRole() {
    return localStorage.getItem('userRole');
  }

  public isLoggedIn(): boolean {
    return this.getToken() !== null;
  }

  public logout() {
    this.removeToken();
    this.removeUserRole();
  }

  public login(username: string, password: string, backUrl: string): void {
    this.httpServer.Login(username, password).subscribe(data => {
      const token = data?.token;
      if (!!username && !!password && !!token) {
        this.setToken(token);
        this.router.navigate([backUrl]);
      } else {
        this.login(username, password, backUrl);
      }
    });
  }

  private GetUserRole(decodedToken: any): string {
    if (!decodedToken) {
      return '';
    }
    if (decodedToken.is_administrator) {
      return UserRole.ADMIN_ROLE;
    }
    else if (decodedToken.is_moderator) {
      return UserRole.MOD_ROLE;
    }
    return UserRole.USER_ROLE;
  }
}
