import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NumberFieldSchema } from '../../../../core/models/schema.model';

@Component({
  selector: 'app-number-field',
  imports: [CommonModule, ReactiveFormsModule, NzInputNumberModule, NzFormModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nz-form-item [formGroup]="formGroup()">
      @if (field().label) {
        <nz-form-label [nzRequired]="field().required" [nzFor]="field().key || field().id">{{ field().label }}</nz-form-label>
      }
      <nz-form-control [nzErrorTip]="'Please check your ' + field().label">
        <nz-input-number [formControlName]="field().key || field().id" [id]="field().key || field().id" [nzPlaceHolder]="field().placeholder || ''" style="width: 100%"></nz-input-number>
      </nz-form-control>
    </nz-form-item>
  `
})
export class NumberFieldComponent {
  readonly field = input.required<NumberFieldSchema>();
  readonly formGroup = input.required<FormGroup>();
}
