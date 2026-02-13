export interface ErpModule {
  moduleId: string;          // ✅ GUID string
  name: string;
  icon?: string | null;
  defaultRoute: string;      // ✅ non-null
}

export interface SubMenuNode {
  subMenuId: string;         // ✅ GUID string
  title: string;
  route: string;
  icon?: string | null;
}

export interface MenuTreeNode {
  menuId: string;            // ✅ GUID string
  title: string;
  route?: string | null;
  icon?: string | null;
  subMenus: SubMenuNode[];
}
