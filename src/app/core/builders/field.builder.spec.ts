import '@angular/compiler';
import { describe, it, expect } from 'vitest';
import { FieldType } from '../models/schema/field-type.enum';
import { 
  FieldBuilderFactory, 
  TextFieldBuilder, 
  NumberFieldBuilder,
  SliderFieldBuilder,
  RateFieldBuilder,
  FileUploadFieldBuilder,
  CardFieldBuilder,
  TabsFieldBuilder,
  CollapseFieldBuilder,
  StepsFieldBuilder
} from './field.builder';
import { extractAllLeafFields, extractAllFieldsRecursive } from '../utils/schema.utils';

describe('FieldBuilderFactory and Builders', () => {
  it('should generate a valid UUID and correct type on initialization', () => {
    const builder = FieldBuilderFactory.create(FieldType.TEXT_INPUT) as TextFieldBuilder;
    const schema = builder.build();
    
    expect(schema.id).toBeDefined();
    expect(typeof schema.id).toBe('string');
    expect(schema.id.length).toBeGreaterThan(0);
    expect(schema.key).toBeDefined();
    expect(schema.type).toBe(FieldType.TEXT_INPUT);
    expect(schema.label).toBe('New Field');
  });

  it('should correctly set label, key, placeholder, and required', () => {
    const schema = (FieldBuilderFactory.create(FieldType.NUMBER) as NumberFieldBuilder)
      .setKey('user_age')
      .setLabel('Age')
      .setPlaceholder('Enter your age')
      .setRequired(true)
      .build();

    expect(schema.key).toBe('user_age');
    expect(schema.label).toBe('Age');
    expect(schema.placeholder).toBe('Enter your age');
    expect(schema.required).toBe(true);
  });

  it('should correctly build new field types: Switch, Slider, Rate, FileUpload', () => {
    const switchSchema = FieldBuilderFactory.create(FieldType.SWITCH).build();
    expect(switchSchema.type).toBe(FieldType.SWITCH);
    expect(switchSchema.defaultValue).toBe(false);

    const sliderSchema = (FieldBuilderFactory.create(FieldType.SLIDER) as SliderFieldBuilder)
      .setRange(10, 50, 5)
      .build();
    expect(sliderSchema.type).toBe(FieldType.SLIDER);
    expect(sliderSchema.min).toBe(10);
    expect(sliderSchema.max).toBe(50);
    expect(sliderSchema.step).toBe(5);

    const rateSchema = (FieldBuilderFactory.create(FieldType.RATE) as RateFieldBuilder)
      .setCount(10)
      .setAllowHalf(true)
      .build();
    expect(rateSchema.type).toBe(FieldType.RATE);
    expect(rateSchema.count).toBe(10);
    expect(rateSchema.allowHalf).toBe(true);

    const uploadSchema = (FieldBuilderFactory.create(FieldType.FILE_UPLOAD) as FileUploadFieldBuilder)
      .setMaxCount(5)
      .setAccept('.png,.pdf')
      .build();
    expect(uploadSchema.type).toBe(FieldType.FILE_UPLOAD);
    expect(uploadSchema.maxCount).toBe(5);
    expect(uploadSchema.accept).toBe('.png,.pdf');
  });

  it('should correctly build Container types: Card, Tabs, Collapse, Steps', () => {
    const cardSchema = (FieldBuilderFactory.create(FieldType.CARD) as CardFieldBuilder)
      .setBordered(false)
      .build();
    expect(cardSchema.type).toBe(FieldType.CARD);
    expect(cardSchema.bordered).toBe(false);

    const tabsSchema = (FieldBuilderFactory.create(FieldType.TABS) as TabsFieldBuilder)
      .setTabType('card')
      .setTabPosition('left')
      .build();
    expect(tabsSchema.type).toBe(FieldType.TABS);
    expect(tabsSchema.tabType).toBe('card');
    expect(tabsSchema.tabPosition).toBe('left');
    expect(tabsSchema.items.length).toBe(2);

    const collapseSchema = (FieldBuilderFactory.create(FieldType.COLLAPSE) as CollapseFieldBuilder)
      .setAccordion(true)
      .build();
    expect(collapseSchema.type).toBe(FieldType.COLLAPSE);
    expect(collapseSchema.accordion).toBe(true);

    const stepsSchema = (FieldBuilderFactory.create(FieldType.STEPS) as StepsFieldBuilder)
      .setDirection('vertical')
      .build();
    expect(stepsSchema.type).toBe(FieldType.STEPS);
    expect(stepsSchema.direction).toBe('vertical');
    expect(stepsSchema.items.length).toBe(2);
  });

  it('should extract leaf fields recursively from nested container schemas', () => {
    const text1 = FieldBuilderFactory.create(FieldType.TEXT_INPUT).setKey('name').build();
    const text2 = FieldBuilderFactory.create(FieldType.TEXT_INPUT).setKey('email').build();
    const text3 = FieldBuilderFactory.create(FieldType.NUMBER).setKey('age').build();

    const tabsSchema = (FieldBuilderFactory.create(FieldType.TABS) as TabsFieldBuilder).build();
    tabsSchema.items[0].fields = [text1, text2];
    tabsSchema.items[1].fields = [text3];

    const leafFields = extractAllLeafFields([tabsSchema]);
    expect(leafFields.length).toBe(3);
    expect(leafFields.map(f => f.key)).toEqual(['name', 'email', 'age']);

    const allFields = extractAllFieldsRecursive([tabsSchema]);
    expect(allFields.length).toBe(4); // 1 container + 3 leaf fields
  });

  it('should return a new object reference on build', () => {
    const builder = FieldBuilderFactory.create(FieldType.TEXT_INPUT);
    const schema1 = builder.build();
    const schema2 = builder.build();
    
    expect(schema1).not.toBe(schema2);
    expect(schema1).toEqual(schema2);
  });
});
