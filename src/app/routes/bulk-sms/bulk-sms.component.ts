import { Component, OnInit } from '@angular/core';
import { TransactionServiceService } from './../../services/transaction-service.service';
import { NotificationService } from './../../services/notification.service';
import { AppSettingsService } from './../../services/app-settings.service';


@Component({
	selector: 'app-bulk-sms',
	templateUrl: './bulk-sms.component.html',
	styleUrls: ['./bulk-sms.component.scss'],
	providers: [TransactionServiceService, AppSettingsService]
})
export class BulkSmsComponent implements OnInit {
	errorMessage;

	errorList = [];
	infoList = [];
	messageList = [];
	rows = [];
	maxRowCount;
	maxMessageLength = 320;

	isLoading: boolean = false;

	constructor(
		private transactionServiceService: TransactionServiceService,
		private notificationService: NotificationService,
		private appSettings: AppSettingsService,
	){
		this.transactionServiceService.setCustomEndpoint("SendCustomSms");
	}

	ngOnInit() {
		this.maxRowCount = this.appSettings.getLocalSettings('bulkSMSMaxCSVRowCount');
	}

	isValid(){
		if(this.maxRowCount && this.rows.length > this.maxRowCount) {
			return false;
		}
		return this.errorList.length == 0 && this.rows.length > 0;
	}

	onInputChange(value) {
		this.messageList = [];
		this.rows = [];
		if (!value || !value.trim()) {
			return;
		}
		
		let linesArr = this.csvToArray(value.trim());

		if (this.maxRowCount && linesArr.length > this.maxRowCount) {
			this.messageList.push({
				type: 'danger',
				message: `En fazla ${this.maxRowCount} satır ekleyebilirsiniz.`
			});
			return;
		}

		linesArr.forEach((line, index) => {
			let message = {type: 'danger', message: ''};

			if (line === null) {
				message.message = `${index + 1}. satırdaki format hatalı.`;
			} else if (line.length !== 2) {
				message.message = `${index + 1}. satırdaki sütun sayısı hatalı.`;
			} else if (!line[0] || !line[1]) {
				message.message = `${index + 1}. satırdaki sütun sayısı hatalı.`;
			} else if (!(/^[0-9]+$/).test(line[0])) {
				message.message = `${index + 1}. satırdaki telefon numarası hatalı.`;
			} else if (line[1].length > this.maxMessageLength) {
				message.message = `${index + 1}. satırdaki mesaj ${line[1].length} karakter. max ${this.maxMessageLength}`;
			} else {
				message.type = 'success';
				message.message = `${index + 1}. satır ${line[1].length} karakter.`;
				this.rows.push(line);
			}

			this.messageList.push(message);
		});
	}

	csvToArray(text) {
		let p = '', row = [''], ret = [row], i = 0, r = 0, s = !0, l;
		for (l in text) {
			if (l) {
				l = text[l];
				// if ('"' === l) {
				// 	if (s && l === p) row[i] += l;
				// 	s = !s;
				// } else if ('|' === l && s) {
				if ('|' === l && s) {
					l = row[++i] = '';
				} else if ('\n' === l && s) {
					if ('\r' === p) row[i] = row[i].slice(0, -1);
					row = ret[++r] = [l = '']; i = 0;
				} else {
					row[i] += l;
				}
				p = l;
			}
		}
		return ret;
	};

	sendSMS(event){
		if (!this.rows.length) {return;}

		let payload = {
			"SmsList": []
		}
		this.rows.forEach(row=>{
			payload.SmsList.push(		    {
				"PhoneNumber": row[0],
				"Message": row[1]
		    });
		});

		this.isLoading = true;
		this.transactionServiceService.save(payload).subscribe(response=>{
			this.isLoading = false;
			this.notificationService.add({ text: 'İşlem başarılı.', type: 'success' });
		}, error=>{
			console.log("<-------sendSMS error------->", error);

			this.errorMessage = <any>error;
			this.isLoading = false;
			this.notificationService.add({ text: 'İşlem başarısız.', type: 'danger' });
		});
	}
}
