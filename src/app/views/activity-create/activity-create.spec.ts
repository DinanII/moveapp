import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivityCreate } from './activity-create';

describe('ActivityCreate', () => {
  let component: ActivityCreate;
  let fixture: ComponentFixture<ActivityCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivityCreate],
    }).compileComponents();

    fixture = TestBed.createComponent(ActivityCreate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
