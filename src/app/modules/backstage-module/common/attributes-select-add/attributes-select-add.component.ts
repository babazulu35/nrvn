import { TetherDialog } from './../../../common-module/modules/tether-dialog/tether-dialog';
import { TagGroupComponent } from './../../../common-module/components/tag-group/tag-group.component';
import { SimpleTreeviewComponent } from './../../../common-module/modules/simple-tree-view/simple-tree-view.component';
import { DialogBoxComponent } from './../../../base-module/components/dialog-box/dialog-box.component';
import { EntityService } from './../../../../services/entity.service';
import { AttributeService } from './../../../../services/attribute.service';
import { Component, OnInit, Input, ChangeDetectorRef, ViewChild, HostBinding, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { Attribute } from '../../../../models/attribute';

@Component({
  selector: 'app-attributes-select-add',
  templateUrl: './attributes-select-add.component.html',
  styleUrls: ['./attributes-select-add.component.scss'],
  providers: [AttributeService, EntityService]
})
export class AttributesSelectAddComponent implements OnInit {
  @ViewChild(DialogBoxComponent) dialogBox: DialogBoxComponent;
  @ViewChild(SimpleTreeviewComponent) tree: SimpleTreeviewComponent;
  @ViewChild(TagGroupComponent) tagGroup: TagGroupComponent;

  @HostBinding('class.oc-attributes-select-add') true;

  @Output() changeEvent: EventEmitter<{type: any, attributes: any[]}> = new EventEmitter();

  @Input() type: {name: any, label: string};
  @Input() entityTypeId: number;
  @Input() title: string;
  @Input() showWithoutBox:boolean;

  @Input() attributes: { //Simple Tree Data
    key: string,
    title: string,
    parentId?: number,
    level: number,
    extraFieldType?: string,
    extraFieldValue?: any,
    params?:any,
    items?: {key: string, title: string, parentId?: number, level: number, extraFieldType?: string, extraFieldValue?: any}[]}[]; //extraFieldType: "fuzzy"

  @Input() checkedNodes: { //Tag Group Data
    name: string,
    label: string,
    type?: any,
    params?: any }[];

  public selectedAttributes: { //Tag Group Data
    name: string,
    label: string,
    type?: any,
    params?: any }[] = [];

  public isLoading: boolean;

  constructor(
    public changeDetector: ChangeDetectorRef,
    public tether: TetherDialog,
    public attributeService: AttributeService,
    public entityService: EntityService,
  ) { }

  ngOnInit() {
    if(!this.title && this.type) this.title = this.type.label + " Tipinde Özellik Ekle";

    this.isLoading = true;
    this.entityService.setCustomEndpoint('GetAll');
    this.entityService.fromEntity('AEntityTypeAttributeRule')
    .where('EntityTypeId', '=', this.entityTypeId)
    .and('Attribute/AttributeTypeId', '=', parseInt(this.type.name))
    .expand(['Attribute', 'Localization'])
    .take(1000)
    .page(0)
    .executeQuery();

    this.entityService.data.subscribe(entities => {
      if (entities && entities.length > 0) {
        let tree = [], mappedArray = {};

        entities.forEach(entity => {
          let attribute = entity['Attribute'];
          let node;
          if(this.checkedNodes){
            node = this.checkedNodes.find( item => item.name == attribute["Id"]);
          }
          let arrayElem = {
            key: attribute["Id"],
            parentId:attribute["ParentId"],
            title: attribute["Localization"]["Name"],
            level: 0,
            extraFieldType: parseInt(attribute["ValueType"]) ==  2 ? "fuzzy" : null,
            extraFieldValue: node ? node["extraFieldValue"] : 0,
            model: new Attribute(attribute)

          }
          mappedArray[arrayElem["key"]] = arrayElem;
          mappedArray[arrayElem["key"]]['items'] = [];
        });

        for (let id in mappedArray) {
          if (mappedArray.hasOwnProperty(id)) {
            let mappedElem = mappedArray[id];
            if (mappedElem["parentId"] && mappedArray[mappedElem['parentId']]) {
              mappedArray[mappedElem['parentId']]['items'].push(mappedElem);
            } else {
              tree.push(mappedElem);
            }
          }
        }
        this.attributes = tree;
        this.changeDetector.detectChanges();
        this.isLoading = false;
        let self = this;
        setTimeout(function(){
          self.setCheckedNodes();
        }, 100);
        this.dialogBox.position();
        if(this.tether) this.tether.position();
      } else {
        setTimeout(()=>{
          this.isLoading = false;
        }, 300);
      }
    });
  }

  ngAfterViewInit() {
    
  }

  position() {
    if(this.dialogBox) this.dialogBox.position();
    if(this.tether) this.tether.position();
  }

  setCheckedNodes(){
    if(this.checkedNodes) {
      let selectedNodes: { key: string, extraFieldValue?: any}[] = [];
      let node:{ key: string, extraFieldValue?: any};
      this.checkedNodes.forEach( checkedNode => {
        node = {key: checkedNode.name};
        node.extraFieldValue = checkedNode["extraFieldValue"];
        if(this.attributes) {
          let attribute = this.attributes.find( item => item.key == checkedNode.name);
          if(attribute) attribute.extraFieldValue = checkedNode["extraFieldValue"];
        }
        selectedNodes.push(node);
      });
      if(this.tree) this.tree.selectedNodes = selectedNodes;
      this.position();
      this.changeDetector.detectChanges();
    }
  }

  treeActionHandler(event:{action: string, data: any}) {
    let node: {  name: string, label: string, type?: any, params?: any };
    switch(event.action) {
      case "add":
        this.selectedAttributes.push({
          name: event.data.key,
          label: event.data.title,
          type: this.type,
          params: {attribute: event.data}
        });
        this.position();
      break;
      case "remove":
        node = this.selectedAttributes.find( attribute => attribute.name == event.data.key );
        if(node) this.selectedAttributes.splice(this.selectedAttributes.indexOf(node), 1);
      break;
      case "patch":
        node = this.selectedAttributes.find( attribute => attribute.name == event.data.key );
        let fValue: number = parseInt(event.data.extraFieldValue);
        if(fValue > 100) fValue = 100;
        if(node) node.label = fValue > 0 ? event.data.title + " [ <i>f:</i><span>" + fValue + "</span>]" : event.data.title;
      break;
    }
    this.emitChangeEvent();
  }

  treeChangeHandler(event: {key: string, title: string}[]) {
    let attributes: any[] = [];
    event.forEach( node => {
      attributes.push({
        name: node.key,
        label: node.title,
        type: this.type,
        extraFieldValue: node["extraFieldValue"],
        params: {attribute: node}
      });
      this.selectedAttributes = attributes;
      this.position();
      this.emitChangeEvent();
    })
  }

  tagChangeHandler(event) {

  }

  tagActionHandler(event: {action: string, data?:{name: string}}) {
    switch(event.action) {
      case "remove":
      this.tree.select({key: event.data.name}, false);
      this.emitChangeEvent();
      break;
    }
  }

  emitChangeEvent() {
    this.selectedAttributes.map(item => item["extraFieldValue"] = item.params.attribute["extraFieldValue"]);
    this.changeEvent.emit({
      type: this.type,
      attributes: this.selectedAttributes
    })
  }

  submit(event:any) {
    this.selectedAttributes.map(item => item["extraFieldValue"] = item.params.attribute["extraFieldValue"]);
    if(this.tether) this.tether.close({
      type: this.type,
      attributes: this.selectedAttributes
    });
  }

}