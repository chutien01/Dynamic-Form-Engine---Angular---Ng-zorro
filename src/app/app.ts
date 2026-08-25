import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicFormBuilderComponent } from './features/form-builder/dynamic-form-builder.component';

@Component({
  selector: 'app-root',
  imports: [CommonModule, DynamicFormBuilderComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('Hệ thống Dynamic Form');
}
