import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, of, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResult } from '../models/api-result.model';
import { ErpModule, MenuTreeNode } from '../models/navigation.models';
import { ActiveModule } from '../models/active-module.model';
import { TokenStorageService } from './token-storage.service';

@Injectable({ providedIn: 'root' })
export class NavigationService {
  private readonly api = (environment.apiBaseUrl || '').replace(/\/+$/, '');

  private readonly modulesUrl = `${this.api}/api/administration/navigation/modules`;
  private readonly treeUrl = `${this.api}/api/administration/navigation/tree`;

  private readonly modulesSubject = new BehaviorSubject<ErpModule[]>([]);
  readonly modules$ = this.modulesSubject.asObservable();

  private readonly sidebarMenuSubject = new BehaviorSubject<MenuTreeNode[]>([]);
  readonly sidebarMenu$ = this.sidebarMenuSubject.asObservable();

  private readonly activeModuleSubject = new BehaviorSubject<ActiveModule | null>(
    this.tokenStorage.getActiveModule()
  );
  readonly activeModule$ = this.activeModuleSubject.asObservable();

  private modulesLoaded = false;

  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorageService
  ) {}

  // ✅ BACKWARD COMPATIBLE (Landing/Login এর জন্য)
  getModules(): Observable<ErpModule[]> {
    if (!this.modulesLoaded) {
      this.loadModules();
    }
    return this.modules$;
  }

  // ✅ Only once load
  loadModules(): void {
    if (this.modulesLoaded) return;
    this.modulesLoaded = true;

    this.http
      .get<ApiResult<any[]>>(this.modulesUrl)
      .pipe(
        tap(res => console.log('MODULES RESPONSE =>', res)),
        map(res => {
          if (!this.isSuccess(res)) return [];

          const list = this.getData<any[]>(res) ?? [];

          return list.map((m: any) => ({
            moduleId: String(m.moduleId ?? m.ModuleId ?? ''),
            name: String(m.moduleName ?? m.ModuleName ?? m.name ?? m.Name ?? ''),
            icon: (m.moduleIcon ?? m.ModuleIcon ?? m.icon ?? m.Icon ?? null),
            defaultRoute: ((m.defaultRoute ?? m.DefaultRoute ?? '/landing').trim() || '/landing'),
          })) as ErpModule[];
        }),
        catchError(err => {
          console.error('LOAD MODULES ERROR =>', err);
          return of([]);
        })
      )
      .subscribe(list => {
        this.modulesSubject.next(list);
        console.log('MAPPED MODULES =>', list);
      });
  }

  setActiveModule(module: ErpModule): void {
    const active: ActiveModule = {
      moduleId: module.moduleId,
      name: module.name,
      icon: module.icon ?? null,
      defaultRoute: module.defaultRoute ?? '/landing',
    };

    this.tokenStorage.setActiveModule(active);
    this.activeModuleSubject.next(active);

    this.loadTree(active.moduleId);
  }

  clearActiveModule(): void {
    this.tokenStorage.removeActiveModule();
    this.activeModuleSubject.next(null);
    this.sidebarMenuSubject.next([]);
  }

  // ✅ BACKWARD COMPATIBLE (AppShell/Other places)
  getNavigationTree(moduleId: string): Observable<MenuTreeNode[]> {
    this.loadTree(moduleId);
    return this.sidebarMenu$;
  }

  private loadTree(moduleId: string): void {
  const url = `${this.treeUrl}?moduleId=${encodeURIComponent(moduleId)}`;

  this.http
    .get<ApiResult<any[]>>(url)
    .pipe(
      tap(res => console.log('TREE RESPONSE =>', res)),
      map(res => {
        if (!this.isSuccess(res)) return [];

        const rows = this.getData<any[]>(res) ?? [];
        if (!Array.isArray(rows)) return [];

        return rows.map((node: any) => {
          // ✅ Accept many possible backend keys
          const menuId = String(node.menuId ?? node.MenuId ?? node.id ?? node.Id ?? '');
          const title = String(node.menuName ?? node.MenuName ?? node.title ?? node.Title ?? '');
          const icon = (node.menuIcon ?? node.MenuIcon ?? node.icon ?? node.Icon ?? null);
          const route = (node.menuRoute ?? node.MenuRoute ?? node.route ?? node.Route ?? null);

          const subMenusRaw =
            node.subMenus ??
            node.SubMenus ??
            node.subMenuNodes ??
            node.SubMenuNodes ??
            node.children ??
            node.Children ??
            [];

          const subs = Array.isArray(subMenusRaw) ? subMenusRaw : [];

          return {
            menuId,
            title,
            icon,
            route,
            subMenus: subs.map((sm: any) => ({
              subMenuId: String(sm.subMenuId ?? sm.SubMenuId ?? sm.id ?? sm.Id ?? ''),
              title: String(sm.subMenuName ?? sm.SubMenuName ?? sm.title ?? sm.Title ?? ''),
              route: String(sm.subMenuRoute ?? sm.SubMenuRoute ?? sm.route ?? sm.Route ?? ''),
              icon: (sm.subMenuIcon ?? sm.SubMenuIcon ?? sm.icon ?? sm.Icon ?? null),
            })),
          } as MenuTreeNode;
        });
      }),
      catchError(err => {
        console.error('TREE LOAD ERROR =>', err);
        return of([]);
      })
    )
    .subscribe(tree => {
      console.log('MAPPED TREE =>', tree);
      this.sidebarMenuSubject.next(tree);
    });
}


  private isSuccess(res: any): boolean {
    return (res?.success ?? res?.Success) === true;
  }

  private getData<T>(res: any): T | undefined {
    return (res?.data ?? res?.Data) as T | undefined;
  }
}
