import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzFormModule } from 'ng-zorro-antd/form';
import { CheckboxFieldSchema } from '../../../../core/models/schema.model';

@Component({
  selector: 'app-checkbox-field',
  imports: [ReactiveFormsModule, NzCheckboxModule, NzFormModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nz-form-item [formGroup]="formGroup()">
      @if (field().label) {
        <nz-form-label [nzRequired]="field().required" [nzFor]="field().key || field().id">{{ field().label }}</nz-form-label>
      }
      <nz-form-control [nzErrorTip]="'Please check your ' + field().label">
        @if (field().options && field().options!.length > 0) {
          <div class="w-full flex gap-4 flex-wrap">
            @for (opt of field().options; track opt.value) {
              <label 
                nz-checkbox 
                [nzValue]="opt.value" 
                [nzChecked]="isOptionChecked(opt.value)"
                [nzDisabled]="isControlDisabled()"
                (nzCheckedChange)="onOptionToggle(opt.value, $event)"
              >
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

  onOptionToggle(value: unknown, checked: boolean): void {
    const controlName = this.field().key || this.field().id;
    const control = this.formGroup().get(controlName);
    if (control) {
      const currentVal = Array.isArray(control.value) ? [...control.value] : [];
      if (checked) {
        if (!currentVal.includes(value)) {
          currentVal.push(value);
        }
      } else {
        const idx = currentVal.indexOf(value);
        if (idx !== -1) {
          currentVal.splice(idx, 1);
        }
      }
      control.setValue(currentVal);
      control.markAsDirty();
    }
  }

  isOptionChecked(value: unknown): boolean {
    const controlName = this.field().key || this.field().id;
    const control = this.formGroup().get(controlName);
    const currentValue = control?.value;
    return Array.isArray(currentValue) ? currentValue.includes(value) : false;
  }

  isControlDisabled(): boolean {
    const controlName = this.field().key || this.field().id;
    const control = this.formGroup().get(controlName);
    return control?.disabled ?? false;
  }
}
