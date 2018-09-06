import {BaseModel} from '../classes/base-model';

export class Price extends BaseModel{
	Id: number;
	ProductId: number;
  	IsEnabled: boolean;
  	Price: number;
  	BeginDate: Date;
  	EndDate: Date;
  	Localization: {
    	Tr: {
      		Name: string;
      		Info: string;
    	},
    	En: {
      		Name: string;
      		Info: string;
   		}
  	}
}