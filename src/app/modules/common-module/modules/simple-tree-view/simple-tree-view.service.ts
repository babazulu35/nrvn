import { SimpleTreeviewComponent } from './simple-tree-view.component';
import { Injectable } from '@angular/core';

@Injectable()
export class SimpleTreeViewService {

  private mainTree:SimpleTreeviewComponent;
  get tree():SimpleTreeviewComponent { return this.mainTree };

  private dic: {};
  private nodes: {
        key: string, 
        title: string, 
        level: number,
        extraFieldType?: string, 
        extraFieldValue?: any}[];
  get selectedNodes(): { key: string,  title: string,  level: number, extraFieldType?: string,  extraFieldValue?: any}[] { return this.nodes };

  constructor() {  }

  registerTree(tree:SimpleTreeviewComponent, nodes:any = []) {
    this.mainTree = tree;
    this.nodes = nodes;
    this.dic = {};
    this.nodes.forEach( node => {
      this.dic[node.key] = node;
    })
  }

  selectNode(node:{key:string}, checked) {
    checked ? this.addNode(node) : this.removeNode(node);
  }

  patchNode(node: {key: string}) {
    if(!this.dic[node.key]) return;
    this.dic[node.key] = Object.assign({}, node);
    this.tree.changeEvent.emit(this.nodes);
    this.tree.emitAction("patch", node);
  }

  private addNode(node:{key: string}) {
    if(this.dic[node.key]) return;
    this.dic[node.key] = node;
    this.nodes.push(this.dic[node.key]);
    this.tree.emitAction("add", node);
    this.tree.changeEvent.emit(this.nodes);
  }

  private removeNode(node:{key: string}) {
    if(this.dic[node.key]) {
      this.nodes.splice(this.nodes.indexOf(this.dic[node.key]), 1);
      delete this.dic[node.key];
      this.tree.nodeDic[node.key].select(false);
      this.tree.emitAction("remove", node);
      this.tree.changeEvent.emit(this.nodes);
    }
  }

}
