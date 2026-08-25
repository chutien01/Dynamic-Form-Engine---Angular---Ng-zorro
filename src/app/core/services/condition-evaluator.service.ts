import { Injectable } from '@angular/core';
import { FieldConditions, FieldConditionRule, FieldSchema, FormSchema } from '../models/schema.model';

@Injectable({
  providedIn: 'root'
})
export class ConditionEvaluatorService {
  /**
   * Đánh giá 1 quy tắc đơn lẻ dựa trên giá trị form hiện tại
   */
  evaluateRule(
    rule: FieldConditionRule, 
    formValues: Record<string, unknown>, 
    schema?: FormSchema
  ): boolean {
    if (!rule || !rule.fieldKey) {
      return true;
    }

    let actualValue = formValues[rule.fieldKey];

    // Fallback tìm theo key hoặc id nếu field key bị đổi
    if (actualValue === undefined && schema?.fields) {
      const matchedField = schema.fields.find(f => f.id === rule.fieldKey || f.key === rule.fieldKey);
      if (matchedField) {
        const actualKey = matchedField.key || matchedField.id;
        actualValue = formValues[actualKey];
      }
    }

    const targetValue = rule.value;

    switch (rule.operator) {
      case 'equals':
        return this.isEqual(actualValue, targetValue);

      case 'not_equals':
        return !this.isEqual(actualValue, targetValue);

      case 'contains':
        if (typeof actualValue === 'string' && targetValue !== undefined && targetValue !== null) {
          return actualValue.toLowerCase().includes(String(targetValue).toLowerCase());
        }
        if (Array.isArray(actualValue)) {
          return actualValue.some(item => this.isEqual(item, targetValue));
        }
        return false;

      case 'in':
        if (Array.isArray(targetValue)) {
          return targetValue.some(item => this.isEqual(item, actualValue));
        }
        return false;

      case 'not_in':
        if (Array.isArray(targetValue)) {
          return !targetValue.some(item => this.isEqual(item, actualValue));
        }
        return true;

      case 'is_empty':
        return this.isEmpty(actualValue);

      case 'is_not_empty':
        return !this.isEmpty(actualValue);

      case 'greater_than': {
        const numActual = Number(actualValue);
        const numTarget = Number(targetValue);
        return !isNaN(numActual) && !isNaN(numTarget) && numActual > numTarget;
      }

      case 'less_than': {
        const numActual = Number(actualValue);
        const numTarget = Number(targetValue);
        return !isNaN(numActual) && !isNaN(numTarget) && numActual < numTarget;
      }

      default:
        return true;
    }
  }

  /**
   * Đánh giá toàn bộ khối điều kiện của một field (kết hợp ALL / ANY)
   */
  evaluateConditions(
    conditions: FieldConditions, 
    formValues: Record<string, unknown>, 
    schema?: FormSchema
  ): boolean {
    if (!conditions || !Array.isArray(conditions.rules) || conditions.rules.length === 0) {
      return true;
    }

    const matchType = conditions.matchType || 'all';

    if (matchType === 'any') {
      return conditions.rules.some(rule => this.evaluateRule(rule, formValues, schema));
    }

    return conditions.rules.every(rule => this.evaluateRule(rule, formValues, schema));
  }

  /**
   * Kiểm tra field có nên hiển thị (Visible) hay không
   */
  isFieldVisible(
    field: FieldSchema, 
    formValues: Record<string, unknown>, 
    schema?: FormSchema
  ): boolean {
    if (!field.conditions || !field.conditions.rules || field.conditions.rules.length === 0) {
      return true;
    }

    const isConditionMatched = this.evaluateConditions(field.conditions, formValues, schema);

    if (field.conditions.action === 'show') {
      return isConditionMatched;
    }
    if (field.conditions.action === 'hide') {
      return !isConditionMatched;
    }

    return true;
  }

  /**
   * Kiểm tra field có nên bị vô hiệu hóa (Disabled) hay không
   */
  isFieldDisabled(
    field: FieldSchema, 
    formValues: Record<string, unknown>, 
    schema?: FormSchema
  ): boolean {
    if (!field.conditions || !field.conditions.rules || field.conditions.rules.length === 0) {
      return false;
    }

    const isConditionMatched = this.evaluateConditions(field.conditions, formValues, schema);

    if (field.conditions.action === 'disable') {
      return isConditionMatched;
    }
    if (field.conditions.action === 'enable') {
      return !isConditionMatched;
    }

    return false;
  }

  private isEmpty(value: unknown): boolean {
    if (value === undefined || value === null || value === '') {
      return true;
    }
    if (Array.isArray(value) && value.length === 0) {
      return true;
    }
    return false;
  }

  private isEqual(a: unknown, b: unknown): boolean {
    if (a === b) return true;
    if (a === undefined || a === null || b === undefined || b === null) {
      return a === b;
    }
    
    // So sánh dạng số nếu cả 2 đều parse được ra số hợp lệ
    const strA = String(a).trim();
    const strB = String(b).trim();
    if (strA !== '' && strB !== '') {
      const numA = Number(strA);
      const numB = Number(strB);
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA === numB;
      }
    }

    // So sánh dạng boolean
    if (typeof a === 'boolean' || typeof b === 'boolean') {
      return strA.toLowerCase() === strB.toLowerCase();
    }

    return strA.toLowerCase() === strB.toLowerCase();
  }
}
