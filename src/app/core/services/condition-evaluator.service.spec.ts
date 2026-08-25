import { describe, it, expect, beforeEach } from 'vitest';
import { ConditionEvaluatorService } from './condition-evaluator.service';
import { FieldSchema, FieldType } from '../models/schema.model';

describe('ConditionEvaluatorService', () => {
  let service: ConditionEvaluatorService;

  beforeEach(() => {
    service = new ConditionEvaluatorService();
  });

  describe('evaluateRule', () => {
    it('should evaluate equals correctly', () => {
      expect(service.evaluateRule({ fieldKey: 'role', operator: 'equals', value: 'admin' }, { role: 'admin' })).toBe(true);
      expect(service.evaluateRule({ fieldKey: 'role', operator: 'equals', value: 'admin' }, { role: 'user' })).toBe(false);
      expect(service.evaluateRule({ fieldKey: 'age', operator: 'equals', value: 18 }, { age: '18' })).toBe(true);
    });

    it('should evaluate not_equals correctly', () => {
      expect(service.evaluateRule({ fieldKey: 'status', operator: 'not_equals', value: 'inactive' }, { status: 'active' })).toBe(true);
      expect(service.evaluateRule({ fieldKey: 'status', operator: 'not_equals', value: 'active' }, { status: 'active' })).toBe(false);
    });

    it('should evaluate contains correctly for strings and arrays', () => {
      expect(service.evaluateRule({ fieldKey: 'email', operator: 'contains', value: '@gmail.com' }, { email: 'test@gmail.com' })).toBe(true);
      expect(service.evaluateRule({ fieldKey: 'email', operator: 'contains', value: '@yahoo.com' }, { email: 'test@gmail.com' })).toBe(false);
      expect(service.evaluateRule({ fieldKey: 'hobbies', operator: 'contains', value: 'music' }, { hobbies: ['sports', 'music'] })).toBe(true);
      expect(service.evaluateRule({ fieldKey: 'hobbies', operator: 'contains', value: 'reading' }, { hobbies: ['sports', 'music'] })).toBe(false);
    });

    it('should evaluate in and not_in correctly', () => {
      expect(service.evaluateRule({ fieldKey: 'type', operator: 'in', value: ['gold', 'platinum'] }, { type: 'gold' })).toBe(true);
      expect(service.evaluateRule({ fieldKey: 'type', operator: 'in', value: ['gold', 'platinum'] }, { type: 'silver' })).toBe(false);
      expect(service.evaluateRule({ fieldKey: 'type', operator: 'not_in', value: ['banned', 'deleted'] }, { type: 'active' })).toBe(true);
    });

    it('should evaluate is_empty and is_not_empty correctly', () => {
      expect(service.evaluateRule({ fieldKey: 'notes', operator: 'is_empty' }, { notes: '' })).toBe(true);
      expect(service.evaluateRule({ fieldKey: 'notes', operator: 'is_empty' }, { notes: null })).toBe(true);
      expect(service.evaluateRule({ fieldKey: 'notes', operator: 'is_empty' }, { notes: [] })).toBe(true);
      expect(service.evaluateRule({ fieldKey: 'notes', operator: 'is_empty' }, { notes: 'hello' })).toBe(false);

      expect(service.evaluateRule({ fieldKey: 'notes', operator: 'is_not_empty' }, { notes: 'hello' })).toBe(true);
      expect(service.evaluateRule({ fieldKey: 'notes', operator: 'is_not_empty' }, { notes: '' })).toBe(false);
    });

    it('should evaluate greater_than and less_than correctly', () => {
      expect(service.evaluateRule({ fieldKey: 'age', operator: 'greater_than', value: 18 }, { age: 20 })).toBe(true);
      expect(service.evaluateRule({ fieldKey: 'age', operator: 'greater_than', value: 18 }, { age: 16 })).toBe(false);
      expect(service.evaluateRule({ fieldKey: 'age', operator: 'less_than', value: 60 }, { age: 40 })).toBe(true);
      expect(service.evaluateRule({ fieldKey: 'age', operator: 'less_than', value: 60 }, { age: 70 })).toBe(false);
    });
  });

  describe('isFieldVisible and isFieldDisabled', () => {
    const dependentField: FieldSchema = {
      id: 'f2',
      key: 'tax_code',
      type: FieldType.TEXT_INPUT,
      label: 'Tax Code',
      conditions: {
        action: 'show',
        rules: [
          { fieldKey: 'customer_type', operator: 'equals', value: 'business' }
        ]
      }
    };

    it('should show field only when condition matches', () => {
      expect(service.isFieldVisible(dependentField, { customer_type: 'individual' })).toBe(false);
      expect(service.isFieldVisible(dependentField, { customer_type: 'business' })).toBe(true);
    });

    it('should hide field when action is hide and condition matches', () => {
      const hideField: FieldSchema = {
        ...dependentField,
        conditions: {
          action: 'hide',
          rules: [{ fieldKey: 'customer_type', operator: 'equals', value: 'individual' }]
        }
      };
      expect(service.isFieldVisible(hideField, { customer_type: 'individual' })).toBe(false);
      expect(service.isFieldVisible(hideField, { customer_type: 'business' })).toBe(true);
    });

    it('should disable field when action is disable and condition matches', () => {
      const disableField: FieldSchema = {
        ...dependentField,
        conditions: {
          action: 'disable',
          rules: [{ fieldKey: 'read_only_mode', operator: 'equals', value: true }]
        }
      };
      expect(service.isFieldDisabled(disableField, { read_only_mode: true })).toBe(true);
      expect(service.isFieldDisabled(disableField, { read_only_mode: false })).toBe(false);
    });

    it('should handle matchType any (OR condition)', () => {
      const multiRuleField: FieldSchema = {
        ...dependentField,
        conditions: {
          action: 'show',
          matchType: 'any',
          rules: [
            { fieldKey: 'country', operator: 'equals', value: 'VN' },
            { fieldKey: 'country', operator: 'equals', value: 'US' }
          ]
        }
      };
      expect(service.isFieldVisible(multiRuleField, { country: 'VN' })).toBe(true);
      expect(service.isFieldVisible(multiRuleField, { country: 'US' })).toBe(true);
      expect(service.isFieldVisible(multiRuleField, { country: 'JP' })).toBe(false);
    });
  });
});
