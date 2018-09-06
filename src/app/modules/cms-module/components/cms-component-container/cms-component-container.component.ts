import { CmsComponentComponent } from './../cms-component/cms-component.component';
import { ViewChild, ElementRef, Component, OnInit, Input, ViewChildren, QueryList, ChangeDetectorRef, HostBinding, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-cms-component-container',
  templateUrl: './cms-component-container.component.html',
  styleUrls: ['./cms-component-container.component.scss']
})
export class CmsComponentContainerComponent implements OnInit {
  @ViewChildren(CmsComponentComponent) componentBlocks: QueryList<CmsComponentComponent>;
  @ViewChild('buttons') buttons: ElementRef;

  @HostBinding('class.c-cms-component-container') true;

  @Output() actionEvent : EventEmitter<Object> = new EventEmitter<Object>();

  @Input() contextMenuData: {action: string, label: string, icon?: string, params?: any, group?: any }[];
  @Input() data: any;
  
  componentList: {label: string, name: string, isDisabled: boolean, params?:any}[]
  components: any[] = [];

  get allComponentCollapsed():boolean {
    if(!this.componentBlocks) return true;
		let expandedComponent:CmsComponentComponent = this.componentBlocks.find( componentBlock => componentBlock.expandableBlock.isExpanded );
		return expandedComponent ? false : true;
  }
  
  get isValid() {
    let valid: boolean = true;
    if(this.componentBlocks) {
      let componentBlocks: CmsComponentComponent[] = this.componentBlocks.toArray();
      if(componentBlocks.length) {
        valid = !componentBlocks.some( item => !item.isValid );
      }
    }
    return valid;
  }

  constructor(
    private changeDetector: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.componentList = [];
    this.components = [];
    this.data.getComponents().forEach( item => {
      this.componentList.push({
        label: item["Name"],
        name: item["componentId"],
        isDisabled: false,
        params: {component: item}
      });
      if(item.getInstances) {
        item.getInstances().forEach( instance => {
          this.components.push(instance);
        });
      }
      this.components.sort( (a,b) => { return a.sortIndex - b.sortIndex; } );
      this.checkAllowMultiple();      
    });
  }

  ngAfterViewInit() {
    this.changeDetector.detectChanges();
  }

  toggleAllComponents() {
		this.allComponentCollapsed ? this.componentBlocks.forEach( componentBlock => componentBlock.expand() ) : this.componentBlocks.forEach( componentBlock => componentBlock.collapse() );
    this.changeDetector.detectChanges();
	}

  buttonGroupHandler(event) {
    this.addNewComponent(event.params.component);
  }

  componentActionHandler(event) {
    switch(event.action) {
      case "saveComponent":
        let fields = event.params.component.getFields();
        // let validField = fields.find( field => {
        //   let valid = field.Value != null;
        //   if(typeof field.Value === "string") valid = field.Value.length > 0;
        //   return valid;
        // });
        // if(validField) this.data.saveComponent(event.params.component);
        this.data.saveComponent(event.params.component);
      break;
      case "removeComponent":
        this.removeComponent(event.params.component);
      break;
    }
  }

  private addNewComponent(component){
    if(!this.components) this.components = [];
    this.components.push(component.createComponent());
    this.checkAllowMultiple();
    this.changeDetector.detectChanges();
  }

  private removeComponent(component) {
    if(!this.components) return;
    let existComponent = this.components.find( item => item.instanceId == component.instanceId );
    this.data.deleteInstance(existComponent);
    if(existComponent) this.components.splice(this.components.indexOf(existComponent), 1);
    this.checkAllowMultiple();
  }

  private checkAllowMultiple(){
    this.componentList.map( item => {
      item.isDisabled = item.params.component.AllowMultiple == false && this.components.find( component => component.componentId == item.params.component.componentId);
    });
  }

}
