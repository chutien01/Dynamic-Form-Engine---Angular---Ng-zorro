import { FieldType } from '../models/schema/field-type.enum';
import { BaseFieldBuilder } from './base/base-field.builder';
import { TextFieldBuilder } from './text/text-field.builder';
import { TextareaFieldBuilder } from './textarea/textarea-field.builder';
import { NumberFieldBuilder } from './number/number-field.builder';
import { SelectFieldBuilder } from './select/select-field.builder';
import { RadioFieldBuilder } from './radio/radio-field.builder';
import { CheckboxFieldBuilder } from './checkbox/checkbox-field.builder';
import { DateFieldBuilder } from './date/date-field.builder';
import { SwitchFieldBuilder } from './switch/switch-field.builder';
import { DateRangeFieldBuilder } from './date-range/date-range-field.builder';
import { RateFieldBuilder } from './rate/rate-field.builder';
import { SliderFieldBuilder } from './slider/slider-field.builder';
import { FileUploadFieldBuilder } from './file-upload/file-upload-field.builder';
import { CardFieldBuilder } from './containers/card-field.builder';
import { TabsFieldBuilder } from './containers/tabs-field.builder';
import { CollapseFieldBuilder } from './containers/collapse-field.builder';
import { StepsFieldBuilder } from './containers/steps-field.builder';

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
      case FieldType.SWITCH:
      case 'switch':
        return new SwitchFieldBuilder();
      case FieldType.DATE_RANGE:
      case 'date_range':
        return new DateRangeFieldBuilder();
      case FieldType.RATE:
      case 'rate':
        return new RateFieldBuilder();
      case FieldType.SLIDER:
      case 'slider':
        return new SliderFieldBuilder();
      case FieldType.FILE_UPLOAD:
      case 'file_upload':
        return new FileUploadFieldBuilder();
      case FieldType.CARD:
      case 'card':
        return new CardFieldBuilder();
      case FieldType.TABS:
      case 'tabs':
        return new TabsFieldBuilder();
      case FieldType.COLLAPSE:
      case 'collapse':
        return new CollapseFieldBuilder();
      case FieldType.STEPS:
      case 'steps':
        return new StepsFieldBuilder();
      default: throw new Error(`Unsupported field type: ${type}`);
    }
  }
}
