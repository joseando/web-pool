import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HarvestersComponent } from './harvesters.component';

describe('HarvestersComponent', () => {
  let component: HarvestersComponent;
  let fixture: ComponentFixture<HarvestersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HarvestersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HarvestersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
