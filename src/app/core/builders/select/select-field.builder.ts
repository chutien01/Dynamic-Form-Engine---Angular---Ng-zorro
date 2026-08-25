import { FieldType } from '../../models/schema/field-type.enum';
import { SelectFieldSchema } from '../../models/schema.model';
import { BaseOptionsFieldBuilder } from '../base/base-field.builder';

export class SelectFieldBuilder extends BaseOptionsFieldBuilder<SelectFieldSchema> {
  constructor() {
    super(FieldType.SELECT);
  }
  setPlaceholder(placeholder: string): this {
    this.schema.placeholder = placeholder;
    return this;
  }
}
