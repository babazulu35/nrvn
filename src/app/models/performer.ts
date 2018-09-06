import {BaseModel} from '../classes/base-model';

export class Performer extends BaseModel{
	Id: number;
	Name: string;
	PerformerName: string;
	Type: string;
	IsActive: boolean;
	Images: string;
	StaticPageUrl: string;
	FacebookUrl: string;
	TwitterUrl: string;
	YoutubeUrl: string;
}
