import { FieldType } from '../../models/schema/field-type.enum';
import { NumberFieldSchema } from '../../models/schema.model';
import { BaseFieldBuilder } from '../base/base-field.builder';

export class NumberFieldBuilder extends BaseFieldBuilder<NumberFieldSchema> {
  constructor() {
    super(FieldType.NUMBER);
  }
  setPlaceholder(placeholder: string): this {
    this.schema.placeholder = placeholder;
    return this;
  }
}
