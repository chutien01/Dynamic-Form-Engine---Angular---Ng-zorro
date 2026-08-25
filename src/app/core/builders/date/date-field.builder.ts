import { FieldType } from '../../models/schema/field-type.enum';
import { DateFieldSchema } from '../../models/schema.model';
import { BaseFieldBuilder } from '../base/base-field.builder';

export class DateFieldBuilder extends BaseFieldBuilder<DateFieldSchema> {
  constructor() {
    super(FieldType.DATE_PICKER);
  }
}
