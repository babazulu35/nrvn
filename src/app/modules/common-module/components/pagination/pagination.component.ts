import { Component, OnInit, OnChanges, Input, Output, EventEmitter, HostBinding } from '@angular/core';

@Component({
    selector: 'app-pagination',
    templateUrl: './pagination.component.html',
    styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent implements OnChanges, OnInit {
    page: number;
    @Input() totalItem: number;
    @Input() showItemPerPage: number;
    @Input() currentPage: number;
    @Input() options;
    @Input() size: string = "lg";
    showSelectbox:boolean = true;
    @Output() transistPage: EventEmitter<number> = new EventEmitter<number>();
    @Output() changeEvent: EventEmitter<any> = new EventEmitter<any>();
    //@HostBinding('class') class = 'c-pagination';
    
    maxPage: number;
    collapseAfterPage: number = 5;
    pages: number[];
    hasPrevious: boolean;
    hasNext: boolean;
    isCollapsed: boolean = true;
    constructor() { }
    ngOnChanges() {
        
        this.currentPage = (this.currentPage && this.currentPage > 0) ? this.currentPage : 1;
        this.isCollapsed = true;
        this.calculatePages();
        this.showSelectbox = this.options && this.options[0] ? this.totalItem > this.options[0].value : false;

        // console.log("Show Selectbox", this.showSelectbox, "Show Total Item", this.totalItem, "Show Options 0", this.options[0]);
        this.isCollapsed = (this.maxPage >= this.collapseAfterPage) ? true : false;
    }
    ngOnInit() {
        
        this.calculatePages();
    }
    calculatePages() {
        this.maxPage = Math.ceil(this.totalItem / this.showItemPerPage);

        let pages: number[] = [],
            i: number = 1;
        if (this.maxPage < this.collapseAfterPage) {
            this.isCollapsed = false;
            
        }
        for (let page = (this.currentPage == 1 || !this.isCollapsed || this.currentPage - 1 <= 0) ? 1 : this.currentPage - 1; page <= this.maxPage; page++) {
            if (!this.isCollapsed) {
                pages.push(page);
            } else {
                if (i < this.collapseAfterPage - 1) {
                    pages.push(page);
                }
            }
            i++;
        }
        if (i < this.collapseAfterPage) {
            if (this.collapseAfterPage - i == 1 && pages[0] - 1 > 0) {
                pages.unshift(pages[0] - 1);
            }
            if (this.collapseAfterPage - i == 2 && pages[0] - 2 > 0 && pages[0] - 1 > 0) {
                pages.unshift(pages[0] - 2, pages[0] - 1);
            }
        }
        this.hasPrevious = (this.currentPage == 1) ? false : true;
        this.hasNext = (this.currentPage == this.maxPage) ? false : true;
        this.pages = pages;
    }
    expand(): void {
        this.isCollapsed = false;
        this.calculatePages();
    }
    goToPage(page) {
        if (page !== this.currentPage && page > 0 && page <= this.maxPage) {
            this.currentPage = page;
            this.transistPage.emit(page);
            this.calculatePages();
        }
    }
    changePageSize(event) {
        this.goToPage(1);
        this.changeEvent.emit(event);
    }
}
