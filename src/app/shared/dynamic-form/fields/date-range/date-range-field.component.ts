import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzFormModule } from 'ng-zorro-antd/form';
import { DateRangeFieldSchema } from '../../../../core/models/schema.model';

@Component({
  selector: 'app-date-range-field',
  imports: [ReactiveFormsModule, NzDatePickerModule, NzFormModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nz-form-item [formGroup]="formGroup()">
      @if (field().label) {
        <nz-form-label [nzRequired]="field().required" [nzFor]="field().key || field().id">{{ field().label }}</nz-form-label>
      }
      <nz-form-control [nzErrorTip]="'Please check your ' + field().label">
        <nz-range-picker [formControlName]="field().key || field().id" [id]="field().key || field().id" style="width: 100%"></nz-range-picker>
      </nz-form-control>
    </nz-form-item>
  `
})
export class DateRangeFieldComponent {
  readonly field = input.required<DateRangeFieldSchema>();
  readonly formGroup = input.required<FormGroup>();
}
