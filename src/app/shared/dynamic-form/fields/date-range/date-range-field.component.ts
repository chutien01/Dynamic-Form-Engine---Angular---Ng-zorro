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
      <nz-form-control [nzErrorTip]="field().validations?.customMessage || ('Vui lòng chọn ' + (field().label || 'khoảng thời gian'))">
        <nz-range-picker 
          [formControlName]="field().key || field().id" 
          [id]="field().key || field().id" 
          [nzPlaceHolder]="getPlaceholders()"
          style="width: 100%">
        </nz-range-picker>
      </nz-form-control>
    </nz-form-item>
  `
})
export class DateRangeFieldComponent {
  readonly field = input.required<DateRangeFieldSchema>();
  readonly formGroup = input.required<FormGroup>();

  getPlaceholders(): [string, string] {
    const p = this.field().placeholder;
    if (Array.isArray(p) && p.length >= 2) {
      return [p[0], p[1]];
    }
    if (typeof p === 'string' && p) {
      return [p, p];
    }
    return ['Từ ngày', 'Đến ngày'];
  }
}
