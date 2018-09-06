import { BaseModel } from '../classes/base-model';

export class MenuItem extends BaseModel{
	Id: number;
	Url: string;
	ClassName: string;
	Type: number;
	Sort: number;
	IsActive: boolean;
	ParentId: number;
	Localization: {
	Tr: {
	  Label: string;
	},
	En: {
	  Label: string;
	}
	}
}