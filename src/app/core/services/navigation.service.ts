import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, filter, map, of, take, tap } from 'rxjs';

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

  private readonly sidebarLoadingSubject = new BehaviorSubject<boolean>(false);
  readonly sidebarLoading$ = this.sidebarLoadingSubject.asObservable();

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

  /**
   * ✅ Optional helper for routes like /module/:moduleId
   * Finds module by id, sets active module and loads tree.
   */
  setActiveModuleById(moduleId: string): Observable<ActiveModule | null> {
    const mid = String(moduleId || '').trim();
    if (!mid) return of(null);

    if (!this.modulesLoaded) {
      this.loadModules();
    }

    return this.modules$.pipe(
      filter((mods) => Array.isArray(mods) && mods.length > 0),
      take(1),
      map((mods) => (mods || []).find((m) => String(m.moduleId) === mid) ?? null),
      map((mod) => {
        if (!mod) return null;
        this.setActiveModule(mod);
        return this.activeModuleSubject.value;
      })
    );
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
          if (!Array.isArray(list)) return [];

          return list.map((m: any) => {
            // ✅ support many possible backend keys
            const rawDefaultRoute =
              m.defaultRoute ??
              m.DefaultRoute ??
              m.moduleRoute ??
              m.ModuleRoute ??
              m.homeRoute ??
              m.HomeRoute ??
              m.indexRoute ??
              m.IndexRoute ??
              m.route ??
              m.Route ??
              '/landing';

            return {
              moduleId: String(m.moduleId ?? m.ModuleId ?? ''),
              name: String(m.moduleName ?? m.ModuleName ?? m.name ?? m.Name ?? ''),
              icon: (m.moduleIcon ?? m.ModuleIcon ?? m.icon ?? m.Icon ?? null),
              defaultRoute: this.normalizeRoute(String(rawDefaultRoute ?? '')),
            } as ErpModule;
          });
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
      moduleId: String(module.moduleId), // ✅ string GUID always
      name: module.name,
      icon: module.icon ?? null,
      defaultRoute: this.normalizeRoute(String(module.defaultRoute ?? '/landing')),
    };

    this.tokenStorage.setActiveModule(active);
    this.activeModuleSubject.next(active);

    // ✅ load tree (clears immediately + sets loading)
    this.loadTree(active.moduleId, true);
  }

  clearActiveModule(): void {
    this.tokenStorage.removeActiveModule();
    this.activeModuleSubject.next(null);
    this.sidebarLoadingSubject.next(false);
    this.sidebarMenuSubject.next([]);
  }

  // ✅ BACKWARD COMPATIBLE (AppShell/Other places)
  getNavigationTree(moduleId: string): Observable<MenuTreeNode[]> {
    this.loadTree(String(moduleId), true);
    return this.sidebarMenu$;
  }

  // ✅ For breadcrumb module click: same module হলেও forced reload
  reloadTreeForModule(moduleId: string): void {
    this.loadTree(String(moduleId), true);
  }

  // ✅ For breadcrumb module click (active module ব্যবহার করে)
  reloadActiveModuleTree(): void {
    const active = this.activeModuleSubject.value;
    if (!active?.moduleId) return;
    this.loadTree(String(active.moduleId), true);
  }

  private loadTree(moduleId: string, clearImmediately: boolean): void {
    const mid = String(moduleId || '');
    if (!mid) {
      this.sidebarLoadingSubject.next(false);
      this.sidebarMenuSubject.next([]);
      return;
    }

    // ✅ IMMEDIATE UI FEEDBACK
    this.sidebarLoadingSubject.next(true);
    if (clearImmediately) {
      this.sidebarMenuSubject.next([]);
    }

    const url = `${this.treeUrl}?moduleId=${encodeURIComponent(mid)}`;

    this.http
      .get<ApiResult<any[]>>(url)
      .pipe(
        tap(res => console.log('TREE RESPONSE =>', res)),
        map(res => {
          if (!this.isSuccess(res)) return [];

          const rows = this.getData<any[]>(res) ?? [];
          if (!Array.isArray(rows)) return [];

          return rows.map((node: any) => {
            const menuId = String(node.menuId ?? node.MenuId ?? node.id ?? node.Id ?? '');
            const title = String(node.menuName ?? node.MenuName ?? node.title ?? node.Title ?? '');
            const icon = (node.menuIcon ?? node.MenuIcon ?? node.icon ?? node.Icon ?? null);

            const rawMenuRoute = (node.menuRoute ?? node.MenuRoute ?? node.route ?? node.Route ?? null);
            const route = rawMenuRoute ? this.normalizeRoute(String(rawMenuRoute)) : null;

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
              subMenus: subs.map((sm: any) => {
                const rawSmRoute = (sm.subMenuRoute ?? sm.SubMenuRoute ?? sm.route ?? sm.Route ?? '');
                return {
                  subMenuId: String(sm.subMenuId ?? sm.SubMenuId ?? sm.id ?? sm.Id ?? ''),
                  title: String(sm.subMenuName ?? sm.SubMenuName ?? sm.title ?? sm.Title ?? ''),
                  route: this.normalizeRoute(String(rawSmRoute ?? '')),
                  icon: (sm.subMenuIcon ?? sm.SubMenuIcon ?? sm.icon ?? sm.Icon ?? null),
                };
              }),
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
        this.sidebarLoadingSubject.next(false);
      });
  }

  // ✅ ensure route is always like "/administration/dashboard"
  private normalizeRoute(route: string): string {
    const r = (route ?? '').trim();
    if (!r) return '/landing';

    // allow external absolute URL if ever needed
    if (r.startsWith('http://') || r.startsWith('https://')) return r;

    // ensure leading slash
    return r.startsWith('/') ? r : `/${r}`;
  }

  private isSuccess(res: any): boolean {
    return (res?.success ?? res?.Success) === true;
  }

  private getData<T>(res: any): T | undefined {
    return (res?.data ?? res?.Data) as T | undefined;
  }
}
