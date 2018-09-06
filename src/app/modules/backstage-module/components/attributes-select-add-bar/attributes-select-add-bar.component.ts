import { TetherDialog } from './../../../common-module/modules/tether-dialog/tether-dialog';
import { AttributesSelectAddComponent } from './../../common/attributes-select-add/attributes-select-add.component';
import { Component, OnInit, HostBinding, Input, ComponentFactoryResolver, Injector, ComponentRef, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-attributes-select-add-bar',
  templateUrl: './attributes-select-add-bar.component.html',
  styleUrls: ['./attributes-select-add-bar.component.scss'],
  entryComponents: [AttributesSelectAddComponent]
})
export class AttributesSelectAddBarComponent implements OnInit {
  @HostBinding('class.c-attributes-select-add-bar') true;

  @HostBinding('class.c-attributes-select-add-bar--empty')
  get isEmpty(): boolean { return !this.attributes || this.attributes.length == 0 };

  @Input() entityTypeId: number;
  @Input() types: {name:any, label: string, attributes?: any[], isSelected?: boolean, isDisabled?: boolean, params?: Object}[];
  @Input() attributes: {name:string, label: string, type?:{name: string}, params?: any}[] = [];
  @Input() initAttributes: {name:string, label: string, type?:{name: string}, params?: any}[] = [];
  @Output() selectedAttributes: EventEmitter<{name:string, label: string, type?:any, params?: any}[]> = new EventEmitter();
  @Output() changeEvent: EventEmitter<any> = new EventEmitter();
  @Output() actionEvent: EventEmitter<any> = new EventEmitter();

  @Input() canBeDeleted:boolean = true;

  
  
  attributesSelectAdd: AttributesSelectAddComponent;
  typesDic: {};

  constructor(
    private resolver: ComponentFactoryResolver,
    private injector: Injector,
    public tether: TetherDialog
  ) { }

  ngOnInit() {
    

  }

  ngOnChanges(changes) {
    
    if(changes.types && this.types) {
      this.typesDic = {};
      this.types.forEach( type => {
        type.attributes = [];
        type.name = type.name.toString();
        this.typesDic[type.name] = type;
      });
    }
  }

  typeActionHandler(event) {
    this.types.forEach( type => type.attributes = [] );
    let attributes: any[];
    let attribute;
    let key;
    attributes = [].concat(this.attributes);
    while(attributes.length > 0) {
      attribute = attributes.shift();
      key = attribute.type.name;
      if(this.typesDic[key]) this.typesDic[key].attributes.push(attribute);
    }
    this.openAttributeList(event);
  }

  openAttributeList(attributeType: any) {
    let component:ComponentRef<AttributesSelectAddComponent> = this.resolver.resolveComponentFactory(AttributesSelectAddComponent).create(this.injector);
    this.attributesSelectAdd = component.instance;

    this.attributesSelectAdd.type = attributeType;
    this.attributesSelectAdd.entityTypeId = this.entityTypeId;
    if(this.typesDic[attributeType.name] && this.typesDic[attributeType.name].attributes.length > 0 ) {
     this.attributesSelectAdd.checkedNodes = this.typesDic[attributeType.name].attributes; //this.attributes.filter( item => item.type.name == attributeType.name);
    }

    this.tether.modal(component, {

    }).then(result => {
      if(result && result["type"] && result["type"]["name"]) {
        let key = result["type"]["name"];
        if(this.typesDic[key]) this.typesDic[key].attributes = result["attributes"];
      }
      this.attributes = [];
      this.types.forEach( type => {
        this.attributes = this.attributes.concat(this.typesDic[type.name].attributes);
      });
      this.selectedAttributes.emit(this.attributes);
      this.changeEvent.emit(this.attributes);
    }).catch( reason => {

    })
  }
  tagActionEvent(event){
  		this.actionEvent.emit(event);
  }

}
