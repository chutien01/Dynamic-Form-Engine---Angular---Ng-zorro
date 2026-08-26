import { v4 as uuidv4 } from 'uuid';
import { 
  FieldSchema, 
  FieldType, 
  CardFieldSchema, 
  TabsFieldSchema, 
  CollapseFieldSchema, 
  StepsFieldSchema 
} from '../models/schema.model';

/**
 * Di chuyển phần tử trong mảng thuần TypeScript (không phụ thuộc Angular CDK)
 */
export function moveItemInArray<T>(array: T[], fromIndex: number, toIndex: number): void {
  const from = Math.max(0, Math.min(array.length - 1, fromIndex));
  const to = Math.max(0, Math.min(array.length - 1, toIndex));
  if (from === to) return;
  const target = array[from];
  const delta = to < from ? -1 : 1;
  for (let i = from; i !== to; i += delta) {
    array[i] = array[i + delta];
  }
  array[to] = target;
}

/**
 * Trích xuất toàn bộ các field lá (form controls thực tế) kể cả khi nằm sâu trong Tabs/Collapse/Steps/Card
 */
export function extractAllLeafFields(fields: FieldSchema[]): FieldSchema[] {
  const result: FieldSchema[] = [];

  function traverse(list: FieldSchema[]) {
    if (!Array.isArray(list)) return;
    for (const f of list) {
      if (f.type === FieldType.CARD && 'fields' in f && Array.isArray(f.fields)) {
        traverse(f.fields);
      } else if (
        (f.type === FieldType.TABS || f.type === FieldType.COLLAPSE || f.type === FieldType.STEPS) &&
        'items' in f && Array.isArray(f.items)
      ) {
        for (const item of f.items) {
          if (Array.isArray(item.fields)) {
            traverse(item.fields);
          }
        }
      } else {
        result.push(f);
      }
    }
  }

  traverse(fields);
  return result;
}

/**
 * Trích xuất toàn bộ fields bao gồm cả container và các fields con bên trong
 */
export function extractAllFieldsRecursive(fields: FieldSchema[]): FieldSchema[] {
  const result: FieldSchema[] = [];

  function traverse(list: FieldSchema[]) {
    if (!Array.isArray(list)) return;
    for (const f of list) {
      result.push(f);
      if (f.type === FieldType.CARD && 'fields' in f && Array.isArray(f.fields)) {
        traverse(f.fields);
      } else if (
        (f.type === FieldType.TABS || f.type === FieldType.COLLAPSE || f.type === FieldType.STEPS) &&
        'items' in f && Array.isArray(f.items)
      ) {
        for (const item of f.items) {
          if (Array.isArray(item.fields)) {
            traverse(item.fields);
          }
        }
      }
    }
  }

  traverse(fields);
  return result;
}

/**
 * Tìm field theo ID ở bất kỳ cấp lồng nào
 */
export function findFieldById(fields: FieldSchema[], id: string): FieldSchema | null {
  for (const f of fields) {
    if (f.id === id) return f;
    if (f.type === FieldType.CARD && 'fields' in f && Array.isArray(f.fields)) {
      const found = findFieldById(f.fields, id);
      if (found) return found;
    }
    if (
      (f.type === FieldType.TABS || f.type === FieldType.COLLAPSE || f.type === FieldType.STEPS) &&
      'items' in f && Array.isArray(f.items)
    ) {
      for (const item of f.items) {
        if (Array.isArray(item.fields)) {
          const found = findFieldById(item.fields, id);
          if (found) return found;
        }
      }
    }
  }
  return null;
}

/**
 * Cập nhật field đệ quy ở bất kỳ cấp lồng nào
 */
export function updateFieldRecursive(fields: FieldSchema[], id: string, updatedData: Partial<FieldSchema>): FieldSchema[] {
  return fields.map(f => {
    if (f.id === id) {
      return { ...f, ...updatedData } as FieldSchema;
    }
    if (f.type === FieldType.CARD && 'fields' in f && Array.isArray(f.fields)) {
      return {
        ...f,
        fields: updateFieldRecursive(f.fields, id, updatedData)
      };
    }
    if (
      (f.type === FieldType.TABS || f.type === FieldType.COLLAPSE || f.type === FieldType.STEPS) &&
      'items' in f && Array.isArray(f.items)
    ) {
      return {
        ...f,
        items: f.items.map(item => ({
          ...item,
          fields: Array.isArray(item.fields) ? updateFieldRecursive(item.fields, id, updatedData) : []
        }))
      };
    }
    return f;
  });
}

/**
 * Xóa field đệ quy ở bất kỳ cấp lồng nào
 */
export function deleteFieldRecursive(fields: FieldSchema[], id: string): FieldSchema[] {
  return fields
    .filter(f => f.id !== id)
    .map(f => {
      if (f.type === FieldType.CARD && 'fields' in f && Array.isArray(f.fields)) {
        return {
          ...f,
          fields: deleteFieldRecursive(f.fields, id)
        };
      }
      if (
        (f.type === FieldType.TABS || f.type === FieldType.COLLAPSE || f.type === FieldType.STEPS) &&
        'items' in f && Array.isArray(f.items)
      ) {
        return {
          ...f,
          items: f.items.map(item => ({
            ...item,
            fields: Array.isArray(item.fields) ? deleteFieldRecursive(item.fields, id) : []
          }))
        };
      }
      return f;
    });
}

/**
 * Nhân bản đệ quy một Field/Container (tạo mới ID & Key cho toàn bộ cây con)
 */
export function cloneFieldSchemaRecursive(sourceField: FieldSchema): FieldSchema {
  const cloned = structuredClone(sourceField);
  cloned.id = uuidv4();
  const shortId = uuidv4().substring(0, 4);
  cloned.key = `${sourceField.key || sourceField.id}_copy_${shortId}`;
  cloned.label = `${sourceField.label} (Copy)`;

  // Nếu là Card, clone toàn bộ fields con bên trong
  if (cloned.type === FieldType.CARD && 'fields' in cloned && Array.isArray(cloned.fields)) {
    cloned.fields = (cloned as CardFieldSchema).fields.map(child => cloneFieldSchemaRecursive(child));
  }

  // Nếu là Tabs / Collapse / Steps, clone toàn bộ items và fields con của từng item
  if (
    (cloned.type === FieldType.TABS || cloned.type === FieldType.COLLAPSE || cloned.type === FieldType.STEPS) &&
    'items' in cloned && Array.isArray(cloned.items)
  ) {
    (cloned as TabsFieldSchema | CollapseFieldSchema | StepsFieldSchema).items = cloned.items.map(item => ({
      ...item,
      id: uuidv4(),
      title: `${item.title} (Copy)`,
      fields: Array.isArray(item.fields)
        ? item.fields.map(child => cloneFieldSchemaRecursive(child))
        : []
    }));
  }

  return cloned;
}

/**
 * Nhân bản field và chèn ngay sau field đó ở bất kỳ vị trí/cấp lồng nào
 */
export function duplicateFieldRecursive(fields: FieldSchema[], targetId: string): { updatedFields: FieldSchema[]; clonedId: string | null } {
  let clonedId: string | null = null;

  function traverse(list: FieldSchema[]): FieldSchema[] {
    const nextList: FieldSchema[] = [];
    for (const f of list) {
      if (f.id === targetId) {
        const cloned = cloneFieldSchemaRecursive(f);
        clonedId = cloned.id;
        nextList.push(f);
        nextList.push(cloned);
      } else {
        if (f.type === FieldType.CARD && 'fields' in f && Array.isArray(f.fields)) {
          nextList.push({
            ...f,
            fields: traverse(f.fields)
          } as FieldSchema);
        } else if (
          (f.type === FieldType.TABS || f.type === FieldType.COLLAPSE || f.type === FieldType.STEPS) &&
          'items' in f && Array.isArray(f.items)
        ) {
          nextList.push({
            ...f,
            items: f.items.map(item => ({
              ...item,
              fields: Array.isArray(item.fields) ? traverse(item.fields) : []
            }))
          } as FieldSchema);
        } else {
          nextList.push(f);
        }
      }
    }
    return nextList;
  }

  const updatedFields = traverse(fields);
  return { updatedFields, clonedId };
}

/**
 * Thêm field con vào Container (Card hoặc Tab/Panel/Step cụ thể)
 */
export function addChildFieldToContainer(
  fields: FieldSchema[], 
  containerId: string, 
  itemId: string | null, 
  newField: FieldSchema,
  targetIndex?: number
): FieldSchema[] {
  return fields.map(f => {
    if (f.id === containerId) {
      if (f.type === FieldType.CARD) {
        const nextFields = [...(f.fields || [])];
        if (targetIndex !== undefined && targetIndex >= 0) {
          nextFields.splice(targetIndex, 0, newField);
        } else {
          nextFields.push(newField);
        }
        return { ...f, fields: nextFields };
      }
      if (
        (f.type === FieldType.TABS || f.type === FieldType.COLLAPSE || f.type === FieldType.STEPS) &&
        Array.isArray(f.items)
      ) {
        return {
          ...f,
          items: f.items.map((item, idx) => {
            if (itemId ? item.id === itemId : idx === 0) {
              const nextFields = [...(item.fields || [])];
              if (targetIndex !== undefined && targetIndex >= 0) {
                nextFields.splice(targetIndex, 0, newField);
              } else {
                nextFields.push(newField);
              }
              return { ...item, fields: nextFields };
            }
            return item;
          })
        };
      }
    }
    return f;
  });
}

/**
 * Chèn một field mới vào trước hoặc sau một targetField ở bất kỳ cấp lồng nào
 */
export function insertFieldRelativeToTargetRecursive(
  fields: FieldSchema[],
  targetId: string,
  newField: FieldSchema,
  position: 'before' | 'after'
): FieldSchema[] {
  function traverse(list: FieldSchema[]): FieldSchema[] {
    const nextList: FieldSchema[] = [];
    for (const f of list) {
      if (f.id === targetId) {
        if (position === 'before') {
          nextList.push(newField);
          nextList.push(f);
        } else {
          nextList.push(f);
          nextList.push(newField);
        }
      } else {
        if (f.type === FieldType.CARD && 'fields' in f && Array.isArray(f.fields)) {
          nextList.push({
            ...f,
            fields: traverse(f.fields)
          } as FieldSchema);
        } else if (
          (f.type === FieldType.TABS || f.type === FieldType.COLLAPSE || f.type === FieldType.STEPS) &&
          'items' in f && Array.isArray(f.items)
        ) {
          nextList.push({
            ...f,
            items: f.items.map(item => ({
              ...item,
              fields: Array.isArray(item.fields) ? traverse(item.fields) : []
            }))
          } as FieldSchema);
        } else {
          nextList.push(f);
        }
      }
    }
    return nextList;
  }

  return traverse(fields);
}

/**
 * Di chuyển vị trí sắp xếp field con trong Container
 */
export function moveChildFieldInContainer(
  fields: FieldSchema[],
  containerId: string,
  itemId: string | null,
  previousIndex: number,
  currentIndex: number
): FieldSchema[] {
  return fields.map(f => {
    if (f.id === containerId) {
      if (f.type === FieldType.CARD && Array.isArray(f.fields)) {
        const nextFields = [...f.fields];
        moveItemInArray(nextFields, previousIndex, currentIndex);
        return { ...f, fields: nextFields };
      }
      if (
        (f.type === FieldType.TABS || f.type === FieldType.COLLAPSE || f.type === FieldType.STEPS) &&
        Array.isArray(f.items)
      ) {
        return {
          ...f,
          items: f.items.map((item, idx) => {
            if (itemId ? item.id === itemId : idx === 0) {
              const nextFields = [...(item.fields || [])];
              moveItemInArray(nextFields, previousIndex, currentIndex);
              return { ...item, fields: nextFields };
            }
            return item;
          })
        };
      }
    }
    return f;
  });
}

export interface TriggerFieldItem {
  id: string;
  key: string;
  label: string;
  type: FieldType;
  path: string;
  groupName: string;
  fullDisplay: string;
  field: FieldSchema;
}

/**
 * Trích xuất toàn bộ các leaf fields kèm đường dẫn cha (Tabs / Card / Collapse / Steps)
 * để hiển thị trực quan ngữ cảnh trong dropdown chọn điều kiện Conditional Logic
 */
export function extractAllTriggerFieldsWithPath(fields: FieldSchema[]): TriggerFieldItem[] {
  const result: TriggerFieldItem[] = [];

  function traverse(list: FieldSchema[], parentPath: string, parentGroup: string) {
    if (!Array.isArray(list)) return;
    for (const f of list) {
      if (f.type === FieldType.CARD && 'fields' in f && Array.isArray(f.fields)) {
        const cardTitle = f.label || 'Card Section';
        traverse(f.fields, `${parentPath ? parentPath + ' > ' : ''}Card: ${cardTitle}`, `💳 ${cardTitle}`);
      } else if (
        (f.type === FieldType.TABS || f.type === FieldType.COLLAPSE || f.type === FieldType.STEPS) &&
        'items' in f && Array.isArray(f.items)
      ) {
        const containerPrefix = f.type === FieldType.TABS ? '🗂️' : (f.type === FieldType.COLLAPSE ? '🪗' : '🪜');
        const containerTitle = f.label || (f.type === FieldType.TABS ? 'Tabs' : (f.type === FieldType.COLLAPSE ? 'Collapse' : 'Steps'));
        for (let i = 0; i < f.items.length; i++) {
          const item = f.items[i];
          const itemTitle = item.title || `Mục ${i + 1}`;
          const itemIcon = f.type === FieldType.TABS ? '📑' : (f.type === FieldType.COLLAPSE ? '📄' : '📍');
          const currentPath = `${parentPath ? parentPath + ' > ' : ''}${containerTitle} > ${itemTitle}`;
          const currentGroup = `${containerPrefix} ${containerTitle} > ${itemIcon} ${itemTitle}`;
          if (Array.isArray(item.fields)) {
            traverse(item.fields, currentPath, currentGroup);
          }
        }
      } else {
        const key = f.key || f.id;
        let label = (f.label || '').trim();
        if (!label) {
          label = `${f.type.replace(/_/g, ' ').toUpperCase()}`;
        }
        const group = parentGroup || '🌟 Trường ngoài (Root)';
        const fullDisplay = parentPath ? `[${parentPath}] ${label} (${key})` : `${label} (${key})`;
        result.push({
          id: f.id,
          key,
          label,
          type: f.type,
          path: parentPath || 'Root',
          groupName: group,
          fullDisplay,
          field: f
        });
      }
    }
  }

  traverse(fields, '', '');
  return result;
}

