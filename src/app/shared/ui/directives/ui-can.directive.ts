import { Directive, ElementRef, Input, OnChanges, Renderer2, inject } from '@angular/core';
import { PermissionStateService } from '../../../core/state/permission-state.service';

@Directive({
  selector: '[uiCan]',
  standalone: true,
})
export class UiCanDirective implements OnChanges {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly renderer = inject(Renderer2);
  private readonly permissionState = inject(PermissionStateService);

  @Input('uiCan') routeOrRoutes: string | string[] | null = null;

  ngOnChanges(): void {
    const allowed = this.checkPermission(this.routeOrRoutes);
    this.renderer.setStyle(this.el.nativeElement, 'display', allowed ? null : 'none');
  }

  private checkPermission(routeOrRoutes: string | string[] | null): boolean {
    if (!routeOrRoutes) return true;
    const activeModuleId = this.permissionState.getActiveModuleIdSnapshot();
    const menusByModule = this.permissionState.getMenusByModuleIdSnapshot();
    if (activeModuleId === null) return true;
    const menus = menusByModule[activeModuleId] ?? [];
    const allowedRoutes = new Set(menus.flatMap(menu => (menu.subMenus ?? []).map(sub => sub.route)));
    const targets = Array.isArray(routeOrRoutes) ? routeOrRoutes : [routeOrRoutes];
    return targets.some(route => allowedRoutes.has(route));
  }
}
