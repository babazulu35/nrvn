import { TetherDialog } from './../../../common-module/modules/tether-dialog/tether-dialog';
import { ModalSearchBoxComponent } from './../../../common-module/components/modal-search-box/modal-search-box.component';
import { Observable } from 'rxjs/Rx';
import { Component, OnInit, HostBinding, Input, ComponentRef, ComponentFactoryResolver, Injector, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-firm-search-select',
  templateUrl: './firm-search-select.component.html',
  styleUrls: ['./firm-search-select.component.scss'],
  entryComponents: [ModalSearchBoxComponent]
})
export class FirmSearchSelectComponent implements OnInit {
  @HostBinding('class.c-firm-search-select') true;

  @HostBinding('class.c-firm-search-select--empty')
  get isEmpty(): boolean { return !this.firmList || this.firmList.length == 0 };
  @Input() isRemovable:boolean = true;
  @Input() settings: {
    addLabel: string,
    
    search: {
      title: string,
      placeholder: string,
      presets: { title: string, list: {id: any, title: string, icon?: string, description?:string}[] }[]
      feedback: {
        title: string,
        description: string,
        action?: {action: string, label: string, params?: Object}
      }
    }
  }
  @Input() set firmSearchResult(result) {
    if(this.modalSearchBox) this.modalSearchBox.typeahead.searchData = result;
  }
  @Input() firmTypes: {text: string, value: any, disabled?: boolean}[];
  @Input() firmList: {id: any, name: string, type?: any, params?: any}[] = [];

  @Input() allowMultipleFirm = true;

  @Input() avatar = false;

  @Output() actionEvent: EventEmitter<{action: string, data?: any}> = new EventEmitter();
  @Output() changeEvent: EventEmitter<{id: any, name: string, type?: any}[]> = new EventEmitter();

  modalSearchBox: ModalSearchBoxComponent;

  firmListDic: {} = {};

  resultSubscription: any;
  feedbackSubscription: any;
  searchSubscription: any;
  dismisSubscription: any;

  constructor(
    private resolver: ComponentFactoryResolver,
    private injector: Injector,
    public tether: TetherDialog
  ) { }

  ngOnInit() {
    //if(this.firmTypes) this.firmTypes.unshift({text: "Seçiniz", value: 0});
    
  }

  ngOnDestroy() {
    if(this.resultSubscription) this.resultSubscription.unsubscribe();
    if(this.feedbackSubscription) this.feedbackSubscription.unsubscribe();
    if(this.searchSubscription) this.searchSubscription.unsubscribe();
    if(this.dismisSubscription) this.dismisSubscription.unsubscribe();
  }

  selectHandler(result:{id: any, title: string, params?:any}) {
    this.addFirm({id: result.id, name: result.title, type: 0, params: result.params});
    if(this.firmList) return;
  	let hasFirm = this.firmList.find(item => {
  		return (item.id === result.id);
  	});
  	if(!hasFirm){
		  this.actionEvent.emit({action: "select", data: result})
  	}
  }

  changeFirmType(firm: {id: any, name: string, type: any}, event) {
    firm.type = parseInt(event);
    this.actionEvent.emit({action: "patch", data: firm})
    //this.changeEvent.emit(this.firmList);
  }

  addFirm(firm: {id: any, name: string, type: any, params?: any}) {
    if(this.firmListDic[firm.id]){
      this.actionEvent.emit({action: "exist", data: firm})
      return;
    }
    if(!this.firmList) this.firmList = [];
    this.firmListDic[firm.id] = firm;
    this.firmList.push(firm);
    this.actionEvent.emit({action: "add", data: firm})
    this.changeEvent.emit(this.firmList);
  }

  removeFirm(firm: {id: any, name: string, type: any}) {
    let index: number = this.firmList.indexOf(firm);
    if(index >= 0) this.firmList.splice(index, 1);
    delete this.firmListDic[firm.id];
    this.actionEvent.emit({action: "remove", data: firm})
    this.changeEvent.emit(this.firmList);
  }

  searchFirm() {
    let component:ComponentRef<ModalSearchBoxComponent> = this.resolver.resolveComponentFactory(ModalSearchBoxComponent).create(this.injector);
    this.modalSearchBox = component.instance;

    this.modalSearchBox.title = this.settings.search.title;
    this.modalSearchBox.settings = {
      search: this.settings.search
    };

    this.modalSearchBox.presets = Observable.of(this.settings.search.presets);

    this.searchSubscription = this.modalSearchBox.searchEvent.subscribe( result => this.actionEvent.emit({action: "search", data: result}) );
    this.resultSubscription = this.modalSearchBox.resultEvent.subscribe( result => this.selectHandler(result));
    this.dismisSubscription = this.modalSearchBox.dismissEvent.subscribe( result => this.actionEvent.emit({action: "dismiss", data: ''}));

    if(this.settings.search.feedback){
      this.feedbackSubscription = this.modalSearchBox.actionEvent.subscribe( result => this.actionEvent.emit({action: result.action}) );
    }

    this.tether.modal(component, {
      escapeKeyIsActive: true
    }).then(result => {

    }).catch( reason => {
    	this.actionEvent.emit({action: "dismiss", data: ''});
    });
  }

}
