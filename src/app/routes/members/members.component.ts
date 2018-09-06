import { Component, OnInit } from '@angular/core';
import { HeaderTitleService } from '../../services/header-title.service';
import { CrmMemberService } from '../../services/crm-member.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-members',
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.scss'],
  providers: [CrmMemberService]  
})
export class MembersComponent implements OnInit {
  
    isPromising = false;  
    startScreen = false;
    noDataInContent = false;
    noDataTitle = 'Yukarıdaki arama çubuğundan arama yapabilirsiniz';
    noDataDescription = 'Arama çubuğundan telefon numarası veya e-posta adresine göre arama yapabilirsiniz';
  
    searchOptions = {
      options: [
        {value: 'phoneNumber', text: 'Telefon Numarası ile' },
        {value: 'eMail', text: 'E-Posta Adresi ile' }
      ],
      placeholders: {
        phoneNumber: 'Telefon Numarası ile arama yapın',
        eMail: 'E-Posta Adresi ile arama yapın'
      },
    };
  
    constructor(
      private headerTitleService: HeaderTitleService,
      private crmMemberService: CrmMemberService,
      private router: Router
    ) {
      this.crmMemberService.setCustomEndpoint('SearchCustomers', true);
     }
  
    ngOnInit() {
      this.headerTitleService.setTitle('Müşteriler');
      this.headerTitleService.setLink('/members');
  
      this.startScreen = true;
      this.noDataInContent = false;
    }
  
    searchValueChanged(event) {
      if (event && event.searchValue && event.searchValue.length > 2) {
        this.isPromising = true;
        this.startScreen = false;
  
        let queryType: number;
        let format;
  
        switch (event.searchType) {
          case 'phoneNumber':
            queryType = 2;
            format = /^\d{10,12}$/;
            break;
          case 'eMail':
            queryType = 3;
            // format = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;
            format = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            break;
        }
  
        if (format.test(event.searchValue)) {
          this.searchCustomers(event.searchValue, queryType);
        } else {
          this.showInfo('invalid-search', queryType);
        }
      } else {
        this.startScreen = true;
      }
    }
  
    private searchCustomers(value, queryType){
      this.isPromising = true;
      
      let members = [];
      
      this.crmMemberService.searchCustomers(value, queryType).subscribe(
        data => {
          this.isPromising = false;
          members = data.EntityModel.Items;
          if (members.length < 1) {
              this.showInfo('no-data', queryType);
          } else if (members.length > 1) {
            this.showInfo('too-many-members', queryType);
          } else {
            let memberId = members[0].MemberId;
            this.router.navigate(['/member', memberId])
          }
        },
        error => {
          this.isPromising = false;
          this.showInfo('no-data', queryType);
        }
      );
  
    }
  
    private showInfo(reason, queryType) {
  
      let infoType = queryType === 2 ? 'telefon numarasına' : 'e-posta adresine';
      this.isPromising = false;
  
      switch (reason) {
        case 'too-many-members':
          this.noDataInContent = true;
          this.noDataTitle = `Aradığınız ${infoType} ait müşteri bilgisi bulunamadı`;
          this.noDataDescription = `Aradığınız ${infoType} ait birden fazla müşteri bulunmaktadır`;
          break;
        case 'invalid-search':
          this.noDataInContent = true;
          if (queryType === 2) {
            this.noDataTitle = 'Geçerli bir telefon numarası giriniz';
            this.noDataDescription = 'En az 10 rakamdan oluşan geçerli bir telefon numarası girerek yeniden deneyebilirsiniz';
          } else {
            this.noDataTitle = 'Geçerli bir e-posta adresi giriniz';
            this.noDataDescription = 'Geçerli bir e-posta adresi girerek yeniden deneyebilirsiniz';
          }
          break;
        case 'no-data':
        default:
            this.noDataInContent = true;
            this.noDataTitle = `Aradığınız ${infoType} ait müşteri bilgisi bulunamadı`;
            this.noDataDescription = 'Arama kriterini değiştirerek yeniden deneyebilirsiniz';
            break;
      }
    }
  }
