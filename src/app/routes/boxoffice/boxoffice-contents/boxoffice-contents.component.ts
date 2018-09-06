import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-boxoffice-contents',
  templateUrl: './boxoffice-contents.component.html',
  styleUrls: ['./boxoffice-contents.component.scss']
})
export class BoxofficeContentsComponent implements OnInit {

 public customerSearchResult:Array<Object>;
  constructor() { }

  ngOnInit() {
    this.customerSearchResult = [{ title:"test"}];  
}

}
