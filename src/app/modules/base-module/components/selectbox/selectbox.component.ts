import { Component, OnInit, EventEmitter, Output, Input, HostBinding, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { isEqual } from "lodash";

@Component({
	selector: 'app-selectbox',
	templateUrl: './selectbox.component.html',
	styleUrls: ['./selectbox.component.scss']
})
export class SelectboxComponent implements OnInit {
	@HostBinding('class') class = 'c-selectbox';
	@Output() changeEvent : EventEmitter<any> = new EventEmitter<any>();

	@HostBinding('class.c-selectbox--disabled') @Input() isDisabled: boolean = false;
	@HostBinding('class.c-selectbox--focused') @Input() isFocused: boolean = false;

	@Input() value: any;
	@Input() options:{ value: any, text: string, disabled?: boolean}[];
	@Input() showNoOptionText:boolean = true;
	@Input() form:FormGroup;
	@Input() placeholder:string;
	@Input() required:boolean;
	@Input() theme:string;
	@Input() default:string;
	@Input() name:string;

	isSelected:any;
	optionName:string = "Seçiniz" ;

	@Input()
	set numberRanges(data: Object) {
		if(data && data['max']) {
			if(!data['min']) data['min'] = 0;
			let count = data['max'] - data['min'] + 1;
			this.options = Array(count).fill({}).map((item,index) => item = {value: data['min']+index, text: data['min']+index + (data['label'] || '')});
			if(data["placeholder"]) this.options.unshift({value: 0, text: data["placeholder"]});
		}
	}

	@Input() selectedIndex : number = 0;

	public formControl: FormControl = new FormControl({value: this.value, disabled: this.isDisabled});

	constructor(
		private changeDetector: ChangeDetectorRef
	) { }

	ngOnInit() {
		if(!this.options || !this.options.length) return;
		if(this.form && this.name) {
			this.form.addControl(this.name, this.formControl);
			
			this.formControl.statusChanges.subscribe( status => {
				this.isDisabled = status == "DISABLED";
			});
		}
		if(this.placeholder && this.placeholder.length && this.options[0].text != this.placeholder) this.options.unshift({text: this.placeholder, value: null});
		if(this.value == null && this.options && this.options.length) this.value = this.options[0]['value'];
		if(this.options && this.options.length) {
			let equalItem = this.options.find( item => {
				return isEqual(this.value, item.value);
			});
			if(equalItem) equalItem.value = this.value;
		}
		this.changeDetector.detectChanges();
	}

	ngOnChanges(changes) {
		if(changes.isDisabled && this.formControl) {
			changes.isDisabled.currentValue ? this.formControl.disable() : this.formControl.enable();
		}
	}

	ngOnDestroy() {
		if(this.formControl && this.form) {
			this.form.removeControl(this.name);
			this.formControl = null;
		}
	}

	onFocus() {
		this.isFocused = true;
	}

	onFocusOut() {
		this.isFocused = false;
	}

	select(value){
		if(this.value == value) return;
		this.value = value;
		if(this.formControl) this.formControl.setValue(this.value);
		this.changeEvent.emit(this.value);
	}

	changeHandler($event){
		if(this.formControl) this.formControl.setValue(this.value);
		this.changeEvent.emit(this.value);
	}
}