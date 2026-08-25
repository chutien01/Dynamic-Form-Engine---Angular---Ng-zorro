import { Component, effect, input, output, Type, inject, signal, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgComponentOutlet } from '@angular/common';
import { FormSchema, FieldSchema, FieldType } from '../../core/models/schema.model';
import { ConditionEvaluatorService } from '../../core/services/condition-evaluator.service';
import { extractAllLeafFields, extractAllFieldsRecursive } from '../../core/utils/schema.utils';
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
  readonly formValues = signal<Record<string, unknown>>({});

  private readonly registry = inject(FieldRegistryService);
  private readonly evaluator = inject(ConditionEvaluatorService);
  private readonly cdr = inject(ChangeDetectorRef);

  constructor() {
    this.formGroup.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.formValues.set(this.formGroup.getRawValue());
        this.applyConditionalStates();
        this.cdr.markForCheck();
      });

    effect(() => {
      const currentSchema = this.schema();
      if (currentSchema) {
        this.syncFormControls(currentSchema);
        this.formValues.set(this.formGroup.getRawValue());
        this.applyConditionalStates();
        this.cdr.markForCheck();
      }
    });
  }

  getComponentForType(type: FieldType): Type<unknown> {
    return this.registry.getComponent(type);
  }

  isFieldVisible(field: FieldSchema): boolean {
    return this.evaluator.isFieldVisible(field, this.formValues(), this.schema());
  }

  private applyConditionalStates(): void {
    const currentSchema = this.schema();
    if (!currentSchema?.fields) return;

    const values = this.formValues();
    const allFields = extractAllFieldsRecursive(currentSchema.fields);

    allFields.forEach(field => {
      const controlKey = field.key || field.id;
      const control = this.formGroup.get(controlKey);
      if (!control) return;

      const isVisible = this.evaluator.isFieldVisible(field, values, currentSchema);
      const shouldDisable = this.evaluator.isFieldDisabled(field, values, currentSchema);

      if (!isVisible) {
        // Tạm thời disable khi field bị ẩn để không chặn validation của toàn bộ form
        if (control.enabled) {
          control.disable({ emitEvent: false });
        }
      } else {
        if (shouldDisable && control.enabled) {
          control.disable();
        } else if (!shouldDisable && control.disabled) {
          control.enable();
        }
      }
    });
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
    const leafFields = extractAllLeafFields(schema.fields);

    leafFields.forEach((field: FieldSchema) => {
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
