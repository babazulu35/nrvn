import { BaseModel } from '../classes/base-model';

export class CrmAnonymousUser extends BaseModel{
	FirstName: string;
	LastName: string;
	Email: string;
	PhoneNumber: string;
	CrmMemberId: number;
	AnonymousMemberId?: number;
}
