import { Component, computed, effect, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, NgComponentOutlet } from '@angular/common';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { v4 as uuidv4 } from 'uuid';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzMessageService } from 'ng-zorro-antd/message';
import { FormBuilderStateService } from '../../services/form-builder.state.service';
import { FieldRegistryService } from '../../../../shared/dynamic-form/services/field-registry.service';
import { 
  FieldType, 
  FieldOption, 
  ConditionAction, 
  ConditionOperator, 
  FieldConditions,
  FieldSchema,
  FieldValidation
} from '../../../../core/models/schema.model';
import { 
  extractAllTriggerFieldsWithPath, 
  TriggerFieldItem, 
  extractAllLeafFields 
} from '../../../../core/utils/schema.utils';

@Component({
  selector: 'app-field-config-modal',
  imports: [
    CommonModule,
    NgComponentOutlet,
    ReactiveFormsModule,
    NzModalModule,
    NzTabsModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzSwitchModule,
    NzInputNumberModule,
    NzButtonModule,
    NzGridModule,
    NzTooltipModule,
    NzPopconfirmModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './field-config-modal.component.html'
})
export class FieldConfigModalComponent {
  readonly state = inject(FormBuilderStateService);
  readonly registry = inject(FieldRegistryService);
  readonly messageService = inject(NzMessageService);
  private readonly fb = inject(FormBuilder);

  readonly showPreview = signal(true);
  readonly previewField = signal<FieldSchema | null>(null);
  readonly previewFormGroup = new FormGroup({});
  readonly isCustomMessageUserEdited = signal(false);

  // Các kiểu field hỗ trợ placeholder
  private readonly placeholderTypes = new Set<FieldType>([
    FieldType.TEXT_INPUT,
    FieldType.TEXT_AREA,
    FieldType.NUMBER,
    FieldType.SELECT,
    FieldType.DATE_PICKER,
    FieldType.DATE_RANGE
  ]);

  // Các kiểu field có options
  private readonly optionTypes = new Set<FieldType>([
    FieldType.SELECT,
    FieldType.RADIO_GROUP,
    FieldType.CHECKBOX
  ]);

  // Kiểu field Container
  private readonly containerTypes = new Set<FieldType>([
    FieldType.CARD,
    FieldType.TABS,
    FieldType.COLLAPSE,
    FieldType.STEPS
  ]);

  // Container có danh sách items
  private readonly containerWithItemTypes = new Set<FieldType>([
    FieldType.TABS,
    FieldType.COLLAPSE,
    FieldType.STEPS
  ]);

  readonly isContainer = computed(() => {
    const current = this.state.activeField();
    return current ? this.containerTypes.has(current.type) : false;
  });

  readonly isCard = computed(() => {
    const current = this.state.activeField();
    return current ? current.type === FieldType.CARD : false;
  });

  readonly isTabs = computed(() => {
    const current = this.state.activeField();
    return current ? current.type === FieldType.TABS : false;
  });

  readonly isCollapse = computed(() => {
    const current = this.state.activeField();
    return current ? current.type === FieldType.COLLAPSE : false;
  });

  readonly isSteps = computed(() => {
    const current = this.state.activeField();
    return current ? current.type === FieldType.STEPS : false;
  });

  readonly isContainerWithItems = computed(() => {
    const current = this.state.activeField();
    return current ? this.containerWithItemTypes.has(current.type) : false;
  });

  readonly itemPrefix = computed(() => {
    if (this.isSteps()) return 'Step';
    if (this.isCollapse()) return 'Panel';
    return 'Tab';
  });

  readonly hasPlaceholder = computed(() => {
    const current = this.state.activeField();
    return current ? this.placeholderTypes.has(current.type) : false;
  });

  readonly hasOptions = computed(() => {
    const current = this.state.activeField();
    return current ? this.optionTypes.has(current.type) : false;
  });

  readonly isSwitch = computed(() => {
    const current = this.state.activeField();
    return current ? current.type === FieldType.SWITCH : false;
  });

  readonly isNumber = computed(() => {
    const current = this.state.activeField();
    return current ? current.type === FieldType.NUMBER : false;
  });

  readonly isSlider = computed(() => {
    const current = this.state.activeField();
    return current ? current.type === FieldType.SLIDER : false;
  });

  readonly hasMinMaxStep = computed(() => {
    const current = this.state.activeField();
    return current ? (current.type === FieldType.NUMBER || current.type === FieldType.SLIDER) : false;
  });

  readonly isRate = computed(() => {
    const current = this.state.activeField();
    return current ? current.type === FieldType.RATE : false;
  });

  readonly isFileUpload = computed(() => {
    const current = this.state.activeField();
    return current ? current.type === FieldType.FILE_UPLOAD : false;
  });

  readonly hasTextValidation = computed(() => {
    const current = this.state.activeField();
    return current ? (current.type === FieldType.TEXT_INPUT || current.type === FieldType.TEXT_AREA) : false;
  });

  readonly hasNumberValidation = computed(() => {
    const current = this.state.activeField();
    return current ? current.type === FieldType.NUMBER : false;
  });

  readonly availableTriggerFieldGroups = computed(() => {
    const active = this.state.activeField();
    if (!active) return [];
    const allTriggerItems = extractAllTriggerFieldsWithPath(this.state.schema().fields);

    // Không cho chọn chính nó hoặc các trường con nằm bên trong chính container đang được chọn (để tránh circular dependency)
    const activeChildIds = new Set<string>();
    const collectChildIds = (f: FieldSchema) => {
      activeChildIds.add(f.id);
      if ('fields' in f && Array.isArray(f.fields)) f.fields.forEach(collectChildIds);
      if ('items' in f && Array.isArray(f.items)) {
        f.items.forEach((item: any) => {
          if (Array.isArray(item.fields)) item.fields.forEach(collectChildIds);
        });
      }
    };
    collectChildIds(active);

    const filtered = allTriggerItems.filter(item => !activeChildIds.has(item.id));

    // Gom nhóm theo Container / Vị trí
    const groupMap = new Map<string, TriggerFieldItem[]>();
    for (const item of filtered) {
      if (!groupMap.has(item.groupName)) {
        groupMap.set(item.groupName, []);
      }
      groupMap.get(item.groupName)!.push(item);
    }

    const groups: { groupName: string; items: TriggerFieldItem[] }[] = [];
    for (const [groupName, items] of groupMap.entries()) {
      groups.push({ groupName, items });
    }
    return groups;
  });

  readonly totalAvailableTriggerFieldsCount = computed(() => {
    return this.availableTriggerFieldGroups().reduce((acc, grp) => acc + grp.items.length, 0);
  });

  readonly formGroup = this.fb.group({
    // Display Tab
    label: this.fb.nonNullable.control(''),
    placeholder: this.fb.nonNullable.control(''),
    gridSpan: this.fb.nonNullable.control(24),

    // Data Tab
    key: this.fb.nonNullable.control(''),
    defaultValue: this.fb.control<unknown>(null),
    options: this.fb.array<FormGroup<{ label: FormControl<string>; value: FormControl<unknown> }>>([]),
    min: this.fb.control<number | null>(null),
    max: this.fb.control<number | null>(null),
    step: this.fb.control<number | null>(null),
    count: this.fb.control<number | null>(5),
    allowHalf: this.fb.nonNullable.control(false),
    maxCount: this.fb.control<number | null>(1),
    accept: this.fb.nonNullable.control(''),

    // Validation Tab
    required: this.fb.nonNullable.control(false),
    minLength: this.fb.control<number | null>(null),
    maxLength: this.fb.control<number | null>(null),
    pattern: this.fb.nonNullable.control(''),
    validationMin: this.fb.control<number | null>(null),
    validationMax: this.fb.control<number | null>(null),
    customMessage: this.fb.nonNullable.control(''),

    // Conditional Tab
    enableConditions: this.fb.nonNullable.control(false),
    conditionAction: this.fb.nonNullable.control<ConditionAction>('show'),
    conditionFieldKey: this.fb.nonNullable.control(''),
    conditionOperator: this.fb.nonNullable.control<ConditionOperator>('equals'),
    conditionValue: this.fb.nonNullable.control<unknown>(''),
    conditionMatchType: this.fb.nonNullable.control<'all' | 'any'>('all'),

    // Layout Tab (Containers only)
    items: this.fb.array<FormGroup<{ id: FormControl<string>; title: FormControl<string>; description: FormControl<string> }>>([]),
    bordered: this.fb.nonNullable.control(true),
    tabType: this.fb.nonNullable.control<'line' | 'card'>('line'),
    tabPosition: this.fb.nonNullable.control<'top' | 'left' | 'right' | 'bottom'>('top'),
    accordion: this.fb.nonNullable.control(false),
    direction: this.fb.nonNullable.control<'horizontal' | 'vertical'>('horizontal'),
    size: this.fb.nonNullable.control<'default' | 'small'>('default')
  });

  readonly enableConditions = toSignal(
    this.formGroup.controls.enableConditions.valueChanges,
    { initialValue: this.formGroup.controls.enableConditions.value }
  );

  readonly currentOperator = toSignal(
    this.formGroup.controls.conditionOperator.valueChanges,
    { initialValue: this.formGroup.controls.conditionOperator.value }
  );

  readonly currentTriggerKey = toSignal(
    this.formGroup.controls.conditionFieldKey.valueChanges,
    { initialValue: this.formGroup.controls.conditionFieldKey.value }
  );

  readonly showConditionValueInput = computed(() => {
    const op = this.currentOperator();
    return op !== 'is_empty' && op !== 'is_not_empty';
  });

  readonly triggerField = computed(() => {
    const triggerKey = this.currentTriggerKey();
    if (!triggerKey) return null;
    const allLeafFields = extractAllLeafFields(this.state.schema().fields);
    return allLeafFields.find(f => f.key === triggerKey || f.id === triggerKey) || null;
  });

  readonly triggerFieldOptions = computed(() => {
    const field = this.triggerField();
    if (!field) return [];
    if (field.type === FieldType.CHECKBOX || field.type === FieldType.SWITCH) {
      return [
        { label: '☑️ Được chọn / Bật (true)', value: 'true' },
        { label: '⬜ Không chọn / Tắt (false)', value: 'false' }
      ];
    }
    if ('options' in field && Array.isArray(field.options)) {
      return field.options.map(opt => ({
        label: opt.label || String(opt.value),
        value: String(opt.value)
      }));
    }
    return [];
  });

  private lastLoadedFieldId: string | null = null;

  constructor() {
    this.formGroup.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        // Tự động cập nhật customMessage gợi ý nếu người dùng chưa tự chỉnh sửa
        if (!this.isCustomMessageUserEdited()) {
          const suggested = this.generateSuggestedMessage();
          this.formGroup.controls.customMessage.setValue(suggested, { emitEvent: false });
        }
        this.updateLivePreview();
      });

    effect(() => {
      const isOpen = this.state.isConfigModalOpen();
      const currentField = this.state.activeField();

      if (isOpen && currentField && currentField.id !== this.lastLoadedFieldId) {
        this.lastLoadedFieldId = currentField.id;
        this.loadFieldIntoForm(currentField);
      } else if (!isOpen) {
        this.lastLoadedFieldId = null;
      }
    });
  }

  get optionsArray() {
    return this.formGroup.controls.options;
  }

  get itemsArray() {
    return this.formGroup.controls.items;
  }

  private loadFieldIntoForm(field: FieldSchema): void {
    const anyField = field as Record<string, any>;
    const placeholder = typeof anyField['placeholder'] === 'string' ? anyField['placeholder'] : '';
    const hasConditions = !!(field.conditions && field.conditions.rules?.length);
    const firstRule = hasConditions ? field.conditions!.rules[0] : null;

    const savedCustomMessage = field.validations?.customMessage || '';
    this.isCustomMessageUserEdited.set(!!savedCustomMessage.trim());

    this.formGroup.patchValue({
      label: field.label || '',
      placeholder,
      gridSpan: field.gridSpan || 24,

      key: field.key || field.id,
      defaultValue: field.defaultValue ?? null,
      min: anyField['min'] ?? null,
      max: anyField['max'] ?? null,
      step: anyField['step'] ?? null,
      count: anyField['count'] ?? 5,
      allowHalf: !!anyField['allowHalf'],
      maxCount: anyField['maxCount'] ?? 1,
      accept: anyField['accept'] || '',

      required: !!field.required,
      minLength: field.validations?.minLength ?? null,
      maxLength: field.validations?.maxLength ?? null,
      pattern: field.validations?.pattern || '',
      validationMin: field.validations?.min ?? null,
      validationMax: field.validations?.max ?? null,
      customMessage: savedCustomMessage,

      enableConditions: hasConditions,
      conditionAction: field.conditions?.action || 'show',
      conditionFieldKey: firstRule?.fieldKey || '',
      conditionOperator: firstRule?.operator || 'equals',
      conditionValue: firstRule?.value ?? '',
      conditionMatchType: field.conditions?.matchType || 'all',

      bordered: anyField['bordered'] ?? true,
      tabType: anyField['tabType'] || 'line',
      tabPosition: anyField['tabPosition'] || 'top',
      accordion: !!anyField['accordion'],
      direction: anyField['direction'] || 'horizontal',
      size: anyField['size'] || 'default'
    }, { emitEvent: false });

    // Nếu chưa có message tự tạo trước đó, tự động sinh message gợi ý ban đầu
    if (!savedCustomMessage.trim()) {
      const suggested = this.generateSuggestedMessage();
      this.formGroup.patchValue({ customMessage: suggested }, { emitEvent: false });
    }

    // Populate Options
    this.optionsArray.clear({ emitEvent: false });
    if (this.optionTypes.has(field.type)) {
      const options = ('options' in field && Array.isArray(field.options)) ? field.options : [];
      options.forEach(opt => {
        this.optionsArray.push(this.createOptionGroup(opt.label, opt.value), { emitEvent: false });
      });
    }

    // Populate Container Items
    this.itemsArray.clear({ emitEvent: false });
    if (this.containerWithItemTypes.has(field.type)) {
      const items = ('items' in field && Array.isArray(field.items)) ? field.items : [];
      items.forEach(item => {
        this.itemsArray.push(this.createItemGroup(item.id, item.title, item.description || ''), { emitEvent: false });
      });
    }

    this.updateLivePreview();
  }

  /**
   * Sinh thông báo lỗi tùy chỉnh gợi ý thông minh dựa trên các điều kiện validation
   */
  generateSuggestedMessage(): string {
    const active = this.state.activeField();
    if (!active || this.isContainer()) return '';

    const label = this.formGroup.controls.label.value.trim() || 'Trường này';
    const type = active.type;
    const required = this.formGroup.controls.required.value;
    const minLength = this.formGroup.controls.minLength.value;
    const maxLength = this.formGroup.controls.maxLength.value;
    const pattern = this.formGroup.controls.pattern.value.trim();
    const valMin = this.formGroup.controls.validationMin.value;
    const valMax = this.formGroup.controls.validationMax.value;

    const parts: string[] = [];

    // Length validation
    if (minLength !== null && maxLength !== null) {
      parts.push(`tối thiểu ${minLength} ký tự, tối đa ${maxLength} ký tự`);
    } else if (minLength !== null) {
      parts.push(`ít nhất ${minLength} ký tự`);
    } else if (maxLength !== null) {
      parts.push(`tối đa ${maxLength} ký tự`);
    }

    // Value Range validation
    if (valMin !== null && valMax !== null) {
      parts.push(`giá trị từ ${valMin} đến ${valMax}`);
    } else if (valMin !== null) {
      parts.push(`giá trị lớn hơn hoặc bằng ${valMin}`);
    } else if (valMax !== null) {
      parts.push(`giá trị nhỏ hơn hoặc bằng ${valMax}`);
    }

    // Pattern
    if (pattern) {
      parts.push(`đúng định dạng quy định`);
    }

    if (parts.length > 0) {
      const constraints = parts.join(' và ');
      if (required) {
        return `${label} là bắt buộc và phải có ${constraints}.`;
      }
      return `${label} phải có ${constraints}.`;
    }

    if (required) {
      const actionVerb = this.getActionVerb(type);
      return `Vui lòng ${actionVerb} ${label}.`;
    }

    return '';
  }

  private getActionVerb(type: FieldType): string {
    switch (type) {
      case FieldType.SELECT:
      case FieldType.RADIO_GROUP:
      case FieldType.CHECKBOX:
      case FieldType.DATE_PICKER:
      case FieldType.DATE_RANGE:
        return 'chọn';
      case FieldType.FILE_UPLOAD:
        return 'tải lên tệp cho';
      case FieldType.RATE:
        return 'đánh giá';
      case FieldType.SWITCH:
        return 'xác nhận';
      default:
        return 'nhập';
    }
  }

  onCustomMessageInput(): void {
    this.isCustomMessageUserEdited.set(true);
  }

  resetToSuggestedMessage(): void {
    const suggested = this.generateSuggestedMessage();
    this.formGroup.controls.customMessage.setValue(suggested);
    this.isCustomMessageUserEdited.set(false);
    this.messageService.info('Đã tự động cập nhật thông báo lỗi theo các điều kiện validation');
  }

  private updateLivePreview(): void {
    const current = this.state.activeField();
    if (!current) {
      this.previewField.set(null);
      return;
    }

    const val = this.formGroup.getRawValue();
    const preview: any = {
      ...structuredClone(current),
      label: val.label,
      gridSpan: val.gridSpan
    };

    if (this.hasPlaceholder()) preview.placeholder = val.placeholder;

    if (!this.isContainer()) {
      preview.key = val.key;
      preview.defaultValue = val.defaultValue;
      preview.required = val.required;

      if (this.hasOptions()) preview.options = val.options;
      if (this.hasMinMaxStep()) {
        if (val.min !== null) preview.min = val.min;
        if (val.max !== null) preview.max = val.max;
        if (val.step !== null) preview.step = val.step;
      }
      if (this.isRate()) {
        if (val.count !== null) preview.count = val.count;
        preview.allowHalf = val.allowHalf;
      }
      if (this.isFileUpload()) {
        if (val.maxCount !== null) preview.maxCount = val.maxCount;
        preview.accept = val.accept;
      }

      // Validations
      const validations: FieldValidation = {};
      if (this.hasTextValidation()) {
        if (val.minLength !== null) validations.minLength = val.minLength;
        if (val.maxLength !== null) validations.maxLength = val.maxLength;
        if (val.pattern) validations.pattern = val.pattern;
      }
      if (this.hasNumberValidation()) {
        if (val.validationMin !== null) validations.min = val.validationMin;
        if (val.validationMax !== null) validations.max = val.validationMax;
      }
      if (val.customMessage && val.customMessage.trim()) {
        validations.customMessage = val.customMessage.trim();
      }

      if (Object.keys(validations).length > 0) {
        preview.validations = validations;
      }
    } else {
      if (this.isCard() || this.isCollapse()) preview.bordered = val.bordered;
      if (this.isTabs()) {
        preview.tabType = val.tabType;
        preview.tabPosition = val.tabPosition;
      }
      if (this.isCollapse()) preview.accordion = val.accordion;
      if (this.isSteps()) {
        preview.direction = val.direction;
        preview.size = val.size;
      }
      if (this.isContainerWithItems() && Array.isArray(val.items) && 'items' in current) {
        const existingItems = Array.isArray(current.items) ? current.items : [];
        preview.items = val.items.map((formItem: any) => {
          const matched = existingItems.find(ex => ex.id === formItem.id);
          return {
            id: formItem.id,
            title: formItem.title,
            description: formItem.description,
            fields: matched ? matched.fields : []
          };
        });
      }
    }

    this.previewField.set(preview as FieldSchema);

    // Sync preview form group control and update value (recursively for containers and child fields)
    this.syncPreviewFormGroup(preview as FieldSchema);
  }

  private syncPreviewFormGroup(preview: FieldSchema): void {
    const requiredKeys = new Set<string>();

    const collectAndSync = (f: any) => {
      if (!f) return;
      if (this.containerTypes.has(f.type)) {
        if (Array.isArray(f.fields)) {
          f.fields.forEach(collectAndSync);
        }
        if (Array.isArray(f.items)) {
          f.items.forEach((item: any) => {
            if (Array.isArray(item.fields)) {
              item.fields.forEach(collectAndSync);
            }
          });
        }
      } else {
        const key = f.key || f.id;
        requiredKeys.add(key);
        if (!this.previewFormGroup.contains(key)) {
          this.previewFormGroup.addControl(key, new FormControl(f.defaultValue ?? ''));
        } else {
          this.previewFormGroup.get(key)?.setValue(f.defaultValue ?? '', { emitEvent: false });
        }
      }
    };

    collectAndSync(preview);

    // Remove obsolete controls
    Object.keys(this.previewFormGroup.controls).forEach(k => {
      if (!requiredKeys.has(k)) {
        this.previewFormGroup.removeControl(k);
      }
    });
  }

  private createOptionGroup(label: string, value: unknown) {
    return this.fb.group({
      label: this.fb.nonNullable.control(label),
      value: this.fb.nonNullable.control(value)
    });
  }

  private createItemGroup(id: string, title: string, description: string) {
    return this.fb.group({
      id: this.fb.nonNullable.control(id),
      title: this.fb.nonNullable.control(title),
      description: this.fb.nonNullable.control(description)
    });
  }

  addOption(): void {
    const index = this.optionsArray.length + 1;
    this.optionsArray.push(this.createOptionGroup(`Option ${index}`, `option_${index}`));
    this.updateLivePreview();
  }

  removeOption(index: number): void {
    this.optionsArray.removeAt(index);
    this.updateLivePreview();
  }

  addContainerItem(): void {
    const count = this.itemsArray.length + 1;
    this.itemsArray.push(this.createItemGroup(uuidv4(), `${this.itemPrefix()} ${count}`, ''));
    this.updateLivePreview();
  }

  removeContainerItem(index: number): void {
    if (this.itemsArray.length <= 1) {
      this.messageService.warning('Container phải có ít nhất 1 mục');
      return;
    }
    this.itemsArray.removeAt(index);
    this.updateLivePreview();
  }

  togglePreview(): void {
    this.showPreview.update(v => !v);
  }

  onSave(): void {
    const active = this.state.activeField();
    if (!active) return;

    const val = this.formGroup.getRawValue();

    const conditions: FieldConditions | undefined = val.enableConditions && val.conditionFieldKey ? {
      action: val.conditionAction || 'show',
      matchType: val.conditionMatchType || 'all',
      rules: [
        {
          fieldKey: val.conditionFieldKey,
          operator: val.conditionOperator || 'equals',
          value: val.conditionValue
        }
      ]
    } : undefined;

    const updatePayload: Record<string, any> = {
      label: val.label,
      gridSpan: val.gridSpan,
      conditions
    };

    if (!this.isContainer()) {
      updatePayload['key'] = val.key;
      updatePayload['defaultValue'] = val.defaultValue;
      updatePayload['required'] = val.required;

      if (this.hasPlaceholder()) updatePayload['placeholder'] = val.placeholder;
      if (this.hasOptions()) updatePayload['options'] = val.options as FieldOption[];
      if (this.hasMinMaxStep()) {
        if (val.min !== null) updatePayload['min'] = val.min;
        if (val.max !== null) updatePayload['max'] = val.max;
        if (val.step !== null) updatePayload['step'] = val.step;
      }
      if (this.isRate()) {
        if (val.count !== null) updatePayload['count'] = val.count;
        updatePayload['allowHalf'] = val.allowHalf;
      }
      if (this.isFileUpload()) {
        if (val.maxCount !== null) updatePayload['maxCount'] = val.maxCount;
        if (val.accept) updatePayload['accept'] = val.accept;
      }

      // Validations
      const validations: FieldValidation = {};
      if (this.hasTextValidation()) {
        if (val.minLength !== null) validations.minLength = val.minLength;
        if (val.maxLength !== null) validations.maxLength = val.maxLength;
        if (val.pattern) validations.pattern = val.pattern;
      }
      if (this.hasNumberValidation()) {
        if (val.validationMin !== null) validations.min = val.validationMin;
        if (val.validationMax !== null) validations.max = val.validationMax;
      }
      if (val.customMessage && val.customMessage.trim()) {
        validations.customMessage = val.customMessage.trim();
      }

      if (Object.keys(validations).length > 0) {
        updatePayload['validations'] = validations;
      } else {
        delete updatePayload['validations'];
      }
    } else {
      if (this.isCard() || this.isCollapse()) updatePayload['bordered'] = val.bordered;
      if (this.isTabs()) {
        updatePayload['tabType'] = val.tabType;
        updatePayload['tabPosition'] = val.tabPosition;
      }
      if (this.isCollapse()) updatePayload['accordion'] = val.accordion;
      if (this.isSteps()) {
        updatePayload['direction'] = val.direction;
        updatePayload['size'] = val.size;
      }

      if (this.isContainerWithItems() && val.items && Array.isArray(val.items) && 'items' in active) {
        const existingItems = Array.isArray(active.items) ? active.items : [];
        updatePayload['items'] = val.items.map((formItem: any) => {
          const matched = existingItems.find(ex => ex.id === formItem.id);
          return {
            id: formItem.id,
            title: formItem.title,
            description: formItem.description,
            fields: matched ? matched.fields : []
          };
        });
      }
    }

    this.state.updateActiveField(updatePayload as Partial<FieldSchema>);
    this.state.closeConfigModal();
    this.messageService.success('Đã lưu cấu hình trường thành công');
  }

  onCancel(): void {
    this.state.closeConfigModal();
  }

  onRemove(): void {
    const active = this.state.activeField();
    if (active) {
      this.state.deleteField(active.id);
      this.state.closeConfigModal();
      this.messageService.success('Đã xóa trường');
    }
  }
}
