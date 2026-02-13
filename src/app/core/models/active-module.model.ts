export interface ActiveModule {
  moduleId: string; // GUID string
  name: string;
  icon?: string | null;
  defaultRoute: string;
}
