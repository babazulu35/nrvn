import { Component, OnInit, ViewChild, ChangeDetectorRef, HostBinding, Input, Inject } from '@angular/core';
import { WizardHeaderComponent } from './../../../common-module/components/wizard-header/wizard-header.component';
import { LocalizationBoxComponent } from './../../../base-module/components/localization-box/localization-box.component';
import { TetherDialog } from './../../../common-module/modules/tether-dialog/tether-dialog'
import { Template } from './../../../../models/template';
import { TemplateService } from './../../../../services/template.service';
import { SelectboxComponent } from './../../../base-module/components/selectbox/selectbox.component';

@Component({
  selector: 'app-template-create-wizard',
  templateUrl: './template-create-wizard.component.html',
  styleUrls: ['./template-create-wizard.component.scss']
})
export class TemplateCreateWizardComponent implements OnInit {

  constructor(
    private changeDetector: ChangeDetectorRef,
    public tetherService: TetherDialog,
    @Inject('templateLocalizationService') private templateLocalizationService: TemplateService
  ) { }

  @ViewChild(WizardHeaderComponent) wizardHeader: WizardHeaderComponent;
  @ViewChild('Localization') localizationComponent: LocalizationBoxComponent;
  @ViewChild('HallSelectbox') hallSelectbox: SelectboxComponent;
  

  @HostBinding('class.c-template-create-wizard') true;

  @Input() title: string;
  @Input() isEditMode: boolean = false;
  @Input() template :Template;

  currentLevel: { key: string, title: string, hasScroll?: boolean, params?: any };
  currentLevelIndex: number = 0;
  levels: { key: string, title: string, hasScroll?: boolean, params?: any }[];

  isLoading: boolean = false;

  @Input() set hallSelectOptions (values :any[]){
    if(values && values.length > 0){
      this.options = [];
      values.forEach( value => {
        this.options.push({
          value: value.Id,
          text: value.Localization.Name,
          disabled: false
        });
        value++;
      });
    }
  }

  options: {value: any, text: String, disabled?: Boolean}[];

  public validation: {
		Localization: { isValid: any, message: string }
	} = {
		Localization: {
			message: "Lütfen tüm alanları doldurun",
			isValid(): boolean {
        let isLocalizationValid = this.localizationComponent ? this.localizationComponent.isValid : true;
        let isModalLocalizationValid = this.template ? this.template.isValid('Name', true) : false;
        let isModalHallValid = this.template && this.hallSelectbox ? this.template.isValid('HallId') : true;
        return isLocalizationValid && isModalLocalizationValid && isModalHallValid;
			}
		}
	};

	public get isValid():boolean {
		if( this.validation
			&& this.validation.Localization.isValid.call(this)
			){
			return true;
		}else{
			return false
		}
	};

  ngOnInit() {

    this.levels = [];
    this.levels.push({ key: "localization", title: "İSİM VERİN", hasScroll: false });
    this.levels.push({ key: "addHall", title: "SALON SEÇİN", hasScroll: false });

    this.gotoLevel(0);
    this.changeDetector.detectChanges();

    if(!this.template){
      this.template = new Template({
        HallId: null,
        Localization: null,
        LayoutImage: null
      });
    }

  }

  nextLevel() {
    this.gotoLevel(Math.min(this.currentLevelIndex + 1, this.levels.length - 1));
  }

  levelHandler(event) {
    if (event.nextLevel == true) {
      this.nextLevel();
    }
  }

  previousLevel() {
    this.gotoLevel(Math.max(this.currentLevelIndex - 1, 0));
    if (this.currentLevelIndex == 0 || this.currentLevelIndex == 2) {
    }
  }

  gotoLevel(key: any) {
    let self = this;
    if (Number.isInteger(key)) {
      this.currentLevelIndex = key;
    } else {
      this.levels.forEach(function (item, index) {
        if (item.key == key) {
          self.currentLevelIndex = index;
          return;
        }
      });
    }
    let targetLevel = this.levels[this.currentLevelIndex];
    if (targetLevel != this.currentLevel) {
      this.currentLevel = targetLevel;
    }

    switch (this.currentLevel.key) {
      case "field":

        break;
      case "settings":
        // this.currentLevel.title = this.selectedCmsField.Label.toUpperCase() + " AYARLARI";
        break;
    }
    setTimeout(function () {
      // if(self.firstTextInput) self.firstTextInput.focus();
    }, 150);

    this.tetherService.position();
    this.changeDetector.detectChanges();
  }

  localizationChangeHandler(event){
    this.template.set("Name", event, true);
  }

  selectboxChangeHandler(event){
    this.template.set("HallId", event);
  }

  photoChangeHandler(event){
    this.template.set("LayoutImage", event["data"]);
  }

  submitClickHandler(event){
    if(!this.currentLevel) return;
    // if(this.isValid){
	    switch(this.currentLevel.key) {
        case "localization":
        // if(this.isValid){
          this.nextLevel();
          this.title = "Salon Ekleyin";
        // }          
	      break;
        case "addHall":     
          this.tetherService.close(this.template);
        break;
	      default:
	      	this.nextLevel();
	      break;
	    }
    // }
  }

  wizardActionHandler(event:{action: string, params?: any}) {
    switch(event.action) {
      case "goBack":
        this.previousLevel();
        this.title = "Oturma Düzeni Ekle"
      break;
    }
  }

}
