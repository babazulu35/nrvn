import { CmsDataService } from './../../../../services/cms-data.service';
import { AppSettingsService } from './../../../../services/app-settings.service';
import { TetherDialog } from './../../../common-module/modules/tether-dialog/tether-dialog';
import { TextInputComponent } from './../../../base-module/components/text-input/text-input.component';
import { Component, OnInit, ViewChild, HostBinding, HostListener, Input, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-datasource-parameter-create-box',
  templateUrl: './datasource-parameter-create-box.component.html',
  styleUrls: ['./datasource-parameter-create-box.component.scss']
})
export class DatasourceParameterCreateBoxComponent implements OnInit {
  @ViewChild(TextInputComponent) firstTextInput: TextInputComponent;
  
  @HostBinding('class.oc-datasource-parameter-create-box') true;

  @HostListener('keyup.enter') enterHandler(){
    if(this.isValid) this.submitClickHandler(null);
  };

  @Input() title: string;
  @Input() parameter: {
    key: string,
    type: string,
    label: string,
    relatedEntityType?: string,
    allowMultiple?: boolean
  };
  @Input() isEditMode: boolean = false;

  parameterTypes: { value: any, text: string }[];
  entityTypes: { value: any, text: string }[];
  contentTypes: { value: any, text: string }[];
  contentType: string;

  public validation: {
    parameter: { isValid: any, message: string }
  } = {
    parameter: {
      message: "Bütün alanlar zorunludur",
      isValid(): boolean {
        return this.parameter && this.parameter.key && this.parameter.type
      }
    }
  };

  public get isValid():boolean {
    if( this.validation
      && this.validation.parameter.isValid.call(this)
      ){
      return true;
    }else{
      return false
    }
  };

  constructor(
    private cmsDataService: CmsDataService,
    private appSettingsService: AppSettingsService,
    public tetherService: TetherDialog,
    private changeDetector: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.isEditMode = this.parameter != null;

    let entityTypes = this.appSettingsService.getLocalSettings('entityTypes');
    this.entityTypes = [];
    this.entityTypes.push({text: "Seçiniz", value: '-1'});
    entityTypes.forEach( item => this.entityTypes.push({text: item.label, value: item.endpoint || item.name}));

    this.parameterTypes = [];
    this.parameterTypes.push({text: "Query Parameter", value: "queryParams"});
    this.parameterTypes.push({text: "Body Parameter", value: "body"});
    this.parameterTypes.push({text: "Header Parameter", value: "header"});

    this.cmsDataService.getAllContentTypes().subscribe( result => {
      if(result && result.length) {
        this.contentTypes = [];
        result.forEach( item => {
          let fields: any[] = [];
          this.contentTypes.push({text: item.Name, value: item._id});
        });
      }
    });

    
    if(this.isEditMode) {
      if(!this.title) this.title = "Parametre Düzenle";
      let relatedEntityParts: string[] = this.parameter.relatedEntityType.split("/");
      if(relatedEntityParts.length > 1) {
        this.parameter.relatedEntityType = relatedEntityParts[0];
        this.contentType = relatedEntityParts[1];
      }
    }else{
      if(!this.title) this.title = "Parametre Ekle";
      this.parameter = {
        key: null,
        type: this.parameterTypes[0].value,
        label: null
      }
    }

    let self = this;
    setTimeout(function() {
      if(self.firstTextInput) self.firstTextInput.focus();
    }, 150);
  }

  inputChangeHandler(event:any, name:string, target?:any) {
    switch(name){
      case "contentType":
        this.contentType = event;
      break;
      default: 
        target ? target[name] = event : this.parameter[name] = event;
    }
  }

  submitClickHandler(event){
    if(this.contentType) this.parameter.relatedEntityType += "/"+this.contentType;
    if(this.isValid) this.tetherService.close(this.parameter);
  }

}
  