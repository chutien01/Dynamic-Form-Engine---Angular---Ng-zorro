import { Component, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzMessageService } from 'ng-zorro-antd/message';
import { FormBuilderStateService } from '../../services/form-builder.state.service';
import { FieldSchema, FieldType } from '../../../../core/models/schema.model';

@Component({
  selector: 'app-properties-panel',
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    NzFormModule, 
    NzInputModule, 
    NzSwitchModule, 
    NzInputNumberModule, 
    NzButtonModule,
    NzPopconfirmModule
  ],
  template: `
    <div class="p-4 bg-white border-l border-gray-200 h-full overflow-y-auto shadow-sm flex flex-col justify-between" (click)="$event.stopPropagation()">
      <div>
        <h3 class="font-bold text-lg mb-4 text-gray-800 border-b pb-2">Properties</h3>
        
        @if (!state.activeField()) {
          <div class="text-gray-500 text-sm text-center py-10">
            <span class="block text-2xl mb-2">⚙️</span>
            Select a field on the canvas to edit its properties.
          </div>
        }

        @if (state.activeField(); as currentField) {
          <form nz-form [nzLayout]="'vertical'" [formGroup]="formGroup">
            <div class="mb-4 p-2 bg-blue-50 text-blue-800 text-xs rounded font-mono break-all border border-blue-100 flex justify-between items-center">
              <div>
                <!-- ID: {{ currentField.id }} -->
                Type: {{ currentField.type }}
                <br/>Key: {{ currentField.key || currentField.id }}
              </div>
            </div>

            <nz-form-item>
              <nz-form-label nzRequired>Key (Payload Key)</nz-form-label>
              <nz-form-control nzExtra="Tên key định danh dữ liệu khi submit">
                <input nz-input formControlName="key" placeholder="e.g. username, email" />
              </nz-form-control>
            </nz-form-item>

            <nz-form-item>
              <nz-form-label>Label</nz-form-label>
              <nz-form-control>
                <input nz-input formControlName="label" />
              </nz-form-control>
            </nz-form-item>

            @if (hasPlaceholder()) {
              <nz-form-item>
                <nz-form-label>Placeholder</nz-form-label>
                <nz-form-control>
                  <input nz-input formControlName="placeholder" />
                </nz-form-control>
              </nz-form-item>
            }

            <nz-form-item>
              <nz-form-label>Required</nz-form-label>
              <nz-form-control>
                <nz-switch formControlName="required"></nz-switch>
              </nz-form-control>
            </nz-form-item>

            <nz-form-item>
              <nz-form-label>Grid Span (1-24)</nz-form-label>
              <nz-form-control>
                <nz-input-number formControlName="gridSpan" [nzMin]="1" [nzMax]="24" style="width:100%"></nz-input-number>
              </nz-form-control>
            </nz-form-item>
            
            @if (hasOptions()) {
              <div class="mt-4 border-t pt-4">
                 <h4 class="font-semibold text-gray-700 mb-2">Options</h4>
                 <div formArrayName="options">
                   @for (opt of optionsArray.controls; track $index) {
                     <div [formGroupName]="$index" class="flex gap-2 mb-2">
                       <input nz-input formControlName="label" placeholder="Label" class="w-1/2" />
                       <input nz-input formControlName="value" placeholder="Value" class="w-1/2" />
                       <button nz-button nzType="text" nzDanger (click)="removeOption($index)">X</button>
                     </div>
                   }
                 </div>
                 <button nz-button nzType="dashed" class="w-full mt-2" (click)="addOption()">+ Add Option</button>
              </div>
            }
          </form>
        }
      </div>

      @if (state.activeField(); as currentField) {
        <div class="mt-6 pt-4 border-t border-gray-200 flex flex-col gap-2">
          <button 
            type="button"
            nz-button 
            nzType="default" 
            class="w-full flex items-center justify-center gap-1.5"
            (click)="duplicateCurrentField()"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            <span>Duplicate Field</span>
          </button>
          <button 
            type="button"
            nz-button 
            nzDanger 
            class="w-full flex items-center justify-center gap-1.5"
            nz-popconfirm
            nzPopconfirmTitle="Bạn có chắc chắn muốn xóa trường này?"
            nzOkText="Xóa"
            nzCancelText="Hủy"
            nzOkDanger
            (nzOnConfirm)="deleteCurrentField()"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
            <span>Delete Field</span>
          </button>
        </div>
      }
    </div>
  `
})
export class PropertiesPanelComponent {
  state = inject(FormBuilderStateService);
  messageService = inject(NzMessageService);
  formGroup: FormGroup;

  hasPlaceholder = computed(() => {
    const currentField = this.state.activeField();
    return currentField ? [
      FieldType.TEXT_INPUT,
      FieldType.TEXT_AREA,
      FieldType.NUMBER,
      FieldType.SELECT,
      'text',
      'textarea',
      'number',
      'select'
    ].includes(currentField.type) : false;
  });

  hasOptions = computed(() => {
    const currentField = this.state.activeField();
    return currentField ? [
      FieldType.SELECT,
      FieldType.RADIO_GROUP,
      FieldType.CHECKBOX,
      'select',
      'radio',
      'checkbox'
    ].includes(currentField.type) : false;
  });

  private fb = inject(FormBuilder);
  private lastFieldId: string | null = null;

  constructor() {
    this.formGroup = this.fb.group({
      key: [''],
      label: [''],
      placeholder: [''],
      required: [false],
      gridSpan: [24],
      options: this.fb.array([])
    });

    this.formGroup.valueChanges.subscribe(value => {
      if (this.state.activeField()) {
        this.state.updateActiveField(value);
      }
    });

    // Effect to patch values when signal input changes
    effect(() => {
      const currentField = this.state.activeField();
      if (currentField && currentField.id !== this.lastFieldId) {
        this.lastFieldId = currentField.id;
        
        this.formGroup.patchValue({
          key: currentField.key || currentField.id,
          label: currentField.label || '',
          placeholder: 'placeholder' in currentField ? (currentField as any).placeholder : '',
          required: !!currentField.required,
          gridSpan: currentField.gridSpan || 24
        }, { emitEvent: false });

        const supportsOptions = [
          FieldType.SELECT,
          FieldType.RADIO_GROUP,
          FieldType.CHECKBOX,
          'select',
          'radio',
          'checkbox'
        ].includes(currentField.type);
        if (supportsOptions) {
          this.optionsArray.clear({ emitEvent: false });
          const options = (currentField as any).options;
          if (options && Array.isArray(options)) {
            options.forEach((opt: any) => {
              this.optionsArray.push(this.fb.group({
                label: [opt.label],
                value: [opt.value]
              }), { emitEvent: false });
            });
          }
        } else {
          this.optionsArray.clear({ emitEvent: false });
        }
      } else if (!currentField) {
        this.lastFieldId = null;
      }
    });
  }

  get optionsArray(): FormArray {
    return this.formGroup.get('options') as FormArray;
  }

  addOption() {
    const index = this.optionsArray.length + 1;
    this.optionsArray.push(this.fb.group({
      label: [`Option ${index}`],
      value: [`option_${index}`]
    }));
  }

  removeOption(index: number) {
    this.optionsArray.removeAt(index);
  }

  duplicateCurrentField() {
    const activeId = this.state.activeFieldId();
    if (activeId) {
      this.state.duplicateField(activeId);
      this.messageService.success('Đã nhân bản trường');
    }
  }

  deleteCurrentField() {
    const activeId = this.state.activeFieldId();
    if (activeId) {
      this.state.deleteField(activeId);
      this.messageService.success('Đã xóa trường');
    }
  }
}

