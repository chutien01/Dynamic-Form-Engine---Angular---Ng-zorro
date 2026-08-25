import { FieldSchema } from './field-schema.model';

export interface FormSchema {
  formId: string;
  title: string;
  description?: string;
  fields: FieldSchema[];
  layout: 'horizontal' | 'vertical' | 'inline';
}
