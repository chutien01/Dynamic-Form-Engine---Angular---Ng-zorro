import { FieldType } from './field-type.enum';

export interface FieldOption<T = unknown> {
  label: string;
  value: T;
}

export interface FieldValidation {
  min?: number;
  max?: number;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
}

export type ConditionOperator = 
  | 'equals' 
  | 'not_equals' 
  | 'contains' 
  | 'in' 
  | 'not_in' 
  | 'is_empty' 
  | 'is_not_empty'
  | 'greater_than'
  | 'less_than';

export type ConditionAction = 'show' | 'hide' | 'enable' | 'disable';

export interface FieldConditionRule {
  fieldKey: string;             // Key của field làm điều kiện
  operator: ConditionOperator;  // Toán tử so sánh
  value?: unknown;              // Giá trị so sánh
}

export interface FieldConditions {
  action: ConditionAction;      // Hành động khi điều kiện thỏa mãn
  rules: FieldConditionRule[];  // Danh sách các rule
  matchType?: 'all' | 'any';    // AND ('all') hoặc OR ('any') - mặc định 'all'
}

export interface BaseFieldSchema {
  id: string;             // ID duy nhất (uuidv4)
  key: string;            // Field Key cho FormControl và payload khi submit
  type: FieldType;        // Loại field
  label: string;          // Tên field hiển thị
  required?: boolean;
  defaultValue?: unknown;
  gridSpan?: number;      // Dành cho hệ thống grid (1-24 của ng-zorro)
  validations?: FieldValidation; // Các rule validate nâng cao
  conditions?: FieldConditions;  // Quy tắc phụ thuộc điều kiện (Conditional logic)
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
  min?: number;
  max?: number;
  step?: number;
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
  placeholder?: string;
}

export interface SwitchFieldSchema extends BaseFieldSchema {
  type: FieldType.SWITCH;
}

export interface DateRangeFieldSchema extends BaseFieldSchema {
  type: FieldType.DATE_RANGE;
  placeholder?: [string, string] | string;
}

export interface RateFieldSchema extends BaseFieldSchema {
  type: FieldType.RATE;
  count?: number;
  allowHalf?: boolean;
}

export interface SliderFieldSchema extends BaseFieldSchema {
  type: FieldType.SLIDER;
  min?: number;
  max?: number;
  step?: number;
}

export interface FileUploadFieldSchema extends BaseFieldSchema {
  type: FieldType.FILE_UPLOAD;
  maxCount?: number;
  accept?: string;
}

// Container Child Item (Dùng cho từng Tab / Panel / Step)
export interface ContainerChildItem {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  fields: FieldSchema[];
}

export interface CardFieldSchema extends BaseFieldSchema {
  type: FieldType.CARD;
  bordered?: boolean;
  fields: FieldSchema[];
}

export interface TabsFieldSchema extends BaseFieldSchema {
  type: FieldType.TABS;
  tabType?: 'line' | 'card';
  tabPosition?: 'top' | 'left' | 'right' | 'bottom';
  items: ContainerChildItem[];
}

export interface CollapseFieldSchema extends BaseFieldSchema {
  type: FieldType.COLLAPSE;
  accordion?: boolean;
  bordered?: boolean;
  items: ContainerChildItem[];
}

export interface StepsFieldSchema extends BaseFieldSchema {
  type: FieldType.STEPS;
  direction?: 'horizontal' | 'vertical';
  size?: 'default' | 'small';
  items: ContainerChildItem[];
}

export type FieldSchema = 
  | TextFieldSchema 
  | TextareaFieldSchema 
  | NumberFieldSchema 
  | SelectFieldSchema 
  | RadioFieldSchema 
  | CheckboxFieldSchema 
  | DateFieldSchema
  | SwitchFieldSchema
  | DateRangeFieldSchema
  | RateFieldSchema
  | SliderFieldSchema
  | FileUploadFieldSchema
  | CardFieldSchema
  | TabsFieldSchema
  | CollapseFieldSchema
  | StepsFieldSchema;
