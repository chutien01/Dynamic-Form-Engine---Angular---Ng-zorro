import { FieldType } from '../../models/schema/field-type.enum';
import { RadioFieldSchema } from '../../models/schema.model';
import { BaseOptionsFieldBuilder } from '../base/base-field.builder';

export class RadioFieldBuilder extends BaseOptionsFieldBuilder<RadioFieldSchema> {
  constructor() {
    super(FieldType.RADIO_GROUP);
  }
}
