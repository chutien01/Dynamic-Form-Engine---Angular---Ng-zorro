import { FieldType } from '../../models/schema/field-type.enum';
import { SwitchFieldSchema } from '../../models/schema.model';
import { BaseFieldBuilder } from '../base/base-field.builder';

export class SwitchFieldBuilder extends BaseFieldBuilder<SwitchFieldSchema> {
  constructor() {
    super(FieldType.SWITCH);
    this.schema.defaultValue = false;
  }
}
