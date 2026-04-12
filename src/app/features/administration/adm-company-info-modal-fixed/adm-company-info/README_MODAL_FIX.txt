Add this to your global styles.scss if not already present:

.company-info-dialog-panel .mat-mdc-dialog-container {
  padding: 0 !important;
}

.company-info-dialog-panel .mat-mdc-dialog-surface,
.company-info-dialog-panel .mdc-dialog__surface {
  padding: 0 !important;
  border-radius: 16px !important;
  overflow: hidden !important;
  background: #ffffff !important;
  box-shadow: 0 24px 50px rgba(0, 0, 0, 0.18) !important;
}

.company-info-dialog-backdrop {
  background: rgba(15, 23, 42, 0.42) !important;
  backdrop-filter: blur(2px);
}
