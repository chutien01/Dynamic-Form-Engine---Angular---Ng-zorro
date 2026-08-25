import { Component, input, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { StepsFieldSchema } from '../../../../../core/models/schema.model';
import { ContainerDropzoneComponent } from '../base/container-dropzone.component';

@Component({
  selector: 'app-steps-field',
  imports: [NzStepsModule, NzButtonModule, ContainerDropzoneComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full mb-6 p-5 bg-white border border-gray-200 rounded-lg shadow-sm">
      <nz-steps [nzCurrent]="currentStep()" [nzDirection]="field().direction || 'horizontal'" [nzSize]="field().size || 'default'" class="mb-6">
        @for (item of field().items; track item.id; let idx = $index) {
          <nz-step 
            [nzTitle]="item.title" 
            [nzDescription]="item.description || ''" 
            [class.cursor-pointer]="isBuilder()"
            (click)="isBuilder() && currentStep.set(idx)"
          ></nz-step>
        }
      </nz-steps>

      @if (field().items[currentStep()]; as activeStep) {
        <div class="step-content py-4 border-t border-b border-gray-100 min-h-[120px]">
          <app-container-dropzone
            [containerId]="field().id"
            [itemId]="activeStep.id"
            [fields]="activeStep.fields || []"
            [formGroup]="formGroup()"
            [isBuilder]="isBuilder()"
            [label]="activeStep.title"
          ></app-container-dropzone>
        </div>

        @if (!isBuilder()) {
          <div class="flex justify-between items-center mt-5">
            <button 
              type="button" 
              nz-button 
              [disabled]="currentStep() === 0" 
              (click)="prevStep()"
            >
              ← Quay lại (Previous)
            </button>
            
            @if (currentStep() < field().items.length - 1) {
              <button 
                type="button" 
                nz-button 
                nzType="primary" 
                (click)="nextStep()"
              >
                Tiếp theo (Next Step) →
              </button>
            }
          </div>
        }
      }
    </div>
  `
})
export class StepsFieldComponent {
  readonly field = input.required<StepsFieldSchema>();
  readonly formGroup = input.required<FormGroup>();
  readonly isBuilder = input<boolean>(false);
  readonly currentStep = signal(0);

  nextStep(): void {
    if (this.currentStep() < this.field().items.length - 1) {
      this.currentStep.update(s => s + 1);
    }
  }

  prevStep(): void {
    if (this.currentStep() > 0) {
      this.currentStep.update(s => s - 1);
    }
  }
}
