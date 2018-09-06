import { SimpleTreeViewService } from './simple-tree-view.service';
import { Observable } from 'rxjs/Observable';
import { SimpleTreeviewNodeComponent } from './simple-tree-view-node.component';
import { Component, OnInit, HostBinding, Input, ViewChildren, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-simple-treeview',
  template: `
    <ul class="c-simple-treeview__list">
		<simple-treeview-node *ngFor="let item of data; let i=index"
         [data]="item"
         [index]="i"
         [checkIsEnabled]="item.parent != null"></simple-treeview-node>
    </ul>
  `,
  providers: [SimpleTreeViewService]

})
export class SimpleTreeviewComponent implements OnInit {
    @ViewChildren(SimpleTreeviewNodeComponent) nodes: SimpleTreeviewNodeComponent[];

    @HostBinding('class.c-simple-treeview') true;

    @Output() changeEvent:EventEmitter<{}> = new EventEmitter();
    @Output() actionEvent:EventEmitter<{action: string, data?:any}> = new EventEmitter();

    @Input() data: {
        key: string, 
        title: string, 
        level: number,
        isSelected?:boolean,
        extraFieldType?: string, 
        extraFieldValue?: any, 
        params?:any,
        items?: {key: string, title: string, level: number, isSelected?:boolean, extraFieldType?: string, extraFieldValue?: any, parent?: any}[]}[]; //extraFieldType: "fuzzy"

    @Input() set selectedNodes(nodes: { key: string, extraFieldValue?: any, isSelected?: boolean }[]) {
        let node;
        nodes.forEach( item => {
            node = this.nodeDic[item.key];
            if(node) node.select(true, node);
        });
    };

    public nodeDic: {} = {};

    constructor(
        private treeService: SimpleTreeViewService,
        private changeDetector: ChangeDetectorRef
        ) { }

    ngOnInit() {
        this.treeService.registerTree(this);
    }

    select(node:{key: string, isSelected?:boolean}, checked: boolean) {
        this.treeService.selectNode(node, checked);
    }

    emitAction(action: string, data?: any) {
        this.actionEvent.emit({action: action, data: data});
    }

    registerNode(node: SimpleTreeviewNodeComponent) {
        this.nodeDic[node.data.key] = node;
        // if(this.selectedNodes) {
        //     console.log(this.selectedNodes);
        //     let targetNode = this.selectedNodes.find( selectedNode => selectedNode.key == node.data.key );
        //     node.select(targetNode != null, targetNode);
        // }
    }

    patchNode(node: {key: string}) {
        if(!this.nodeDic[node.key]) return;
        Object.assign(this.nodeDic[node.key], node);
    }

    private extraFieldChangeHandler(event) {

    }
}
