export class CmsField {
    FieldType: string;
    Label: string;
    Icon: string;
    Name?: string;
    UniqueName?: string;
    Required?: boolean;
    HelperText?: string;
    Settings: {
        Label: string,
        Key: string,
        Value: any,
        ComponentType: string,
        ComponentOptions?: any
    }[];
}