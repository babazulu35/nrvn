import { BaseComponentsModule } from './../../../base-module/base-components.module';
import { SimpleTreeviewChildrenComponent } from './simple-tree-view-children.component';
import { SimpleTreeviewNodeComponent } from './simple-tree-view-node.component';
import { SimpleTreeviewComponent } from './simple-tree-view.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@NgModule({
    imports: [
        CommonModule,
        BaseComponentsModule
    ],
    declarations: [
        SimpleTreeviewComponent,
        SimpleTreeviewNodeComponent,
        SimpleTreeviewChildrenComponent
    ],
    exports: [
        SimpleTreeviewComponent,
    ]
})
export class SimpleTreeviewModule {}
