import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { FormBuilderStateService } from './form-builder.state.service';
import { CardFieldSchema, FieldType, TabsFieldSchema } from '../../../core/models/schema.model';

describe('FormBuilderStateService Actions', () => {
  let service: FormBuilderStateService;

  beforeEach(() => {
    service = new FormBuilderStateService();
  });

  it('should add a field and set it as active', () => {
    const id = service.addField(FieldType.TEXT_INPUT, 0);
    const schema = service.schema();

    expect(schema.fields.length).toBe(1);
    expect(schema.fields[0].id).toBe(id);
    expect(service.activeFieldId()).toBe(id);
    expect(service.activeField()?.id).toBe(id);
  });

  it('should duplicate a field and insert right after it', () => {
    const id1 = service.addField(FieldType.TEXT_INPUT, 0);
    const id2 = service.addField(FieldType.NUMBER, 1);

    const dupId = service.duplicateField(id1);
    const schema = service.schema();

    expect(schema.fields.length).toBe(3);
    expect(schema.fields[0].id).toBe(id1);
    expect(schema.fields[1].id).toBe(dupId);
    expect(schema.fields[2].id).toBe(id2);
    expect(service.activeFieldId()).toBe(dupId);
  });

  it('should delete a field and clear activeField if deleted', () => {
    const id = service.addField(FieldType.TEXT_INPUT, 0);
    expect(service.activeFieldId()).toBe(id);

    service.deleteField(id);
    expect(service.schema().fields.length).toBe(0);
    expect(service.activeFieldId()).toBeNull();
    expect(service.activeField()).toBeNull();
  });

  it('should add a field before a target field', () => {
    const id1 = service.addField(FieldType.TEXT_INPUT, 0);
    const id2 = service.addFieldBefore(id1, FieldType.NUMBER);

    const fields = service.schema().fields;
    expect(fields.length).toBe(2);
    expect(fields[0].id).toBe(id2);
    expect(fields[1].id).toBe(id1);
  });

  it('should add a field after a target field', () => {
    const id1 = service.addField(FieldType.TEXT_INPUT, 0);
    const id2 = service.addFieldAfter(id1, FieldType.NUMBER);

    const fields = service.schema().fields;
    expect(fields.length).toBe(2);
    expect(fields[0].id).toBe(id1);
    expect(fields[1].id).toBe(id2);
  });

  it('should move field position in array', () => {
    const id1 = service.addField(FieldType.TEXT_INPUT, 0);
    const id2 = service.addField(FieldType.NUMBER, 1);
    const id3 = service.addField(FieldType.CHECKBOX, 2);

    service.moveField(0, 2);
    const fields = service.schema().fields;
    expect(fields[0].id).toBe(id2);
    expect(fields[1].id).toBe(id3);
    expect(fields[2].id).toBe(id1);
  });

  it('should load new schema correctly and reset activeField', () => {
    service.addField(FieldType.TEXT_INPUT, 0);
    service.loadSchema({
      formId: 'custom-form-123',
      title: 'Imported Form',
      description: 'Imported description',
      layout: 'horizontal',
      fields: [
        {
          id: 'f1',
          key: 'username',
          type: FieldType.TEXT_INPUT,
          label: 'Username'
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
    expect(service.activeField()?.label).toBe('Text Input');

    service.updateActiveField({ label: 'Full Name', placeholder: 'Enter name' });
    expect(service.activeField()?.label).toBe('Full Name');
    expect((service.activeField() as any)?.placeholder).toBe('Enter name');
  });

  it('should add child field to Container and manage it recursively', () => {
    const cardId = service.addField(FieldType.CARD, 0);
    const childId = service.addChildField(cardId, null, FieldType.TEXT_INPUT);

    // Active field should now be the newly added child field
    expect(service.activeFieldId()).toBe(childId);
    expect(service.activeField()?.label).toBe('Text Input');

    // Update the child field
    service.updateActiveField({ label: 'Card Item Label' });
    expect(service.activeField()?.label).toBe('Card Item Label');

    // Delete the child field
    service.deleteField(childId);
    expect(service.activeField()).toBeNull();
  });

  it('should duplicate a Container and clone all nested child fields with new IDs and keys', () => {
    const cardId = service.addField(FieldType.CARD, 0);
    const child1Id = service.addChildField(cardId, null, FieldType.TEXT_INPUT);
    const child2Id = service.addChildField(cardId, null, FieldType.NUMBER);

    const dupCardId = service.duplicateField(cardId);
    expect(dupCardId).not.toBeNull();
    expect(dupCardId).not.toBe(cardId);

    const fields = service.schema().fields;
    expect(fields.length).toBe(2);

    const clonedCard = fields[1] as CardFieldSchema;
    expect(clonedCard.id).toBe(dupCardId);
    expect(clonedCard.fields.length).toBe(2);

    // Cloned child fields must have brand new IDs
    expect(clonedCard.fields[0].id).not.toBe(child1Id);
    expect(clonedCard.fields[1].id).not.toBe(child2Id);
    expect(clonedCard.fields[0].type).toBe(FieldType.TEXT_INPUT);
    expect(clonedCard.fields[1].type).toBe(FieldType.NUMBER);
  });

  it('should duplicate a child field inside a Container and insert right next to it', () => {
    const cardId = service.addField(FieldType.CARD, 0);
    const child1Id = service.addChildField(cardId, null, FieldType.TEXT_INPUT);

    const dupChildId = service.duplicateField(child1Id);
    expect(dupChildId).not.toBeNull();

    const card = service.schema().fields[0] as CardFieldSchema;
    expect(card.fields.length).toBe(2);
    expect(card.fields[0].id).toBe(child1Id);
    expect(card.fields[1].id).toBe(dupChildId);
  });

  it('should add field before and after a child field inside a Container', () => {
    const cardId = service.addField(FieldType.CARD, 0);
    const child1Id = service.addChildField(cardId, null, FieldType.TEXT_INPUT);

    const beforeId = service.addFieldBefore(child1Id, FieldType.NUMBER);
    const afterId = service.addFieldAfter(child1Id, FieldType.SWITCH);

    const card = service.schema().fields[0] as CardFieldSchema;
    expect(card.fields.length).toBe(3);
    expect(card.fields[0].id).toBe(beforeId);
    expect(card.fields[1].id).toBe(child1Id);
    expect(card.fields[2].id).toBe(afterId);
  });

  it('should include container dropzone IDs before canvasList in connectedDropLists', () => {
    const cardId = service.addField(FieldType.CARD, 0);
    const tabsId = service.addField(FieldType.TABS, 1);

    const dropLists = service.connectedDropLists();
    
    // canvasList must be at the very end so CDK tests inner containers first
    expect(dropLists[dropLists.length - 1]).toBe('canvasList');
    expect(dropLists).toContain(`container_${cardId}`);

    // Tabs container child items should also have dropzone IDs
    const tabsField = service.schema().fields[1] as TabsFieldSchema;
    for (const item of tabsField.items) {
      expect(dropLists).toContain(`container_${item.id}`);
    }
  });

  it('should transfer an existing field from Canvas into a Container', () => {
    const cardId = service.addField(FieldType.CARD, 0);
    const textId = service.addField(FieldType.TEXT_INPUT, 1);
    const textSchema = service.schema().fields.find(f => f.id === textId)!;

    expect(service.schema().fields.length).toBe(2);

    service.transferFieldToContainer(textSchema, cardId, null, 0);

    const updatedFields = service.schema().fields;
    expect(updatedFields.length).toBe(1); // Only Card remains on canvas
    expect(updatedFields[0].id).toBe(cardId);

    const card = updatedFields[0] as CardFieldSchema;
    expect(card.fields.length).toBe(1);
    expect(card.fields[0].id).toBe(textId);
    expect(service.activeFieldId()).toBe(textId);
  });

  it('should transfer an existing field from a Container out to the Canvas', () => {
    const cardId = service.addField(FieldType.CARD, 0);
    const childId = service.addChildField(cardId, null, FieldType.TEXT_INPUT);
    const childSchema = (service.schema().fields[0] as CardFieldSchema).fields.find(f => f.id === childId)!;

    service.transferFieldToCanvas(childSchema, 1);

    const updatedFields = service.schema().fields;
    expect(updatedFields.length).toBe(2);
    expect(updatedFields[0].id).toBe(cardId);
    expect(updatedFields[1].id).toBe(childId);

    const card = updatedFields[0] as CardFieldSchema;
    expect(card.fields.length).toBe(0);
    expect(service.activeFieldId()).toBe(childId);
  });
});
