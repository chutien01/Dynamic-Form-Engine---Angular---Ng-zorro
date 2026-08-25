import { FieldType } from '../models/schema/field-type.enum';
import { BaseFieldBuilder } from './base/base-field.builder';
import { TextFieldBuilder } from './text/text-field.builder';
import { TextareaFieldBuilder } from './textarea/textarea-field.builder';
import { NumberFieldBuilder } from './number/number-field.builder';
import { SelectFieldBuilder } from './select/select-field.builder';
import { RadioFieldBuilder } from './radio/radio-field.builder';
import { CheckboxFieldBuilder } from './checkbox/checkbox-field.builder';
import { DateFieldBuilder } from './date/date-field.builder';

export class FieldBuilderFactory {
  static create(type: FieldType | string): BaseFieldBuilder<any> {
    switch (type) {
      case FieldType.TEXT_INPUT:
      case FieldType.TEXT:
      case 'text':
        return new TextFieldBuilder();
      case FieldType.TEXT_AREA:
      case FieldType.TEXTAREA:
      case 'textarea':
        return new TextareaFieldBuilder();
      case FieldType.NUMBER:
      case 'number':
        return new NumberFieldBuilder();
      case FieldType.SELECT:
      case 'select':
        return new SelectFieldBuilder();
      case FieldType.RADIO_GROUP:
      case FieldType.RADIO:
      case 'radio':
        return new RadioFieldBuilder();
      case FieldType.CHECKBOX:
      case 'checkbox':
        return new CheckboxFieldBuilder();
      case FieldType.DATE_PICKER:
      case FieldType.DATE:
      case 'date':
        return new DateFieldBuilder();
      default: throw new Error(`Unsupported field type: ${type}`);
    }
  }
}
