import { v4 as uuidv4 } from 'uuid';
import { FieldType } from '../../models/schema/field-type.enum';
import { CollapseFieldSchema, ContainerChildItem } from '../../models/schema.model';
import { BaseFieldBuilder } from '../base/base-field.builder';

export class CollapseFieldBuilder extends BaseFieldBuilder<CollapseFieldSchema> {
  constructor() {
    super(FieldType.COLLAPSE);
    this.schema.label = 'Collapse Section';
    this.schema.accordion = false;
    this.schema.bordered = true;
    this.schema.items = [
      { id: uuidv4(), title: 'Panel 1', fields: [] },
      { id: uuidv4(), title: 'Panel 2', fields: [] }
    ];
  }

  setAccordion(accordion: boolean): this {
    this.schema.accordion = accordion;
    return this;
  }

  setBordered(bordered: boolean): this {
    this.schema.bordered = bordered;
    return this;
  }

  setItems(items: ContainerChildItem[]): this {
    this.schema.items = items;
    return this;
  }
}
