import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzFormModule } from 'ng-zorro-antd/form';
import { DateFieldSchema } from '../../../../core/models/schema.model';

@Component({
  selector: 'app-date-field',
  imports: [CommonModule, ReactiveFormsModule, NzDatePickerModule, NzFormModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nz-form-item [formGroup]="formGroup()">
      @if (field().label) {
        <nz-form-label [nzRequired]="field().required" [nzFor]="field().key || field().id">{{ field().label }}</nz-form-label>
      }
      <nz-form-control [nzErrorTip]="'Please check your ' + field().label">
        <nz-date-picker [formControlName]="field().key || field().id" [id]="field().key || field().id" style="width: 100%"></nz-date-picker>
      </nz-form-control>
    </nz-form-item>
  `
})
export class DateFieldComponent {
  readonly field = input.required<DateFieldSchema>();
  readonly formGroup = input.required<FormGroup>();
}
