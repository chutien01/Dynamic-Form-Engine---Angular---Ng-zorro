import { v4 as uuidv4 } from 'uuid';
import { FieldType } from '../../models/schema/field-type.enum';
import { StepsFieldSchema, ContainerChildItem } from '../../models/schema.model';
import { BaseFieldBuilder } from '../base/base-field.builder';

export class StepsFieldBuilder extends BaseFieldBuilder<StepsFieldSchema> {
  constructor() {
    super(FieldType.STEPS);
    this.schema.label = 'Step Wizard';
    this.schema.direction = 'horizontal';
    this.schema.size = 'default';
    this.schema.items = [
      { id: uuidv4(), title: 'Step 1', description: 'First step details', fields: [] },
      { id: uuidv4(), title: 'Step 2', description: 'Second step details', fields: [] }
    ];
  }

  setDirection(direction: 'horizontal' | 'vertical'): this {
    this.schema.direction = direction;
    return this;
  }

  setItems(items: ContainerChildItem[]): this {
    this.schema.items = items;
    return this;
  }
}
