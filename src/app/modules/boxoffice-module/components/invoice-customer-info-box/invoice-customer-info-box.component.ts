import { Component, OnInit, Input } from '@angular/core';
import { TetherDialog } from '../../../common-module/modules/tether-dialog/tether-dialog';
import { InvoiceCustomerInfo } from '../../../../models/invoice-customer-info';

@Component({
  selector: 'app-invoice-customer-info-box',
  templateUrl: './invoice-customer-info-box.component.html',
  styleUrls: ['./invoice-customer-info-box.component.scss']
})
export class InvoiceCustomerInfoBoxComponent implements OnInit {

  @Input() invoiceCustomerInfo: InvoiceCustomerInfo;
  get isCorporateCustomer():boolean {
    return this.invoiceCustomerInfo && this.invoiceCustomerInfo.NationalIdentityNumber
                                    && this.invoiceCustomerInfo.NationalIdentityNumber.length < 11;
  }

  get isValid(): boolean {
    if (this.invoiceCustomerInfo) {
      return this.invoiceCustomerInfo && this.invoiceCustomerInfo.Address
                                      && this.invoiceCustomerInfo.Address.length && this.invoiceCustomerInfo.Address.length > 0
                                      && this.invoiceCustomerInfo.CityName
                                      && this.invoiceCustomerInfo.CityName.length && this.invoiceCustomerInfo.CityName.length > 0
                                      && this.invoiceCustomerInfo.CitySubdivisionName
                                      && this.invoiceCustomerInfo.CitySubdivisionName.length && this.invoiceCustomerInfo.CitySubdivisionName.length > 0
                                      && this.invoiceCustomerInfo.Country 
                                      && this.invoiceCustomerInfo.Country.length && this.invoiceCustomerInfo.Country.length > 0
                                      && this.invoiceCustomerInfo.Email
                                      && this.invoiceCustomerInfo.Email.length && this.invoiceCustomerInfo.Email.length > 0
                                      && this.invoiceCustomerInfo.FirstName
                                      && this.invoiceCustomerInfo.FirstName.length && this.invoiceCustomerInfo.FirstName.length > 0
                                      && this.invoiceCustomerInfo.NationalIdentityNumber
                                      && this.invoiceCustomerInfo.NationalIdentityNumber.length && this.invoiceCustomerInfo.NationalIdentityNumber.length > 0
                                      && ((!this.isCorporateCustomer && this.invoiceCustomerInfo.FamilyName && this.invoiceCustomerInfo.FamilyName.length && this.invoiceCustomerInfo.FamilyName.length > 0) || this.isCorporateCustomer);
    }
  }

  constructor(
    public tetherDialog: TetherDialog,
  ) { }

  ngOnInit() {
    
  }

  inputChangeHandler(e, key) {
    if (!this.invoiceCustomerInfo) this.invoiceCustomerInfo = new InvoiceCustomerInfo();
    switch (key) {
      case 'Email':
        this.invoiceCustomerInfo.Email = e;
        break;
      case 'FirstName':
        this.invoiceCustomerInfo.FirstName = e;
        break;
      case 'FamilyName':
        this.invoiceCustomerInfo.FamilyName = e;
        break;
      case 'Country':
        this.invoiceCustomerInfo.Country = e;
        break;
      case 'CityName':
        this.invoiceCustomerInfo.CityName = e;
        break;
      case 'CitySubdivisionName':
        this.invoiceCustomerInfo.CitySubdivisionName = e;
        break;
      case 'Address':
        this.invoiceCustomerInfo.Address = e;
        break;
      default:
        break;
    }
  }

  submitClickHandler(e) {
    if (!this.invoiceCustomerInfo) return;
    this.invoiceCustomerInfo.FamilyName = this.invoiceCustomerInfo.FamilyName || '-';
    this.tetherDialog.close({invoiceCustomerInfo: this.invoiceCustomerInfo});
  }

}
