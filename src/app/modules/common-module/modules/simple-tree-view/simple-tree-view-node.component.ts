import { TextInputComponent } from './../../../base-module/components/text-input/text-input.component';
import { CheckboxComponent } from './../../../base-module/components/checkbox/checkbox.component';
import { SimpleTreeViewService } from './simple-tree-view.service';
import { SimpleTreeviewChildrenComponent } from './simple-tree-view-children.component';
import { Observable } from 'rxjs/Observable';
import { Component, OnInit, HostBinding, Input, ViewChild, Renderer, ElementRef, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'simple-treeview-node',
  template: `
    <div class="c-simple-treeview__node-content">
        <span class="c-simple-treeview__node-check">
            <app-checkbox 
                (changeEvent)="checkHandler($event)"
                [isChecked]="data.isSelected"
                [isDisabled]="data.items?.length > 0"
                type="square"></app-checkbox>
        </span>
        <span class="c-simple-treeview__node-icon">
            <i class="icon__n icon__n--{{icon}}"></i>
        </span>
        <div class="c-simple-treeview__node-label">{{data?.title}}</div>	

        <div *ngIf="data.extraFieldType == 'fuzzy'" 
        class="c-simple-treeview__node-input">
        <app-text-input
            (typeEvent)="extraFieldChangeHandler($event)"
            [isTypeEmitting]="true"
            [value]="data?.extraFieldValue == 0 ? '' : data?.extraFieldValue" 
            [typeDebounceTime]='100'
            *ngIf="data.isSelected"
            size="sm"
            placeholder="1-100"></app-text-input>
        </div>
    </div>
    <simple-treeview-children
            *ngIf="data.items?.length > 0"
            [node]="this"
            [data]="data.items"></simple-treeview-children>
  `
})
export class SimpleTreeviewNodeComponent implements OnInit {
    @ViewChild(CheckboxComponent) checkbox: CheckboxComponent;
    @ViewChild(TextInputComponent) textInput: TextInputComponent;

    @HostBinding('class.c-simple-treeview__node') true;

    @Input() index: number;
    @Input() data:{
        key: string, 
        title: string, 
        level: number,
        isSelected?:boolean,
        extraFieldType?: string, 
        extraFieldValue?: any, 
        params?:any, 
        items?: {key: string, title: string, level: number, isSelected?:boolean, extraFieldType?: string, extraFieldValue?: any, parent?: any}[]}
    @Input() checkIsEnabled: boolean;

    get icon():string {
        if(!this.data) return "folder_open";
        let icon: string = this.data.level == 0 ? "folder" : "folder_open";
        if(this.data.items && this.data.items.length) icon = "folder-remove";
        return icon;
    }

    constructor(
        private renderer: Renderer,
        private element: ElementRef,
        private changeDetector: ChangeDetectorRef,
        private treeService: SimpleTreeViewService
    ) {  }

    ngOnInit() {
       this.renderer.setElementClass(this.element.nativeElement, 'level-'+this.data.level, true) ;
    }

    ngAfterViewInit() {
        this.treeService.tree.registerNode(this);
    }

    checkHandler(event) {
        this.data.isSelected = event;
        this.treeService.selectNode(this.data, event);
        if(event) {
            let self = this;
            setTimeout(function() {
                if(self.textInput) {
                    self.textInput.pattern = /^[1-9][0-9]?$|^100$/;
                    self.textInput.focus();
                }
            }, 200);
        }
    }

    extraFieldChangeHandler(event) {
        this.data.extraFieldValue = event;
        this.treeService.patchNode(this.data);
    }

    select(value, data?:{}) {
        this.data.isSelected = value;
        if(data && data["extraFieldValue"]) this.data.extraFieldValue = data["extraFieldValue"];
        this.treeService.selectNode(this.data, value);
    }

}
