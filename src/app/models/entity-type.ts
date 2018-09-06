import { BaseModel } from '../classes/base-model';

export class EntityType extends BaseModel{
	EntityTypeCode: string;
    EntityTypeName: string;
    IsActive: boolean;
    Id: number;
}
