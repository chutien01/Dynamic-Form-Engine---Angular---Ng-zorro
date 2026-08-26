import '@angular/compiler';
import { describe, it, expect } from 'vitest';
import { App } from './app';

describe('App', () => {
  it('should instantiate App component class', () => {
    const app = new App();
    expect(app).toBeTruthy();
  });
});

