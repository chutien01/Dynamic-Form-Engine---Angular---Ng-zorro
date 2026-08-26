import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NzRateModule } from 'ng-zorro-antd/rate';
import { NzFormModule } from 'ng-zorro-antd/form';
import { RateFieldSchema } from '../../../../core/models/schema.model';

@Component({
  selector: 'app-rate-field',
  imports: [ReactiveFormsModule, NzRateModule, NzFormModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nz-form-item [formGroup]="formGroup()">
      @if (field().label) {
        <nz-form-label [nzRequired]="field().required" [nzFor]="field().key || field().id">{{ field().label }}</nz-form-label>
      }
      <nz-form-control [nzErrorTip]="field().validations?.customMessage || ('Vui lòng đánh giá ' + (field().label || 'trường này'))">
        <nz-rate [formControlName]="field().key || field().id" [nzCount]="field().count || 5" [nzAllowHalf]="!!field().allowHalf"></nz-rate>
      </nz-form-control>
    </nz-form-item>
  `
})
export class RateFieldComponent {
  readonly field = input.required<RateFieldSchema>();
  readonly formGroup = input.required<FormGroup>();
}
