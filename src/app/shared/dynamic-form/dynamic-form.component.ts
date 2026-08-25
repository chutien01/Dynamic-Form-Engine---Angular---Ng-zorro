import { Component, effect, input, output, Type, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormSchema, FieldSchema, FieldType } from '../../core/models/schema.model';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { FieldRegistryService } from './services/field-registry.service';

@Component({
  selector: 'app-dynamic-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzButtonModule,
    NzGridModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.scss']
})
export class DynamicFormComponent {
  readonly schema = input.required<FormSchema>();
  readonly formSubmit = output<any>();

  formGroup!: FormGroup;

  private fb = inject(FormBuilder);
  private registry = inject(FieldRegistryService);

  constructor() {
    effect(() => {
      const currentSchema = this.schema();
      if (currentSchema) {
        this.initForm(currentSchema);
      }
    });
  }

  getComponentForType(type: FieldType): Type<any> {
    return this.registry.getComponent(type);
  }

  private initForm(schema: FormSchema): void {
    const group: any = {};

    schema.fields.forEach((field: FieldSchema) => {
      const validators = [];
      if (field.required) {
        validators.push(Validators.required);
      }
      
      if (field.validations) {
        if (field.validations.min !== undefined) validators.push(Validators.min(field.validations.min));
        if (field.validations.max !== undefined) validators.push(Validators.max(field.validations.max));
        if (field.validations.minLength !== undefined) validators.push(Validators.minLength(field.validations.minLength));
        if (field.validations.maxLength !== undefined) validators.push(Validators.maxLength(field.validations.maxLength));
        if (field.validations.pattern) validators.push(Validators.pattern(field.validations.pattern));
      }

      const controlKey = field.key || field.id;
      group[controlKey] = [field.defaultValue || null, validators];
    });

    this.formGroup = this.fb.group(group);
  }

  onSubmit(): void {
    if (this.formGroup.valid) {
      this.formSubmit.emit(this.formGroup.value);
    } else {
      Object.values(this.formGroup.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }
}
