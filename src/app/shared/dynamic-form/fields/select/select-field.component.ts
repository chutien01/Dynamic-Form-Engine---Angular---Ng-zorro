import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzFormModule } from 'ng-zorro-antd/form';
import { SelectFieldSchema } from '../../../../core/models/schema.model';

@Component({
  selector: 'app-select-field',
  imports: [ReactiveFormsModule, NzSelectModule, NzFormModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nz-form-item [formGroup]="formGroup()">
      @if (field().label) {
        <nz-form-label [nzRequired]="field().required" [nzFor]="field().key || field().id">{{ field().label }}</nz-form-label>
      }
      <nz-form-control [nzErrorTip]="'Please check your ' + field().label">
        <nz-select [formControlName]="field().key || field().id" [id]="field().key || field().id" [nzPlaceHolder]="field().placeholder || ''">
          @for (option of field().options; track option.value) {
            <nz-option [nzValue]="option.value" [nzLabel]="option.label"></nz-option>
          }
        </nz-select>
      </nz-form-control>
    </nz-form-item>
  `
})
export class SelectFieldComponent {
  readonly field = input.required<SelectFieldSchema>();
  readonly formGroup = input.required<FormGroup>();
}
