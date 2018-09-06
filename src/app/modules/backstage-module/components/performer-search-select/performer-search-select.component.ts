import { Performer } from './../../../../models/performer';
import { ModalSearchBoxComponent } from './../../../common-module/components/modal-search-box/modal-search-box.component';
import { TetherDialog } from './../../../common-module/modules/tether-dialog/tether-dialog';
import { ContextMenuComponent } from './../../../common-module/components/context-menu/context-menu.component';
import { NotificationService } from './../../../../services/notification.service';
import { EntityService } from './../../../../services/entity.service';
import { PerformerCreateComponent } from './../../common/performer-create/performer-create.component';
import { Observable } from 'rxjs/Observable';
import { Component, OnInit, HostBinding, Output, EventEmitter, ComponentFactoryResolver, Injector, ComponentRef, Input } from '@angular/core';

@Component({
  selector: 'app-performer-search-select',
  templateUrl: './performer-search-select.component.html',
  styleUrls: ['./performer-search-select.component.scss'],
	providers: [EntityService],
	entryComponents: [ModalSearchBoxComponent]
})
export class PerformerSearchSelectComponent implements OnInit {
  @HostBinding('class.c-performer-search-select') true;

  @Output() actionEvent: EventEmitter<{action: string, data?: any}> = new EventEmitter();
  @Output() changeEvent: EventEmitter<Performer[]> = new EventEmitter();

  get isEmpty(): boolean { return !this.performers || this.performers.length == 0 };

  @Input() performers: Performer[];

  performersDic: {} = {};
	searchBox: ModalSearchBoxComponent;
	searchSubscription: any;
	searchBoxActionSubscription: any;
	performerAction: ContextMenuComponent;
  performerCreate: PerformerCreateComponent;
  performerCreateComplete: any;
	performerActionSubscription: any;

	@Input() showContext:boolean = true;

  constructor(
    private performerEntityService: EntityService,
    private resolver: ComponentFactoryResolver,
    private injector: Injector,
    public tether: TetherDialog,
    private notificationService: NotificationService
  ) { }

  ngOnInit() {
		//this.showContext = true;
		this.performerEntityService.setCustomEndpoint("GetAll");
    this.performerEntityService.data.subscribe ( performers => {
			if(this.searchBox) {
				if(performers) {
					let result:{}[] = [];
					performers.forEach(performer => {
						result.push({
							id: performer.Id, 
							title: performer.Name, 
							icon: "music_note",
							params: {performer: new Performer(performer)}
						})
					});

					this.searchBox.searchResults = Observable.of([{
						title: "ARAMA SONUÇLARI",
						list: result
					}]);
				}
			}
		});
  }

  openPerformerSearchBox() {
    this.performerCreate = null;
		let component: ComponentRef<ModalSearchBoxComponent> = this.resolver.resolveComponentFactory(ModalSearchBoxComponent).create(this.injector);
		this.searchBox = component.instance;

		this.searchBox.title = "Sanatçı Ekle";
		this.searchBox.presets = Observable.of([]);
		this.searchBox.settings = {
			search: {
				placeholder: "Eklemek istediğiniz sanatçı adını yazınız",
				feedback: {
					title: "Aramanız ile eşleşen sanatçı bulunamadı", 
					description: "Arama kriterini değiştirerek yeniden deneyebilir ya da yeni sanatçı ekleyebilirsiniz.", 
					action: {action: "gotoLink", label: "YENİ SANATÇI OLUŞTUR", params: {link: "performers?action=create"}},
					icon: {type: "svg", name: "performer"}
				}
			}
		}

		this.searchSubscription = this.searchBox.searchEvent.subscribe( value => this.searchHandler(value));
		this.searchBoxActionSubscription = this.searchBox.actionEvent.subscribe( action => this.searchBoxActionHandler(action));
		
		this.tether.modal(component, {
			escapeKeyIsActive: true,
		}).then(result => {
			if(result && result["params"] && result["params"]["performer"]) this.addPerformer(new Performer(result["params"]["performer"]));
			this.searchBoxCloseHandler();
		}).catch( reason => {
			this.searchBoxCloseHandler();
		});
	}

  searchHandler(value) {
    this.performerEntityService
      .fromEntity('EPerformer')
      .search('Name', value)
			.take(100)
      .page(0)
      .executeQuery();
	}

	searchBoxActionHandler(event) {
		switch(event.action) {
			case "gotoLink":
			if(event.params.link == "performers?action=create") {
				this.openPerformerCreate();
        this.performerCreateComplete = this.openPerformerSearchBox;
			}
			break;
		}
	}

	openPerformerCreate(performer?:Performer){
		if(this.searchBox) this.tether.dismiss();
    let component: ComponentRef<PerformerCreateComponent> = this.resolver.resolveComponentFactory(PerformerCreateComponent).create(this.injector);
		this.performerCreate = component.instance;
    if(performer && performer.Id) this.performerCreate.performerId = performer.Id;

		this.tether.drawer(component, {}).then(
      result => {
			  if(this.performerCreateComplete) this.performerCreateComplete();
        this.performerCreateComplete = null;
				performer.Name = result["Name"];
				performer.Images = result["Images"];
				this.actionEvent.emit({action: "update", data: performer})
      }).catch(reason => {
			  if(this.performerCreateComplete) this.performerCreateComplete();
        this.performerCreateComplete = null;
      });
	}

	addPerformer(performer: Performer) {
    if(this.performersDic[performer.Id.toString()]) {
      this.actionEvent.emit({action: "exist", data: performer})
      this.notificationService.add({text: '<b>'+performer.Name + '</b> daha önce eklendi!', type:'danger'});
      return;
    }
    if(!this.performers) this.performers = [];
    this.performersDic[performer.Id.toString()] = performer;
    this.performers.push(performer);
    this.actionEvent.emit({action: "add", data: performer})
    this.changeEvent.emit(this.performers);
	}

  removePerformer(id: number) {
    let targetPerformer: Performer = this.performers.find( performer => performer.Id == id );
    if(targetPerformer) {
      this.performers.splice(this.performers.indexOf(targetPerformer), 1);
      delete this.performersDic[targetPerformer.Id.toString()];
      this.actionEvent.emit({action: "remove", data: targetPerformer})
      this.changeEvent.emit(this.performers);
    }
  }

	searchBoxCloseHandler() {
		this.searchBox = null;
		if(this.searchSubscription) this.searchSubscription.unsubscribe();
		if(this.searchBoxActionSubscription) this.searchBoxActionSubscription.unsubscribe();
	}

	openPerformerAction(performer:Performer, event) {
		let component: ComponentRef<ContextMenuComponent> = this.resolver.resolveComponentFactory(ContextMenuComponent).create(this.injector);
		this.performerAction = component.instance;

		this.performerAction.data = [
      {action: "edit", label: "Düzenle", icon: "edit", params: {performer: performer}},
      {action: "remove", label: "Sil", icon: "delete", params: {performer: performer}}
    ];

		this.tether.context(component, {
			target: event.target,
			attachment: "top right",
			targetAttachment: "top right"
		}).then( action => this.performerActionHandler(action)).catch(error => {});
	}

	performerActionHandler(event: {} | {action: string, params: {performer: Performer}}) {
		switch(event["action"]) {
			case "remove":
				if(this.performers && this.performers.length > 0 && event["params"]  && event["params"].performer) {
          this.removePerformer(event["params"].performer.Id);
				}
			break;
      case "edit":
        if(event["params"]  && event["params"].performer) this.openPerformerCreate(event["params"].performer);
      break;
		}
    this.performerAction = null;
	}

}
