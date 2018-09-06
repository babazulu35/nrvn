import { BaseModel } from '../classes/base-model';

export class Attribute extends BaseModel{
    AttributeTypeId: number;
    AssignmentType: number;
    ValueType: number;
    IsActive: boolean;
    AttributeCode: string;
    IsLeaf: boolean;
    ParentId: number;
    Id: any;
    Localization: {
      Name?: string,
      Tr: {
        Name: string
      },
      En: {
        Name: string
      }
    }

}