import { FieldType } from '../../models/schema/field-type.enum';
import { CheckboxFieldSchema, FieldOption } from '../../models/schema.model';
import { BaseFieldBuilder } from '../base/base-field.builder';

export class CheckboxFieldBuilder extends BaseFieldBuilder<CheckboxFieldSchema> {
  constructor() {
    super(FieldType.CHECKBOX);
    this.schema.label = 'Checkbox';
    this.schema.defaultValue = false;
  }

  setOptions(options: FieldOption[]): this {
    this.schema.options = options;
    return this;
  }
}
