import { FieldType } from '../../models/schema/field-type.enum';
import { CheckboxFieldSchema } from '../../models/schema.model';
import { BaseOptionsFieldBuilder } from '../base/base-field.builder';

export class CheckboxFieldBuilder extends BaseOptionsFieldBuilder<CheckboxFieldSchema> {
  constructor() {
    super(FieldType.CHECKBOX);
  }
}
