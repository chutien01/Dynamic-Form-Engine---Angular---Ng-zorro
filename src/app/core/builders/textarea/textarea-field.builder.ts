import { FieldType } from '../../models/schema/field-type.enum';
import { TextareaFieldSchema } from '../../models/schema.model';
import { BaseFieldBuilder } from '../base/base-field.builder';

export class TextareaFieldBuilder extends BaseFieldBuilder<TextareaFieldSchema> {
  constructor() {
    super(FieldType.TEXT_AREA);
  }
  setPlaceholder(placeholder: string): this {
    this.schema.placeholder = placeholder;
    return this;
  }
}
