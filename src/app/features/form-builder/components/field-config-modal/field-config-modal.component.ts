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
import { NzRadioModule } from 'ng-zorro-antd/radio';
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
  CardFieldSchema,
  TabsFieldSchema,
  CollapseFieldSchema,
  StepsFieldSchema
} from '../../../../core/models/schema.model';

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
    NzRadioModule,
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

  private readonly placeholderTypes = new Set<string>([
    FieldType.TEXT_INPUT,
    FieldType.TEXT_AREA,
    FieldType.NUMBER,
    FieldType.SELECT,
    FieldType.DATE_PICKER,
    FieldType.DATE_RANGE
  ]);

  private readonly optionTypes = new Set<string>([
    FieldType.SELECT,
    FieldType.RADIO_GROUP,
    FieldType.CHECKBOX
  ]);

  private readonly rangeTypes = new Set<string>([
    FieldType.NUMBER,
    FieldType.SLIDER
  ]);

  private readonly containerWithItemTypes = new Set<string>([
    FieldType.TABS,
    FieldType.COLLAPSE,
    FieldType.STEPS
  ]);

  readonly isCardField = computed(() => {
    const current = this.state.activeField();
    return current ? current.type === FieldType.CARD : false;
  });

  readonly isContainerWithItems = computed(() => {
    const current = this.state.activeField();
    return current ? this.containerWithItemTypes.has(current.type) : false;
  });

  readonly isContainerField = computed(() => {
    const current = this.state.activeField();
    return current ? (
      current.type === FieldType.CARD ||
      current.type === FieldType.TABS ||
      current.type === FieldType.COLLAPSE ||
      current.type === FieldType.STEPS
    ) : false;
  });

  readonly hasPlaceholder = computed(() => {
    const current = this.state.activeField();
    return current ? this.placeholderTypes.has(current.type) : false;
  });

  readonly hasOptions = computed(() => {
    const current = this.state.activeField();
    return current ? this.optionTypes.has(current.type) : false;
  });

  readonly hasRange = computed(() => {
    const current = this.state.activeField();
    return current ? this.rangeTypes.has(current.type) : false;
  });

  readonly isRateField = computed(() => {
    const current = this.state.activeField();
    return current ? current.type === FieldType.RATE : false;
  });

  readonly isFileUploadField = computed(() => {
    const current = this.state.activeField();
    return current ? current.type === FieldType.FILE_UPLOAD : false;
  });

  readonly isTabsField = computed(() => {
    const current = this.state.activeField();
    return current ? current.type === FieldType.TABS : false;
  });

  readonly isCollapseField = computed(() => {
    const current = this.state.activeField();
    return current ? current.type === FieldType.COLLAPSE : false;
  });

  readonly isStepsField = computed(() => {
    const current = this.state.activeField();
    return current ? current.type === FieldType.STEPS : false;
  });

  readonly availableTriggerFields = computed(() => {
    const active = this.state.activeField();
    if (!active) return [];
    return this.state.schema().fields.filter(f => f.id !== active.id);
  });

  readonly formGroup = this.fb.group({
    // Display Tab
    label: this.fb.nonNullable.control(''),
    labelPosition: this.fb.nonNullable.control<'top' | 'left' | 'right'>('top'),
    placeholder: this.fb.nonNullable.control(''),
    description: this.fb.nonNullable.control(''),
    tooltip: this.fb.nonNullable.control(''),
    prefix: this.fb.nonNullable.control(''),
    suffix: this.fb.nonNullable.control(''),
    gridSpan: this.fb.nonNullable.control(24),
    disabled: this.fb.nonNullable.control(false),
    hidden: this.fb.nonNullable.control(false),

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
    customErrorMessage: this.fb.nonNullable.control(''),

    // Conditional Tab
    enableConditions: this.fb.nonNullable.control(false),
    conditionAction: this.fb.nonNullable.control<ConditionAction>('show'),
    conditionFieldKey: this.fb.nonNullable.control(''),
    conditionOperator: this.fb.nonNullable.control<ConditionOperator>('equals'),
    conditionValue: this.fb.nonNullable.control<unknown>(''),
    conditionMatchType: this.fb.nonNullable.control<'all' | 'any'>('all'),

    // API Tab
    apiUrl: this.fb.nonNullable.control(''),
    apiMethod: this.fb.nonNullable.control<'GET' | 'POST'>('GET'),
    apiDataPath: this.fb.nonNullable.control(''),

    // Logic Tab
    customLogic: this.fb.nonNullable.control(''),

    // Layout / Container Tab
    items: this.fb.array<FormGroup<{ id: FormControl<string>; title: FormControl<string>; description: FormControl<string> }>>([]),
    bordered: this.fb.nonNullable.control(true),
    tabType: this.fb.nonNullable.control<'line' | 'card'>('line'),
    tabPosition: this.fb.nonNullable.control<'top' | 'left' | 'right' | 'bottom'>('top'),
    accordion: this.fb.nonNullable.control(false),
    direction: this.fb.nonNullable.control<'horizontal' | 'vertical'>('horizontal'),
    size: this.fb.nonNullable.control<'default' | 'small'>('default')
  });

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

  readonly triggerFieldOptions = computed(() => {
    const triggerKey = this.currentTriggerKey();
    if (!triggerKey) return [];
    const field = this.state.schema().fields.find(f => f.key === triggerKey || f.id === triggerKey);
    if (field && 'options' in field && Array.isArray(field.options)) {
      return field.options;
    }
    return [];
  });

  private lastLoadedFieldId: string | null = null;

  constructor() {
    // Real-time Live Preview computation
    this.formGroup.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.updateLivePreview();
      });

    // Populate modal when activeField or modal visibility changes
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
    const anyField = field as any;
    const placeholder = typeof anyField.placeholder === 'string' ? anyField.placeholder : '';
    const hasConditions = !!(field.conditions && field.conditions.rules?.length);
    const firstRule = hasConditions ? field.conditions!.rules[0] : null;

    this.formGroup.patchValue({
      label: field.label || '',
      labelPosition: anyField.labelPosition || 'top',
      placeholder,
      description: anyField.description || '',
      tooltip: anyField.tooltip || '',
      prefix: anyField.prefix || '',
      suffix: anyField.suffix || '',
      gridSpan: field.gridSpan || 24,
      disabled: !!anyField.disabled,
      hidden: !!anyField.hidden,

      key: field.key || field.id,
      defaultValue: field.defaultValue ?? null,
      min: anyField.min ?? null,
      max: anyField.max ?? null,
      step: anyField.step ?? null,
      count: anyField.count ?? 5,
      allowHalf: !!anyField.allowHalf,
      maxCount: anyField.maxCount ?? 1,
      accept: anyField.accept || '',

      required: !!field.required,
      minLength: field.validations?.minLength ?? null,
      maxLength: field.validations?.maxLength ?? null,
      pattern: field.validations?.pattern || '',
      customErrorMessage: anyField.customErrorMessage || '',

      enableConditions: hasConditions,
      conditionAction: field.conditions?.action || 'show',
      conditionFieldKey: firstRule?.fieldKey || '',
      conditionOperator: firstRule?.operator || 'equals',
      conditionValue: firstRule?.value ?? '',
      conditionMatchType: field.conditions?.matchType || 'all',

      apiUrl: anyField.apiUrl || '',
      apiMethod: anyField.apiMethod || 'GET',
      apiDataPath: anyField.apiDataPath || '',
      customLogic: anyField.customLogic || '',

      bordered: anyField.bordered ?? true,
      tabType: anyField.tabType || 'line',
      tabPosition: anyField.tabPosition || 'top',
      accordion: !!anyField.accordion,
      direction: anyField.direction || 'horizontal',
      size: anyField.size || 'default'
    }, { emitEvent: false });

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
      key: val.key,
      placeholder: val.placeholder,
      required: val.required,
      gridSpan: val.gridSpan,
      defaultValue: val.defaultValue,
      options: val.options
    };

    if (val.min !== null) preview.min = val.min;
    if (val.max !== null) preview.max = val.max;
    if (val.step !== null) preview.step = val.step;
    if (val.count !== null) preview.count = val.count;
    preview.allowHalf = val.allowHalf;
    if (val.maxCount !== null) preview.maxCount = val.maxCount;
    preview.accept = val.accept;

    preview.bordered = val.bordered;
    preview.tabType = val.tabType;
    preview.tabPosition = val.tabPosition;
    preview.accordion = val.accordion;
    preview.direction = val.direction;
    preview.size = val.size;

    if (Array.isArray(val.items) && 'items' in current) {
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

    this.previewField.set(preview as FieldSchema);

    // Sync preview form group control
    const controlKey = preview.key || preview.id;
    if (!this.previewFormGroup.contains(controlKey)) {
      this.previewFormGroup.addControl(controlKey, new FormControl(preview.defaultValue ?? ''));
    }
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
    const type = this.state.activeField()?.type;
    const prefix = type === FieldType.STEPS ? 'Step' : (type === FieldType.COLLAPSE ? 'Panel' : 'Tab');
    this.itemsArray.push(this.createItemGroup(uuidv4(), `${prefix} ${count}`, ''));
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

    const validations = {
      ...(val.minLength !== null ? { minLength: val.minLength } : {}),
      ...(val.maxLength !== null ? { maxLength: val.maxLength } : {}),
      ...(val.pattern ? { pattern: val.pattern } : {})
    };

    const updatePayload: Partial<FieldSchema> = {
      key: val.key,
      label: val.label,
      placeholder: val.placeholder,
      required: val.required,
      gridSpan: val.gridSpan,
      defaultValue: val.defaultValue,
      options: val.options as FieldOption[],
      validations: Object.keys(validations).length ? validations : undefined,
      conditions
    };

    const anyPayload = updatePayload as any;
    if (val.labelPosition) anyPayload.labelPosition = val.labelPosition;
    if (val.description) anyPayload.description = val.description;
    if (val.tooltip) anyPayload.tooltip = val.tooltip;
    if (val.prefix) anyPayload.prefix = val.prefix;
    if (val.suffix) anyPayload.suffix = val.suffix;
    anyPayload.disabled = val.disabled;
    anyPayload.hidden = val.hidden;

    if (val.min !== null) anyPayload.min = val.min;
    if (val.max !== null) anyPayload.max = val.max;
    if (val.step !== null) anyPayload.step = val.step;
    if (val.count !== null) anyPayload.count = val.count;
    anyPayload.allowHalf = val.allowHalf;
    if (val.maxCount !== null) anyPayload.maxCount = val.maxCount;
    if (val.accept) anyPayload.accept = val.accept;

    if (val.apiUrl) anyPayload.apiUrl = val.apiUrl;
    if (val.apiMethod) anyPayload.apiMethod = val.apiMethod;
    if (val.apiDataPath) anyPayload.apiDataPath = val.apiDataPath;
    if (val.customLogic) anyPayload.customLogic = val.customLogic;

    if (val.bordered !== undefined) anyPayload.bordered = val.bordered;
    if (val.tabType) anyPayload.tabType = val.tabType;
    if (val.tabPosition) anyPayload.tabPosition = val.tabPosition;
    if (val.accordion !== undefined) anyPayload.accordion = val.accordion;
    if (val.direction) anyPayload.direction = val.direction;
    if (val.size) anyPayload.size = val.size;

    if (val.items && Array.isArray(val.items) && 'items' in active) {
      const existingItems = Array.isArray(active.items) ? active.items : [];
      anyPayload.items = val.items.map((formItem: any) => {
        const matched = existingItems.find(ex => ex.id === formItem.id);
        return {
          id: formItem.id,
          title: formItem.title,
          description: formItem.description,
          fields: matched ? matched.fields : []
        };
      });
    }

    this.state.updateActiveField(updatePayload);
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
