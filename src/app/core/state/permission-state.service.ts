import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface CriptonModuleDto {
  moduleId: number;
  moduleName: string;
  moduleIcon?: string | null;
  moduleRoute?: string | null; // "/admin" "/hrm" (recommended)
}

export interface CriptonSubMenuDto {
  subMenuId: number;
  subMenuName: string;
  route: string; // "/admin/company-setup" etc
}

export interface CriptonMenuDto {
  menuId: number;
  menuName: string;
  menuIcon?: string | null;
  subMenus: CriptonSubMenuDto[];
}

export interface PermissionPayloadDto {
  modules: CriptonModuleDto[];
  // moduleId -> menus array
  menusByModuleId: Record<number, CriptonMenuDto[]>;
}

const LS_PERMISSIONS = 'criptonerp.permissions.v1';
const LS_ACTIVE_MODULE = 'criptonerp.activeModuleId.v1';

@Injectable({ providedIn: 'root' })
export class PermissionStateService {
  private readonly modulesSubject = new BehaviorSubject<CriptonModuleDto[]>([]);
  private readonly menusByModuleIdSubject = new BehaviorSubject<Record<number, CriptonMenuDto[]>>({});
  private readonly activeModuleIdSubject = new BehaviorSubject<number | null>(null);

  modules$: Observable<CriptonModuleDto[]> = this.modulesSubject.asObservable();
  menusByModuleId$: Observable<Record<number, CriptonMenuDto[]>> = this.menusByModuleIdSubject.asObservable();
  activeModuleId$: Observable<number | null> = this.activeModuleIdSubject.asObservable();

  setPermissions(payload: PermissionPayloadDto): void {
    this.modulesSubject.next(payload?.modules ?? []);
    this.menusByModuleIdSubject.next(payload?.menusByModuleId ?? {});
    localStorage.setItem(LS_PERMISSIONS, JSON.stringify(payload));
  }

  restorePermissionsFromStorage(): boolean {
    const raw = localStorage.getItem(LS_PERMISSIONS);
    if (!raw) return false;

    try {
      const payload = JSON.parse(raw) as PermissionPayloadDto;
      this.modulesSubject.next(payload?.modules ?? []);
      this.menusByModuleIdSubject.next(payload?.menusByModuleId ?? {});
      return true;
    } catch {
      localStorage.removeItem(LS_PERMISSIONS);
      return false;
    }
  }

  setActiveModuleId(moduleId: number | null): void {
    this.activeModuleIdSubject.next(moduleId);
    if (moduleId === null) localStorage.removeItem(LS_ACTIVE_MODULE);
    else localStorage.setItem(LS_ACTIVE_MODULE, String(moduleId));
  }

  restoreActiveModuleIdFromStorage(): number | null {
    const raw = localStorage.getItem(LS_ACTIVE_MODULE);
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  }

  getModulesSnapshot(): CriptonModuleDto[] {
    return this.modulesSubject.value;
  }

  clearAll(): void {
    this.modulesSubject.next([]);
    this.menusByModuleIdSubject.next({});
    this.activeModuleIdSubject.next(null);
    localStorage.removeItem(LS_PERMISSIONS);
    localStorage.removeItem(LS_ACTIVE_MODULE);
  }
}
