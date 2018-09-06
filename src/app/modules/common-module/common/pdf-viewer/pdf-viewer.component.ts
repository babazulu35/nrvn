import { Component, OnInit, Input, AfterViewInit } from '@angular/core';
import { TetherDialog } from './../../../common-module/modules/tether-dialog/tether-dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
	selector: 'app-pdf-viewer',
	templateUrl: './pdf-viewer.component.html',
	styleUrls: ['./pdf-viewer.component.scss']
})
export class PdfViewerComponent implements OnInit, AfterViewInit {

	@Input()
	src: string;

	@Input()
	isPrintDialog: boolean;	

	source: SafeResourceUrl = null;

	constructor(
		public sanitizer: DomSanitizer,
		public tetherDialog: TetherDialog,
	) {
	}

	ngOnInit() {
		this.source = this.sanitizer.bypassSecurityTrustResourceUrl(this.src);
	}

	ngAfterViewInit() {

		if (this.isPrintDialog)  {

			const timeout = 1000;

			setTimeout(() => {
				if (document)  {
					const iframe = <any>document.getElementById('printFrame');
					if (iframe) {
						const printWindow = iframe.contentWindow;
						printWindow.print();
					}
				}
			}, timeout);
		}
	}

}
