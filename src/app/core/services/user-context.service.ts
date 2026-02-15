import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserContext } from '../models/user-context.model';

@Injectable({ providedIn: 'root' })
export class UserContextService {
  private readonly subject = new BehaviorSubject<UserContext | null>(null);
  readonly userContext$: Observable<UserContext | null> = this.subject.asObservable();

  get snapshot(): UserContext | null {
    return this.subject.value;
  }

  setContext(ctx: UserContext): void {
    this.subject.next(ctx);
  }

  clear(): void {
    this.subject.next(null);
  }
}
