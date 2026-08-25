import '@angular/compiler';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, it, expect } from 'vitest';
import { App } from './app';
import { DynamicFormBuilderComponent } from './features/form-builder/dynamic-form-builder.component';

@Component({
  selector: 'app-dynamic-form-builder',
  template: '<h1>🛠️ Dynamic Form Builder</h1>'
})
class MockDynamicFormBuilderComponent {}

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    })
    .overrideComponent(App, {
      remove: { imports: [DynamicFormBuilderComponent] },
      add: { imports: [MockDynamicFormBuilderComponent] }
    })
    .compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render Dynamic Form Builder component', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-dynamic-form-builder')).toBeTruthy();
  });
});
