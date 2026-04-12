Modal fix applied.

Updated files:
- adm-company-info/components/adm-company-info-form-modal/adm-company-info-form-modal.component.ts
- adm-company-info/components/adm-company-info-form-modal/adm-company-info-form-modal.component.html
- adm-company-info/components/adm-company-info-form-modal/adm-company-info-form-modal.component.scss
- adm-company-info/pages/adm-company-info-list/adm-company-info-list.component.ts

What changed:
- Kept existing create/edit/view/save functionality intact.
- Supports both inline modal mode and MatDialog mode safely.
- Removed oversized 95vw flat dialog look by constraining dialog width.
- Improved header, body spacing, grouped sections, buttons, and mobile layout.
- Added ESC close support and backdrop click close for inline mode.

Optional global styles if you want cleaner Angular Material dialog container:

.company-info-dialog-panel .mat-mdc-dialog-container {
  padding: 0 !important;
}

.company-info-dialog-panel .mat-mdc-dialog-surface,
.company-info-dialog-panel .mdc-dialog__surface {
  padding: 0 !important;
  border-radius: 20px !important;
  overflow: hidden !important;
  background: transparent !important;
  box-shadow: none !important;
}

.company-info-dialog-backdrop {
  background: rgba(15, 23, 42, 0.45) !important;
  backdrop-filter: blur(4px);
}
