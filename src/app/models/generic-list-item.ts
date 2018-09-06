import { BaseModel } from '../classes/base-model';

export class GenericListItem extends BaseModel{
	Id?: any;
	Label: string;
	Value: any;
	Params?: {};
	Selected?: boolean;
	Disabled?: boolean;
}