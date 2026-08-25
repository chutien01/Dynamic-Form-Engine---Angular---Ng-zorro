import { FieldType } from '../../models/schema/field-type.enum';
import { TextFieldSchema } from '../../models/schema.model';
import { BaseFieldBuilder } from '../base/base-field.builder';

export class TextFieldBuilder extends BaseFieldBuilder<TextFieldSchema> {
  constructor() {
    super(FieldType.TEXT_INPUT);
  }
  setPlaceholder(placeholder: string): this {
    this.schema.placeholder = placeholder;
    return this;
  }
}
