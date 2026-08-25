import { FieldType } from '../../models/schema/field-type.enum';
import { DateRangeFieldSchema } from '../../models/schema.model';
import { BaseFieldBuilder } from '../base/base-field.builder';

export class DateRangeFieldBuilder extends BaseFieldBuilder<DateRangeFieldSchema> {
  constructor() {
    super(FieldType.DATE_RANGE);
  }

  setPlaceholder(placeholder: [string, string] | string): this {
    this.schema.placeholder = placeholder;
    return this;
  }
}
