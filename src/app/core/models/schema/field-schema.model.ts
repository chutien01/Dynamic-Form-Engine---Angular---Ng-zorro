import { FieldType } from './field-type.enum';

export interface FieldOption {
  label: string;
  value: any;
}

export interface FieldValidation {
  min?: number;
  max?: number;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
}

export interface BaseFieldSchema {
  id: string;             // ID duy nhất (uuidv4)
  key: string;            // Field Key cho FormControl và payload khi submit
  type: FieldType;        // Loại field
  label: string;          // Tên field hiển thị
  required?: boolean;
  defaultValue?: any;
  gridSpan?: number;      // Dành cho hệ thống grid (1-24 của ng-zorro)
  validations?: FieldValidation; // Các rule validate nâng cao
}

export interface TextFieldSchema extends BaseFieldSchema {
  type: FieldType.TEXT_INPUT;
  placeholder?: string;
}

export interface TextareaFieldSchema extends BaseFieldSchema {
  type: FieldType.TEXT_AREA;
  placeholder?: string;
}

export interface NumberFieldSchema extends BaseFieldSchema {
  type: FieldType.NUMBER;
  placeholder?: string;
}

export interface SelectFieldSchema extends BaseFieldSchema {
  type: FieldType.SELECT;
  placeholder?: string;
  options?: FieldOption[];
}

export interface RadioFieldSchema extends BaseFieldSchema {
  type: FieldType.RADIO_GROUP;
  options?: FieldOption[];
}

export interface CheckboxFieldSchema extends BaseFieldSchema {
  type: FieldType.CHECKBOX;
  options?: FieldOption[];
}

export interface DateFieldSchema extends BaseFieldSchema {
  type: FieldType.DATE_PICKER;
}

export type FieldSchema = 
  | TextFieldSchema 
  | TextareaFieldSchema 
  | NumberFieldSchema 
  | SelectFieldSchema 
  | RadioFieldSchema 
  | CheckboxFieldSchema 
  | DateFieldSchema;
