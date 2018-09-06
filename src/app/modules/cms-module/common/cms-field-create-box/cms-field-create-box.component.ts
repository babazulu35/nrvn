import { CmsDataService } from './../../../../services/cms-data.service';
import { AppSettingsService } from './../../../../services/app-settings.service';
import { CmsField } from './../../../../models/cms-field';
import { TetherDialog } from './../../../common-module/modules/tether-dialog/tether-dialog';
import { FormGroup } from '@angular/forms';
import { TextInputComponent } from './../../../base-module/components/text-input/text-input.component';
import { WizardHeaderComponent } from './../../../common-module/components/wizard-header/wizard-header.component';
import { Component, OnInit, HostBinding, ViewChild, HostListener, Input, ChangeDetectorRef } from '@angular/core';
import { UpperCasePipe } from '@angular/common';

@Component({
  selector: 'app-cms-field-create-box',
  templateUrl: './cms-field-create-box.component.html',
  styleUrls: ['./cms-field-create-box.component.scss']
})
export class CmsFieldCreateBoxComponent implements OnInit {
  @ViewChild(WizardHeaderComponent) wizardHeader: WizardHeaderComponent;
  @ViewChild(TextInputComponent) firstTextInput: TextInputComponent;

  @HostBinding('class.oc-cms-field-create-box') true;

  @HostListener('keyup.enter') enterHandler(){
    if(this.currentLevel && this.currentLevel.key == 'params' && this.isValid) this.submitClickHandler(null);
  };

  @Input() title: string;
  @Input() component: {
    Name: string,
    UniqueName: string,
    AllowMultiple: boolean
  };
  @Input() field: {
    FieldType: string,
    Name: string,
    UniqueName: string,
    Required: boolean,
    Settings?: any
  };
  @Input() isEditMode: boolean = false;
  
  fieldForm: FormGroup = new FormGroup({});
  settingsForm: FormGroup = new FormGroup({});

  currentLevel: { key: string, title: string, hasScroll?: boolean, params?:any };
  currentLevelIndex: number = 0;
  levels: { key: string, title: string, hasScroll?: boolean, params?:any }[];

  cmsFieldsList: {text: string, value: any}[];
  cmsFields: CmsField[];
  selectedCmsField: CmsField;
  lovOptions: {text: string, value: any}[];
  helpTextTypes: {text: string, value: any}[];

  public isLoading: boolean;
  public isPromising: boolean;

  public validation: {
		FieldParams: { isValid: any, message: string },
    Settings: { isValid: any, message: string }
	} = {
		FieldParams: {
			message: "Zorunlu alanlar girilmeli",
			isValid(): boolean {
				return this.currentLevel && this.currentLevel.key == "field" ? this.fieldForm && this.fieldForm.valid && this.selectedCmsField != null : true;
			}
		},
    Settings: {
      message: "Zorunlu alanlar girilmeli",
			isValid(): boolean {
				return this.currentLevel && this.currentLevel.key == "settings" ? this.settingsForm && this.settingsForm.valid : true;
			}
    }
	};

	public get isValid():boolean {
		if( this.validation
			&& this.validation.FieldParams.isValid.call(this)
      && this.validation.Settings.isValid.call(this)
			){
			return true;
		}else{
			return false
		}
	};

  constructor(
    public tetherService: TetherDialog,
    private changeDetector: ChangeDetectorRef,
    private appSettingsService: AppSettingsService,
    private cmsDataService: CmsDataService
  ) { }

  ngOnInit() {
    this.isLoading = true;
    this.isEditMode = this.field != null;
    
    this.cmsFields = this.appSettingsService.getLocalSettings('cmsFields');
    this.cmsFieldsList = [];
    this.cmsFieldsList.push({text: "Seçiniz", value: null})
    this.cmsFields.forEach( cmsField => this.cmsFieldsList.push({
      text: cmsField.Label + " (" + cmsField.FieldType + ")",
      value: cmsField.FieldType
    }));

    this.helpTextTypes = [];
    this.helpTextTypes.push({text: "Bilgi Mesajı", value: 'info'});
    this.helpTextTypes.push({text: "Uyarı Mesajı", value: 'warning'});
    this.helpTextTypes.push({text: "Olumsuz, Geri Dönüş Mesajı", value: 'danger'});
    this.helpTextTypes.push({text: "Olumlu, Geri Dönüş Mesajı", value: 'success'});
    this.levels = [];
    this.levels.push({key: "field", title: "GLOBAL AYARLAR", hasScroll: true});
    this.levels.push({key: "settings", title: "AYARLARI", hasScroll: true});

    this.cmsDataService.getLovs().subscribe( result => {
      if(result && result.length) {
        this.lovOptions = [];
        let options: {text: string, value: any}[];
        result.forEach( item => {
          if(item.KeyValueItems && item.KeyValueItems.length) {
            options = [];
            item.KeyValueItems.forEach( keyValueItem => options.push({text: keyValueItem.label, value: keyValueItem.value}));
          }
          this.lovOptions.push({text: item.Name || item._id, value: options});
        });
      }
      this.isLoading = false;

      if(this.isEditMode) {
        if(!this.title) this.title = "Alan Düzenle";
        if(this.field && this.field.FieldType) this.inputChangeHandler(this.field.FieldType, 'FieldType');
        if(!this.field.Settings) this.field.Settings = {};
      }else{
        if(!this.title) this.title = "Alan Ekle";
        this.field = {
          FieldType: null,
          Name: null,
          UniqueName: null,
          Required: false,
          Settings: {}
        }
      }
  
      this.gotoLevel(0);
      this.changeDetector.detectChanges();

    });
  }

  nextLevel() {
    this.gotoLevel(Math.min(this.currentLevelIndex + 1, this.levels.length-1));
  }

  levelHandler(event) {
    if(event.nextLevel == true) {
      this.nextLevel();   
    }
  }
  
  previousLevel() {
    this.gotoLevel(Math.max(this.currentLevelIndex - 1, 0));
    if(this.currentLevelIndex == 0 || this.currentLevelIndex == 2) {
    }
  }
  
  gotoLevel(key: any) {
    let self = this;
    if(Number.isInteger(key)) {
      this.currentLevelIndex = key;
    }else{
      this.levels.forEach(function(item, index){
        if(item.key == key) {
          self.currentLevelIndex = index;
          return;
        }
      });
    }
    let targetLevel = this.levels[this.currentLevelIndex];
    if(targetLevel != this.currentLevel) {
      this.currentLevel = targetLevel;
    }

    switch(this.currentLevel.key) {
      case "field":
        
      break;
      case "settings":
        this.currentLevel.title = this.selectedCmsField.Label.toUpperCase() + " AYARLARI";
      break;
    }
    setTimeout(function() {
      if(self.firstTextInput) self.firstTextInput.focus();
    }, 150);

    this.tetherService.position();
    this.changeDetector.detectChanges();
  }

  wizardActionHandler(event:{action: string, params?: any}) {
    switch(event.action) {
      case "goBack":
        this.previousLevel();
      break;
    }
  }

  inputChangeHandler(event:any, name:string, target?:any) {
    switch(name){
      case "FieldType":
        this.field.FieldType = event;
        this.selectedCmsField = this.cmsFields.find( cmsField => cmsField.FieldType == event);
        switch(this.selectedCmsField.FieldType) {
          case 'Selectbox':
            this.selectedCmsField.Settings.forEach( settingItem => {
              if(settingItem.ComponentType == "selectbox" && settingItem.Key == "options"){
                if(settingItem.ComponentOptions.options == "lovs") settingItem.ComponentOptions.options = this.lovOptions;
              }
            });
          break;
        }
      break;
      // case "maxlength":
      //   this.field.Settings["maxlength"] = event;
      //   this.field["Length"] = event;
      // break;
      // case "allowMultiLang":
      //   this.field.Settings["allowMultiLang"] = event;
      //   this.field["MultiLang"] = event;
      // break;
      default: 
        target ? target[name] = event : this.field[name] = event;
    }
    this.changeDetector.detectChanges();
  }

  submitClickHandler(event){
    if(!this.currentLevel) return;
    if(this.isValid){
	    switch(this.currentLevel.key) {
	      case "field":
          this.nextLevel();
	      break;
        case "settings":
          this.tetherService.close({component: this.component, field: this.field});
        break;
	      default:
	      	this.nextLevel();
	      break;
	    }
    }
  }
}
