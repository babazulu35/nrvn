import { Attribute } from './attribute';
import { BaseModel } from '../classes/base-model';

export class EntityAttribute extends BaseModel{
	AttributeId: number;
    EntityTypeId: number;
    EntityId: number;
    Value: number;
    StartDate: Date;
    ExpireDate: Date;
    IsActive: boolean;
    Id: number;
    Attribute?:Attribute;
}
