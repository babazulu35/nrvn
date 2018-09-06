import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Performance } from '../../../../models/performance';
import { Color } from '../../../../classes/color';

class Pill {
  id: number;
  name: string;
  price: number;
  currency: string;
  color: Color;
  selected: boolean;
}

class ProductGroup {
  title: string;
  date: string;
  products: Pill[];
}

@Component({
  selector: 'app-product-pill-group',
  templateUrl: './product-pill-group.component.html',
  styleUrls: ['./product-pill-group.component.scss']
})
export class ProductPillGroupComponent implements OnInit {

  @Input() performances: any[];
  productGroups: ProductGroup[] = [];
  selectedPillIds: number[] = [];
  @Output() selectedPillsChanged = new EventEmitter<number[]>();

  colors = [
    'aqua', 'chartreuse', 'burlywood', 'blueviolet', 'deeppink', 'gold',
    'aquamarine', 'greenyellow', 'darkgoldenrod', 'lightslategrey', 'mediumvioletred', 'lightsalmon',
    'cyan', 'lime', 'darkkhaki', 'lightblue', 'orchid', 'orange',
    'dodgerblue', 'palegreen', 'goldenrod', 'purple', 'palevioletred', 'sandybrown',
    'mediumturquoise', 'springgreen', 'khaki', 'steelblue', 'salmon', 'lightcoral',
    'skyblue', 'yellowgreen', 'peru', 'teal', 'tomato', 'bisque',
  ];

  constructor() { }

  ngOnInit() {
    if (this.performances) {
      let i = 0;

      this.performances.forEach(p => {
        let performanceTitle = p.Name;
        let performanceDate = p.DateTime;
        let products: Pill[] = [];

        p.Products.forEach(pr => {
          let price = pr.Variants.reduce((prev, curr) => prev.FaceAmount < curr.FaceAmount ? prev : curr);
          let product = {
            id: pr.Id,
            name: pr.Name,
            price: price.FaceAmount,
            currency: price.Price.Currency,
            color: new Color(this.colors[i]),
            selected: false
          };
          products.push(product);
          i = i === this.colors.length - 1 ? 0 : i + 1;
        });
        let productGroup = {title: performanceTitle, date: performanceDate, products: products};
        this.productGroups.push(productGroup);
      });
    }
  }

  toggle(pill: Pill) {
    if (pill.selected) {
      this.selectedPillIds = this.selectedPillIds.filter(p => p !== pill.id);
    } else {
      this.selectedPillIds.push(pill.id);
    }
    pill.selected = !pill.selected;
    this.selectedPillsChanged.emit(this.selectedPillIds);
  }
}
