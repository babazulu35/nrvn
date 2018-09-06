import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TetherDialog } from './tether-dialog';
import { TetherDialogComponent } from './tether-dialog.component';
import { TetherDialogContentComponent } from './tether-dialog-content.component';
import { TetherDialogOverlayComponent } from './tether-dialog-overlay.component';

@NgModule({
  imports: [CommonModule],
  declarations: [TetherDialogComponent, TetherDialogContentComponent, TetherDialogOverlayComponent],
  exports: [TetherDialogComponent],
  providers: [TetherDialog]
})
export class TetherDialogModule {
  static forRoot(): ModuleWithProviders { return {ngModule: TetherDialogModule, providers: [TetherDialog]}; }
}
