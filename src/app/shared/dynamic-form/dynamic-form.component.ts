import { Component, effect, input, output, Type, inject, ChangeDetectionStrategy } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { NgComponentOutlet } from '@angular/common';
import { FormSchema, FieldSchema, FieldType } from '../../core/models/schema.model';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { FieldRegistryService } from './services/field-registry.service';

@Component({
  selector: 'app-dynamic-form',
  imports: [
    NgComponentOutlet,
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
  readonly formSubmit = output<Record<string, unknown>>();

  readonly formGroup = new FormGroup({});

  private readonly registry = inject(FieldRegistryService);

  constructor() {
    effect(() => {
      const currentSchema = this.schema();
      if (currentSchema) {
        this.syncFormControls(currentSchema);
      }
    });
  }

  getComponentForType(type: FieldType): Type<unknown> {
    return this.registry.getComponent(type);
  }

  private buildValidators(field: FieldSchema): ValidatorFn[] {
    const validators: ValidatorFn[] = [];
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
    return validators;
  }

  private syncFormControls(schema: FormSchema): void {
    const activeKeys = new Set<string>();

    schema.fields.forEach((field: FieldSchema) => {
      const controlKey = field.key || field.id;
      activeKeys.add(controlKey);
      const validators = this.buildValidators(field);

      if (this.formGroup.contains(controlKey)) {
        const control = this.formGroup.get(controlKey);
        control?.setValidators(validators);
        control?.updateValueAndValidity({ emitEvent: false });
      } else {
        this.formGroup.addControl(
          controlKey,
          new FormControl(field.defaultValue ?? null, validators),
          { emitEvent: false }
        );
      }
    });

    // Remove orphaned controls
    Object.keys(this.formGroup.controls).forEach(key => {
      if (!activeKeys.has(key)) {
        this.formGroup.removeControl(key, { emitEvent: false });
      }
    });
  }

  onSubmit(): void {
    if (this.formGroup.valid) {
      this.formSubmit.emit(this.formGroup.getRawValue() as Record<string, unknown>);
    } else {
      (Object.values(this.formGroup.controls) as AbstractControl[]).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }
}
