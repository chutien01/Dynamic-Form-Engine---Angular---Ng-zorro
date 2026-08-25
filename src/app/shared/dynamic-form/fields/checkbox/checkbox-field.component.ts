import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzFormModule } from 'ng-zorro-antd/form';
import { CheckboxFieldSchema } from '../../../../core/models/schema.model';

@Component({
  selector: 'app-checkbox-field',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NzCheckboxModule, NzFormModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nz-form-item [formGroup]="formGroup()">
      @if (field().label) {
        <nz-form-label [nzRequired]="field().required" [nzFor]="field().key || field().id">{{ field().label }}</nz-form-label>
      }
      <nz-form-control [nzErrorTip]="'Please check your ' + field().label">
        @if (field().options?.length) {
          <div class="w-full flex gap-4 flex-wrap">
            @for (opt of field().options; track opt.value) {
              <label nz-checkbox [nzValue]="opt.value" [ngModel]="isOptionChecked(opt.value)" (ngModelChange)="onOptionChange(opt.value, $event)" [ngModelOptions]="{standalone: true}" [nzDisabled]="formGroup().get(field().key || field().id)?.disabled || false">
                {{ opt.label }}
              </label>
            }
          </div>
        } @else {
          <label nz-checkbox [formControlName]="field().key || field().id" [id]="field().key || field().id">
            {{ field().label }}
          </label>
        }
      </nz-form-control>
    </nz-form-item>
  `
})
export class CheckboxFieldComponent {
  readonly field = input.required<CheckboxFieldSchema>();
  readonly formGroup = input.required<FormGroup>();

  onOptionChange(value: any, checked: boolean): void {
    const controlName = this.field().key || this.field().id;
    const control = this.formGroup().get(controlName);
    if (control) {
      let currentValue = control.value;
      if (!Array.isArray(currentValue)) {
        currentValue = [];
      }
      
      if (checked) {
        if (!currentValue.includes(value)) {
          control.setValue([...currentValue, value]);
        }
      } else {
        control.setValue(currentValue.filter((v: any) => v !== value));
      }
      control.markAsDirty();
    }
  }

  isOptionChecked(value: any): boolean {
    const controlName = this.field().key || this.field().id;
    const control = this.formGroup().get(controlName);
    const currentValue = control?.value;
    if (Array.isArray(currentValue)) {
      return currentValue.includes(value);
    }
    return false;
  }
}
