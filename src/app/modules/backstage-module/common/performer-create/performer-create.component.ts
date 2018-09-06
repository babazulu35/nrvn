import { HeaderTitleService } from './../../../../services/header-title.service';
import { NotificationService } from './../../../../services/notification.service';
import { EntityAttribute } from './../../../../models/entity-attribute';
import { Attribute } from './../../../../models/attribute';
import { AttributeType } from './../../../../models/attribute-type';
import { Performer } from './../../../../models/performer';
import { TetherDialog } from './../../../common-module/modules/tether-dialog/tether-dialog';
import { MultiSelectGroupComponent } from './../../../common-module/components/multi-select-group/multi-select-group.component';
import { EntityAttributeService } from './../../../../services/entity-attribute.service';
import { AttributeTypeService } from './../../../../services/attribute-type.service';
import { AttributeService } from './../../../../services/attribute.service';
import { PerformerService } from './../../../../services/performer.service';
import { EntityTypeService } from './../../../../services/entity-type.service';
import { EntityService } from './../../../../services/entity.service';
import { Component, OnInit, HostBinding, ViewChild, ChangeDetectorRef, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-performer-create',
  templateUrl: './performer-create.component.html',
  styleUrls: ['./performer-create.component.scss'],
  providers: [
	  { provide: 'entityTypeEntityService', useClass: EntityService },
	  EntityTypeService, PerformerService, AttributeService, AttributeTypeService, EntityAttributeService]
})
export class PerformerCreateComponent implements OnInit {
  	@ViewChild(MultiSelectGroupComponent) typeSelect: MultiSelectGroupComponent;

  	@HostBinding() class = "oc-performer-create";
  	public tetherService: TetherDialog;

	public performerId: number;
  	public isEditMode: boolean;

  	public createForm: FormGroup = new FormGroup({});
  	public performerType: FormControl = new FormControl('', Validators.required);

	public entityTypeId;
  	public performer: Performer;
  	
	public attributeTypes: {name:string, label: string, params:{attributeType: AttributeType}}[];
	public attributes: {name: string, label: string, type:{name: string}, params: {attribute: Attribute}}[] = [];

	public promises: {
		performer: { name:string, old: any, new: any, saved: {attributes: boolean} }, 
		attributes: { name: string, old: EntityAttribute[], new: EntityAttribute[], saved: {create: boolean, update: boolean, delete: boolean}  } } = {
			
		performer: { name: "performance", old: [], new: [], saved: {attributes: false}},
		attributes: { name: "attributes", old: [], new: [], saved: {create: false, update: false, delete: false} }
	}
	
    public isLoading : boolean = false;
	public isPromising: boolean = false;

    public subscribtion;

	public onErrorHandler(notification : {id ?: string, isNew ?: boolean, type:string, text:string, timeOut?: number}) {
		this.notificationService.add(notification);
		this.isPromising = false;
	}

  	constructor(
	    public router: Router,
	    public changeDetector: ChangeDetectorRef,
	    tetherService: TetherDialog,

		@Inject('entityTypeEntityService') public entityTypeEntityService: EntityService,
		public entityTypeService: EntityTypeService,
	    public performerService: PerformerService,
	    public attributeTypeService : AttributeTypeService,
	    public entityAttributeService : EntityAttributeService,
	    public attributeService : AttributeService,
		public notificationService : NotificationService,
        public headerTitleService: HeaderTitleService
	) {
	    this.tetherService = tetherService;
    	this.createForm.addControl('IsActive', new FormControl(true));
    	this.createForm.addControl('Images', new FormControl(null));
  	}

	ngOnInit() {
		let params = this.router.routerState.snapshot.root.queryParams;
		
		this.attributeTypesServiceDataHandler();
		
		if(this.performerId) {
			this.entityTypeDataHandler();
			return;
		}
	    if(params['action'] == 'edit') {
	     	this.performerId = parseInt(params['performerId']);
			if(!this.performerId) {
				this.tetherService.dismiss();
				this.notificationService.add({text:'performerId parametresi bulunamadı', type:'warning'});
			}
		}
		this.entityTypeDataHandler();
	}

	ngAfterViewInit() {
		this.changeDetector.detectChanges();
	}

	ngOnDestroy() {
		if(this.createForm) this.createForm = null;
		if(this.subscribtion) this.subscribtion.unsubscribe();
	}

	public entityTypeDataHandler() {
		this.entityTypeEntityService.data.subscribe( result => {
			if(result && result[0]) {
				this.entityTypeId = result[0].Id;

				this.attributeTypesServiceDataHandler();
				this.setPeformer();
			}
		});

		this.entityTypeEntityService.setCustomEndpoint('GetAll');
		this.entityTypeEntityService.fromEntity('AEntityType').where('EntityTypeCode', '=', "'PRFMR'").page(0).take(1).executeQuery();
	}

	public setPeformer(){
		if(this.performerId) {
			this.performerService.find(this.performerId, true);
			this.performerService.data.subscribe( result => {
				this.performer = new Performer(result[0]);
				this.resetForm();
				
				this.attributeServiceDataHandler();
				this.resetAttributes(true);

				this.isEditMode = true;
			},
			error => {
				this.notificationService.add({text:`${this.performerId} id numaralı sanatçı bulunamadı`, type:'warning'});
			});
		}else {
			this.performer = new Performer();
		}
		console.log(this.performer);
	}

	resetForm() {
		if(this.performer){
		this.createForm.reset(this.performer);
		}else{
		this.createForm.reset();
		}
	}

	submit(event:any) {
		this.isPromising = true;
		if(this.isEditMode) {
			let performerId = this.performer.Id;
			this.performer = new Performer(this.createForm.value);
			this.performer.Id = performerId;

			this.performerService.update(this.performer).subscribe( result => {
				this.saveRelations();
			}, error => {
				this.onErrorHandler({text: `<b>Sanatçı kaydedilemedi</b> Lütfen bütün gerekli alanları doldurun.<br/><small>${error.Message}</small>`, type:'warning', timeOut: 8000});
			}, () => {
				this.isPromising = false;
			});
		}else {
			this.performer = new Performer(this.createForm.value);
			this.performerService.save(this.performer).subscribe( result => {
				this.performer.Id = result;
				this.saveRelations(true);
			}, error => {
				this.onErrorHandler({text: `<b>Sanatçı kaydedilemedi</b> Lütfen bütün gerekli alanları doldurun.<br/><small>${error.Message}</small>`, type:'warning', timeOut: 8000});
			}, () => {
				this.isPromising = false;
			});
		}
	}

	typeChangeperformer($performer) {
		this.performerType.setValue($performer ? $performer['value'] : null);
	}
  	
	changePhoto(photo){
		this.createForm.patchValue({ 'Images': photo.data });
	}

	public attributeTypesServiceDataHandler() {
		this.attributeTypeService.setCustomEndpoint('List');
		this.attributeTypeService.query({pageSize:20, page:0});
		this.attributeTypeService.data.subscribe(payload => {
			let attributeTypes = [];
			if(payload && payload.length > 0){
				payload.forEach(item => {
					if(item.IsActive){
						attributeTypes.push({name:item.Id.toString(), label: item.Name, params:{attributeType: item}});
					}
				});
				this.attributeTypes = attributeTypes;
			}
		});
	}

	public attributeServiceDataHandler() {
		if(!this.performer || !this.performer.Id) return;
		
		this.entityAttributeService.data.subscribe(entityAttributes => {
			if(entityAttributes && entityAttributes.length > 0){
				
				this.promises.attributes.old = [];
				this.promises.attributes.new = [];
				this.attributes = [];

				let attribute,
					attributeData,
					entityAttribute;

				entityAttributes.forEach( entityAttributeData => {

					entityAttribute = new EntityAttribute({
						Id: entityAttributeData.Id,
						AttributeId: entityAttributeData.AttributeId,
						EntityId: entityAttributeData.EntityId,
						EntityTypeId: entityAttributeData.EntityTypeId,
						Value: entityAttributeData.Value,
						IsActive: entityAttributeData.IsActive,
						StartDate: entityAttributeData.StartDate,
						ExpireDate: entityAttributeData.ExpireDate
					});

					this.promises.attributes.old.push(entityAttribute);
					this.promises.attributes.new.push(entityAttribute);
					
					attributeData = entityAttributeData["AAttribute"];
					attribute = {
						name:attributeData.Id.toString(), 
						label: attributeData.Name, 
						type: {name: attributeData.AttributeTypeId.toString()}, 
						extraFieldType: entityAttributeData && entityAttributeData.Value ? "fuzzy" : null,
						extraFieldValue: entityAttributeData && entityAttributeData.Value ? entityAttributeData.Value : 0,
						params: {entityAttribute: entityAttribute, attribute: new Attribute(attributeData)}
					};
					if(attribute["extraFieldValue"]) attribute["label"] += " [ <i>f:</i><span>" + attribute["extraFieldValue"] + "</span>]"

					this.attributes.push(attribute);
				});
			}
		});
	}

	public resetAttributes(flushQuery:boolean = false) {
		if(this.promises.attributes.saved.create && this.promises.attributes.saved.update && this.promises.attributes.saved.delete) {
			this.promises.attributes.saved = {create: false, update: false, delete: false};
			this.promises.performer.saved.attributes = true;
			this.checkSaved();
			flushQuery = true;
		}
		if(flushQuery) {
			if(this.performer && this.performer.Id) {
				this.entityAttributeService.setCustomEndpoint('GetEntityAttributeList');
				this.entityAttributeService.query({pageSize: 50, filter: [{filter:'EntityId eq ' + this.performer.Id + ' and EntityTypeId eq '+this.entityTypeId+' and IsActive eq true'}]});
			}
		}
	}

	public attributesChangeHandler(event: {name: string, params: {entityAttribute?: EntityAttribute, attribute?: Attribute}}[]) {
		if(event) {
			this.promises.attributes.new = [];
			let entityAttribute:EntityAttribute;
			event.forEach( attributeData => {
				entityAttribute = this.promises.attributes.old.find( item => item.AttributeId.toString() == attributeData.name);
				if(!entityAttribute) {
					entityAttribute = new EntityAttribute({
						AttributeId: attributeData.params.attribute.Id || attributeData.params.attribute["key"],
						EntityTypeId: this.entityTypeId,
						EntityId: this.performer.Id,
						Value: attributeData["extraFieldValue"] ? parseInt(attributeData["extraFieldValue"]) : 0,
						StartDate: "2017-02-17T18:02:47.381Z",
						ExpireDate: "2017-02-28T18:02:47.381Z",
						IsActive: true
					});
				}
				this.promises.attributes.new.push(entityAttribute);
			});
		}
	}

	public attributesActionHandler(performer) {
		switch(performer.action) {
			case "remove":
				this.attributesChangeHandler(this.attributes);
			break;
		}
	}

	public checkSaved(){
		if(this.promises.performer.saved.attributes) {
			this.promises.performer.saved = {attributes: false};
			this.notificationService.add({text:'Sanatçı başarıyla kaydedildi.', type:'success'})
			this.tetherService.close(this.performer);
		}
	}

	public saveRelations(isNew: boolean = false) {
		this.saveAttributes(isNew);
	}

	public saveAttributes(isNew: boolean = false) {
		if(isNew && this.performer) { this.promises.attributes.new.map( item => item.EntityId = this.performer.Id) };
		let willUpdate: EntityAttribute[] = [];
		let willDelete: EntityAttribute[] = [].concat(this.promises.attributes.old);
		let willCreate: EntityAttribute[] = [].concat(this.promises.attributes.new);
		let sourceList: EntityAttribute[] = [].concat(this.promises.attributes.new);

		let item: EntityAttribute;
		let matchedItem: EntityAttribute;
		let action: string;
		
		while(sourceList.length > 0) {
			item = sourceList.shift();
			
			matchedItem = willDelete.find( entityAttribute => {
				return item.AttributeId == entityAttribute.AttributeId;
			});
			if(matchedItem) {
				willDelete.splice(willDelete.indexOf(matchedItem), 1);
				willCreate.splice(willCreate.indexOf(willCreate.find(createItem => matchedItem.AttributeId == createItem.AttributeId)), 1);
				willUpdate.push(item);
			}
		};

		if(willCreate.length > 0) {
			this.entityAttributeService.setCustomEndpoint('PostAll');
			this.entityAttributeService.create(willCreate).subscribe(
				response => {
					this.promises.attributes.saved.create = true;
					this.resetAttributes();
				},
				error => {
					console.log("error : ", error);
				}
			);
		}else {
			this.promises.attributes.saved.create = true;
			this.resetAttributes();
		}

		if(willUpdate.length > 0) {
			this.entityAttributeService.setCustomEndpoint('PutAll');
			this.entityAttributeService.update(willUpdate, 'put').subscribe(
				response => {
					this.promises.attributes.saved.update = true;
					this.resetAttributes();
				}, error => {
					console.log(JSON.stringify(error));
				}
			);
		}else {
			this.promises.attributes.saved.update = true;
			this.resetAttributes();
		}

		if(willDelete.length > 0) {
			willDelete.map( item => item.IsActive = false);
			this.entityAttributeService.setCustomEndpoint('PutAll');
			this.entityAttributeService.update(willDelete, 'put').subscribe(
				response => {
					this.promises.attributes.saved.delete = true;
					this.resetAttributes();
				}, error => {
					console.log(JSON.stringify(error));
				}
			);
		}else{
			this.promises.attributes.saved.delete = true;
			this.resetAttributes();
		}
	}

	public exit(event){
		this.tetherService.dismiss();
		this.router.navigate(["/performers"]);
	}
}
