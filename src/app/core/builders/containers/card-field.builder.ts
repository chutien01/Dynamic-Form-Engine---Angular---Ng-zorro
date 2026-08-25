import { FieldType } from '../../models/schema/field-type.enum';
import { CardFieldSchema, FieldSchema } from '../../models/schema.model';
import { BaseFieldBuilder } from '../base/base-field.builder';

export class CardFieldBuilder extends BaseFieldBuilder<CardFieldSchema> {
  constructor() {
    super(FieldType.CARD);
    this.schema.label = 'Card Section';
    this.schema.bordered = true;
    this.schema.fields = [];
  }

  setBordered(bordered: boolean): this {
    this.schema.bordered = bordered;
    return this;
  }

  setFields(fields: FieldSchema[]): this {
    this.schema.fields = fields;
    return this;
  }
}
