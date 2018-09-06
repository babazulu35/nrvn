import { TetherDialog } from './../../../common-module/modules/tether-dialog/tether-dialog';
import { TextInputComponent } from './../../../base-module/components/text-input/text-input.component';
import { GuestFormComponent } from './../../../common-module/components/guest-form/guest-form.component';
import { WizardHeaderComponent } from './../../../common-module/components/wizard-header/wizard-header.component';
import { Component, OnInit, EventEmitter, Output, HostBinding, ChangeDetectorRef, ViewChild, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';


@Component({
	selector: 'app-group-sale-contact',
	templateUrl: './group-sale-contact.component.html',
	styleUrls: ['./group-sale-contact.component.scss']
})
export class GroupSaleContactComponent implements OnInit {
	@ViewChild(WizardHeaderComponent) wizardHeader: WizardHeaderComponent;
	@ViewChild(GuestFormComponent) guestForm: GuestFormComponent;
	@ViewChild('firstTextInput') firstTextInput: TextInputComponent;
  	
	@HostBinding('class.oc-group-sale-contact') true;

	@Output() formSubmitEvent: EventEmitter<any> = new EventEmitter();
	@Output() levelChangeEvent: EventEmitter<any> = new EventEmitter();

	@Input() title: string;

	public customer: {
		PhoneNumber: string,
		Name: string,
		Surname: string,
		Email: string,
		MemberId?: number
	};
	public groupSaleOptions: {};
	public guestFormIsOpen: boolean;
  	public isLoading: boolean;

	public currentLevel: { key: string, title: string, hasScroll?: boolean, params?:any };
  	public currentLevelIndex: number = 0;
	public levels: { key: string, title: string, hasScroll?: boolean, params?:any }[];

	public validation: {
		TotalAmount: { isValid: any, message: string },
		TotalTicketingFee: { isValid: any, message: string },
		TotalServiceFee: { isValid: any, message: string },
		InvoiceNo: { isValid: any, message: string },
		Customer: { isValid: any, message: string }
		} = {
		TotalAmount: {
			message: "Toplam tutar bilgisi zorunludur.",
			isValid(): boolean {
				return this.currentLevel.key != "groupSaleOptions" ? true : this.groupSaleOptions && this.groupSaleOptions.TotalAmount >= 0;
			}
		},
		TotalTicketingFee: {
			message: "Toplam biletleme bedeli bilgisi zorunludur.",
			isValid(): boolean {
				return this.currentLevel.key != "groupSaleOptions" ? true : this.groupSaleOptions && this.groupSaleOptions.TotalTicketingFee >= 0;
			}
		},
		TotalServiceFee: {
			message: "Toplam hizmet bedeli bilgisi zorunludur.",
			isValid(): boolean {
				return this.currentLevel.key != "groupSaleOptions" ? true : this.groupSaleOptions && this.groupSaleOptions.TotalServiceFee >= 0;
			}
		},
		InvoiceNo: {
			message: "Faturan no zorunludur.",
			isValid(): boolean {
				return this.currentLevel.key != "groupSaleOptions" ? true : this.groupSaleOptions && this.groupSaleOptions.InvoiceNo && this.groupSaleOptions.InvoiceNo.length > 0;
			}
		},
		Customer: {
			message: "Ürün seçimi zorunludur.",
			isValid(): boolean {
				return this.guestForm ? this.guestForm.isValid : this.customer;
			}
		}
	};

	public get isValid():boolean {
		if( this.validation
			&& this.validation.TotalAmount.isValid.call(this)
			&& this.validation.TotalTicketingFee.isValid.call(this)
			&& this.validation.TotalServiceFee.isValid.call(this)
			&& this.validation.InvoiceNo.isValid.call(this)
			&& this.validation.Customer.isValid.call(this)
			){
			return true;
		}else{
			return false
		}
	};

	constructor(
		public tetherService: TetherDialog,
		public changeDetector: ChangeDetectorRef
	) { }

	ngOnInit() {
		if(!this.title) this.title = "Grup Satış Yapın";
		
		this.levels = [];
		this.levels.push({key: "customer", title: "MÜŞTERİ EKLEYİN", hasScroll: false});
		this.levels.push({key: "groupSaleOptions", title: "GRUP SATIŞ AYARLARI", hasScroll: true});
		this.gotoLevel(0);
	}

	public nextLevel() {
		this.gotoLevel(Math.min(this.currentLevelIndex + 1, this.levels.length-1));
	}

	public levelHandler(event) {
		if(event.nextLevel == true) {
			this.nextLevel();   
		}
	}
  
  previousLevel() {
    this.gotoLevel(Math.max(this.currentLevelIndex - 1, 0));
    if(this.currentLevelIndex == 0 || this.currentLevelIndex == 2) {
    }
  }
  
	public gotoLevel(key: any) {
		if(Number.isInteger(key)) {
			this.currentLevelIndex = key;
		}else{
			let self = this;
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
			case "customer":
				if(!this.guestFormIsOpen) this.customer = null;
			break;
			case "groupSaleOptions":
				this.groupSaleOptions = {
					TotalAmount: ""
				};
				let self = this;
				setTimeout(function() {
					if(self.firstTextInput) self.firstTextInput.focus();
				}, 200);
			break;
		}
		this.tetherService.position();
		this.changeDetector.detectChanges();
		this.levelChangeEvent.emit(this.currentLevel);
	}
  
	public wizardActionHandler(event:{action: string, params?: any}) {
		switch(event.action) {
			case "goBack":
			this.previousLevel();
			break;
		}
	}

	public inputChangeHandler(event:any, name:string, target?:string) {
		switch(name) {
			default: 
				target ? this[target][name] = event : this.groupSaleOptions[name] = event;
			break;
		}
	}

	public customerActionHandler(event) {
		switch(event.action) {
			case "showGuestUserForm":
				this.guestFormIsOpen = true;
			break;
			case "selectItem":
				this.customer = event.params.customer;
			break;
		}
	}

	public submitClickHandler(event){
		if(!this.currentLevel) return;
		if(this.isValid){
			switch(this.currentLevel.key) {
			case "groupSaleOptions":
				this.tetherService.close({
					customer:this.customer,
					groupSaleOptions:this.groupSaleOptions
				});
			break;
			case "customer":
				if(this.guestForm && this.guestForm.customer) {
					this.customer = {
						Name: this.guestForm.customer.Name,
						Surname: this.guestForm.customer.Surname,
						PhoneNumber: this.guestForm.customer.PhoneNumber,
						Email: this.guestForm.customer.Email
					}
				};
				this.nextLevel();
			break;
			default:
				this.nextLevel();
			break;
			}
		}
	}
}
