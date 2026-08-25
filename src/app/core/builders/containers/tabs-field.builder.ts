import { v4 as uuidv4 } from 'uuid';
import { FieldType } from '../../models/schema/field-type.enum';
import { TabsFieldSchema, ContainerChildItem } from '../../models/schema.model';
import { BaseFieldBuilder } from '../base/base-field.builder';

export class TabsFieldBuilder extends BaseFieldBuilder<TabsFieldSchema> {
  constructor() {
    super(FieldType.TABS);
    this.schema.label = 'Tabs Container';
    this.schema.tabType = 'line';
    this.schema.tabPosition = 'top';
    this.schema.items = [
      { id: uuidv4(), title: 'Tab 1', fields: [] },
      { id: uuidv4(), title: 'Tab 2', fields: [] }
    ];
  }

  setTabType(type: 'line' | 'card'): this {
    this.schema.tabType = type;
    return this;
  }

  setTabPosition(position: 'top' | 'left' | 'right' | 'bottom'): this {
    this.schema.tabPosition = position;
    return this;
  }

  setItems(items: ContainerChildItem[]): this {
    this.schema.items = items;
    return this;
  }
}
