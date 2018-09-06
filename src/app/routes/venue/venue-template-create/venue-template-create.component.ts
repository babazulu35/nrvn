import { VenueTemplateEditorComponent } from './../../../modules/common-module/components/venue-template-editor/venue-template-editor.component';
import { NotificationService } from './../../../services/notification.service';
import { Component, OnInit, HostBinding, ComponentRef, ComponentFactoryResolver, AfterViewInit, ElementRef, ViewChild, Renderer, Inject, Injector } from '@angular/core';
import { AuthenticationService } from './../../../services/authentication.service';
import { Router, ActivatedRoute } from '@angular/router';
import { TemplateService } from './../../../services/template.service';
import { PerformanceService } from './../../../services/performance.service';
import { environment } from '../../../../environments/environment';
import { Template } from '../../../models/template';
import { TetherDialog } from './../../../modules/common-module/modules/tether-dialog/tether-dialog'
import { EntityService } from '../../../services/entity.service';
import { TemplateCreateWizardComponent } from './../../../modules/backstage-module/common/template-create-wizard/template-create-wizard.component';
@Component({
	selector: 'app-venue-template-create',
	templateUrl: './venue-template-create.component.html',
	styleUrls: ['./venue-template-create.component.scss'],
	entryComponents: [ TemplateCreateWizardComponent ],
	providers:  [
		{ provide: 'deleteTemplateByPerformance', useClass: TemplateService },
		{ provide: 'copyVenueTemplateService', useClass: PerformanceService },
		{ provide: 'templateLocalizationService', useClass: TemplateService },
		{ provide: 'entityService', useClass: EntityService },
		TemplateService, PerformanceService, EntityService]
})
export class VenueTemplateCreateComponent implements OnInit, AfterViewInit {
	@ViewChild('venued') venued: ElementRef;
	@ViewChild(VenueTemplateEditorComponent) venueEditor: VenueTemplateEditorComponent;

	@HostBinding('class.or-venue-template-create') true;
	@HostBinding('class.main-loader') isLoading: boolean = false;

	editorIsShown: boolean = false;
	editorRole: string;
	venueId;
	performanceId: any;
	venueTemplateId: any;
	templateName: string;
	isPromising: boolean = false;
	isEdit: boolean = false;
	stayOnPage: boolean = false;
	template: Template;
	// tSub: any;
	// templateSub: any;
	subscription: any;
	halls: any[];

	validation: {
		TemplateName: { isValid: any, message: string },
	} = {
			TemplateName: {
				message: "Oturma düzeni adı zorunludur.",
				isValid(): boolean {
					return this.template && this.template.isValid('Name', true);
				}
			},
		};

	get isValid(): boolean {
		if (this.validation && this.validation.TemplateName.isValid.call(this)) {
			return true;
		} else {
			return false
		}
	};

	constructor(
		private elementRef: ElementRef,
		private authenticationService: AuthenticationService,
		private renderer: Renderer,
		private router: Router,
		private route: ActivatedRoute,
		private templateService: TemplateService,
		private performanceService: PerformanceService,
		@Inject('deleteTemplateByPerformance') private deleteTemplateByPerformance: TemplateService,
		@Inject('copyVenueTemplateService') private copyVenueTemplateService: PerformanceService,
		@Inject('templateLocalizationService') private templateLocalizationService: TemplateService,
		private notificationService: NotificationService,
		private resolver: ComponentFactoryResolver,
		public tether: TetherDialog,
		private injector: Injector,
		public entityService: EntityService
	) {
		this.route.params.subscribe(params => {
			if (params) {
				this.venueId = +params["id"];
				this.route.queryParams.subscribe(queryParams => {
					this.performanceId = parseInt(queryParams["performanceId"]);
					this.venueTemplateId = parseInt(queryParams["venueTemplateId"]);
				})
			};
		})
	}

	ngOnInit() {
		let sub = null;
		this.isLoading = true;
		if (this.venueTemplateId) {
			this.templateService.flushCustomEndpoint();
			this.templateService.find(this.venueTemplateId, true);
			// this.templateSub = this.templateService.data.subscribe(template => {
			this.templateService.data.subscribe(template => {
				if (template != undefined && template.length == 1 && template[0]) {
					console.log("template = ", template);
					this.template = template[0];
					this.getLocalization();
					console.log("venue template = ", this.template);
				}
				this.isLoading = false;
			});
		}
		if (this.venueTemplateId && this.performanceId) {
			this.editorRole = VenueTemplateEditorComponent.ROLE_PERFORMANCE;
			this.isEdit = true;
			this.editorIsShown = true;
		} else if (this.venueTemplateId && !this.performanceId) {
			this.editorRole = VenueTemplateEditorComponent.ROLE_VENUE;
			this.isEdit = true;
			this.editorIsShown = true;
		} else {
			this.editorRole = VenueTemplateEditorComponent.ROLE_VENUE;
			this.editorIsShown = true;
			this.isLoading = false;
		}		

		this.entityService.data.subscribe(
			result => {
			  this.isLoading = false;
			  let resultArr = [];
			  resultArr = result;
			  if(resultArr.length > 0){
				result[0].Halls.length > 0 ? this.halls = result[0].Halls.filter(hall => hall.IsActive) : this.halls = null;				
			  }else{
				this.halls = null;          
			  }
			},
			error => {
				console.log("hall sub data error = ", error);
			}
		  );

		this.getVenues();
	}

	
	getVenues(){

		this.subscription = this.entityService.queryParamSubject.subscribe(
			params => {
	  
			  this.entityService.setCustomEndpoint("GetAll");
			  let query = this.entityService.fromEntity('VVenue')
				.where('Id', '=', this.venueId)
				.expand(['Halls', 'Localization'])
				.take(1000)
				.page(0);
	  
			  query.executeQuery();
			},
			error => {
				console.log("error venue hall = ", error);
			}
		  );

	}

	getLocalization() {
		// if (this.templateSub) this.templateSub.unsubscribe();
		if (this.template) {
			this.templateLocalizationService.flushCustomEndpoint();
			this.templateLocalizationService.find(this.template.Id, true);
			// this.tSub = this.tService.data.subscribe( result => {
			this.templateLocalizationService.data.subscribe(result => {
				if (result && result[0]) {
					this.template.setLocalization(result[0]['Localization']);
					this.titleChangeHandler(this.template.Localization['Name']);
				}
			});
		}
	}

	ngAfterViewInit() {

	}

	venueEditorEventHandler(event) {
		switch (event.type) {
			case VenueTemplateEditorComponent.EVENT_READY:
				this.isLoading = false;
				let self = this;
				setTimeout(function () {
					self.venueEditor.resize();
				}, 2000);
				break;
			case VenueTemplateEditorComponent.EVENT_SAVE_SUCCESS:
				this.isPromising = false;
				if (!this.stayOnPage) {
					if (this.performanceId) {
						this.router.navigate(['performance', this.performanceId, 'edit']);
					} else {
						this.router.navigate(['venue', this.venueId, 'layouts']);
					}
				}
				this.notificationService.add({ type: "success", text: "Kayıt işlemi başarıyla gerçekleştirildi." });
				break;
			case VenueTemplateEditorComponent.EVENT_SAVE_FAIL:
				this.isPromising = false;
				this.notificationService.add({ type: "danger", text: "Kayıt işlemi gerçekleştirilemedi!" });
				break;
		}
	}

	titleChangeHandler(value) {
		if (value) {
			if (!this.template) this.template = new Template();
			this.templateName = value;
			this.template.set('Name', value, true);

			// if (this.tSub) this.tSub.unsubscribe();
		}
	}

	titleActionHandler(event) {
		switch (event.action) {
			case "openTemplateSettingBox":
				this.openTemplateSettingBox();
				break;
		}
	}

	componentCreateWizard: any;
	openTemplateSettingBox() {
		//todo open box
		let component: ComponentRef<TemplateCreateWizardComponent> = this.resolver.resolveComponentFactory(TemplateCreateWizardComponent).create(this.injector);
		this.componentCreateWizard = component.instance;
		this.componentCreateWizard.isEditMode = this.isEdit;
		this.componentCreateWizard.title = this.isEdit ? "Salon Düzenle" : "Salon Ekle";
		this.componentCreateWizard.template = this.template;
		this.componentCreateWizard.hallSelectOptions = this.halls;

		this.tether.modal(component, {
			escapeKeyIsActive: true
		}).then(result => {
			this.template = result;
			this.titleChangeHandler(this.template.Localization["Name"]);
		}).catch(reason => {
			console.log(reason);
		});
	}
	saveTemplate() {
		this.stayOnPage = false;
		this.isPromising = true;
		// this.venueEditor.save({name: this.template.Localization.Name});
		// TEMP: API Değişmeli -- MT
		// this.venueEditor.save({name: this.templateName['tr-TR']});

		this.venueEditor.save({ name: this.template.get('Name', true),
								hallId: this.template.get('HallId'),
								layoutImage: this.template.get('LayoutImage') });
	}

	saveTemplateAndContinue(event?: any) {
		this.stayOnPage = true;
		this.isPromising = true;
		// this.venueEditor.save({name: this.template.Localization.Name});
		// TEMP: API Değişmeli -- MT
		// this.venueEditor.save({name: this.templateName['tr-TR']});
		this.venueEditor.save({ name: this.template.get('Name', true),
								hallId: this.template.get('HallId'),
								layoutImage: this.template.get('LayoutImage') });
	}

	exit(event?: any) {
		if (this.performanceId) {
			this.router.navigate(['performance', this.performanceId, 'edit']);
		} else {
			if (this.venueId) this.router.navigate(['venue', this.venueId, 'layouts']);
		}
	}

}




