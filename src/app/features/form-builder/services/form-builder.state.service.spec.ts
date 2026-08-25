import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { FormBuilderStateService } from './form-builder.state.service';
import { FieldType } from '../../../core/models/schema.model';

describe('FormBuilderStateService Actions', () => {
  let service: FormBuilderStateService;

  beforeEach(() => {
    service = new FormBuilderStateService();
  });

  it('should add a field and set it as active', () => {
    const fieldId = service.addField(FieldType.TEXT_INPUT, 0);
    
    expect(service.schema().fields.length).toBe(1);
    expect(service.schema().fields[0].id).toBe(fieldId);
    expect(service.activeFieldId()).toBe(fieldId);
  });

  it('should duplicate a field and insert right after it', () => {
    const firstId = service.addField(FieldType.TEXT_INPUT, 0);
    service.updateActiveField({ label: 'Username', key: 'username' });

    const duplicateId = service.duplicateField(firstId);

    expect(service.schema().fields.length).toBe(2);
    expect(duplicateId).not.toBeNull();
    expect(service.schema().fields[1].id).toBe(duplicateId);
    expect(service.schema().fields[1].label).toBe('Username (Copy)');
    expect(service.schema().fields[1].key).toBe('username_copy');
    expect(service.activeFieldId()).toBe(duplicateId);
  });

  it('should delete a field and clear activeField if deleted', () => {
    const id1 = service.addField(FieldType.TEXT_INPUT, 0);
    const id2 = service.addField(FieldType.NUMBER, 1);

    expect(service.schema().fields.length).toBe(2);
    expect(service.activeFieldId()).toBe(id2);

    service.deleteField(id2);

    expect(service.schema().fields.length).toBe(1);
    expect(service.schema().fields[0].id).toBe(id1);
    expect(service.activeFieldId()).toBeNull();
  });

  it('should add a field before a target field', () => {
    const initialId = service.addField(FieldType.TEXT_INPUT, 0);
    const beforeId = service.addFieldBefore(initialId, FieldType.NUMBER);

    expect(service.schema().fields.length).toBe(2);
    expect(service.schema().fields[0].id).toBe(beforeId);
    expect(service.schema().fields[0].type).toBe(FieldType.NUMBER);
    expect(service.schema().fields[1].id).toBe(initialId);
    expect(service.activeFieldId()).toBe(beforeId);
  });

  it('should add a field after a target field', () => {
    const id1 = service.addField(FieldType.TEXT_INPUT, 0);
    const id2 = service.addField(FieldType.TEXT_AREA, 1);

    const afterId = service.addFieldAfter(id1, FieldType.DATE_PICKER);

    expect(service.schema().fields.length).toBe(3);
    expect(service.schema().fields[0].id).toBe(id1);
    expect(service.schema().fields[1].id).toBe(afterId);
    expect(service.schema().fields[1].type).toBe(FieldType.DATE_PICKER);
    expect(service.schema().fields[2].id).toBe(id2);
    expect(service.activeFieldId()).toBe(afterId);
  });

  it('should move field position in array', () => {
    const id1 = service.addField(FieldType.TEXT_INPUT, 0);
    const id2 = service.addField(FieldType.NUMBER, 1);
    const id3 = service.addField(FieldType.SELECT, 2);

    expect(service.schema().fields.map(f => f.id)).toEqual([id1, id2, id3]);

    service.moveField(0, 2);
    expect(service.schema().fields.map(f => f.id)).toEqual([id2, id3, id1]);
  });

  it('should load new schema correctly and reset activeField', () => {
    service.addField(FieldType.TEXT_INPUT, 0);
    expect(service.activeFieldId()).not.toBeNull();

    service.loadSchema({
      formId: 'custom-form-123',
      title: 'Imported Form',
      description: 'Loaded from JSON',
      layout: 'horizontal',
      fields: [
        {
          id: 'f1',
          key: 'username',
          type: FieldType.TEXT_INPUT,
          label: 'User Name'
        }
      ]
    });

    expect(service.schema().formId).toBe('custom-form-123');
    expect(service.schema().title).toBe('Imported Form');
    expect(service.schema().fields.length).toBe(1);
    expect(service.schema().fields[0].key).toBe('username');
    expect(service.activeFieldId()).toBeNull();
    expect(service.activeField()).toBeNull();
  });

  it('should reactively compute activeField when field properties are updated', () => {
    const id = service.addField(FieldType.TEXT_INPUT, 0);
    expect(service.activeField()?.label).toBe('TEXT_INPUT');

    service.updateActiveField({ label: 'Full Name', placeholder: 'Enter name' });
    expect(service.activeField()?.label).toBe('Full Name');
    expect((service.activeField() as any)?.placeholder).toBe('Enter name');
  });
});

