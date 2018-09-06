import { BaseModel } from '../classes/base-model';

export class VariantType extends BaseModel {
    Id: number;
    Localization?: {
        Name: string,
        Tr?: {
            Name: string,
        },
        En?: {
            Name: string
        }
    }
}