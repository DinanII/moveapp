import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivitiesOverview } from './activities-overview';

describe('ActivitiesOverview', () => {
  let component: ActivitiesOverview;
  let fixture: ComponentFixture<ActivitiesOverview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivitiesOverview],
    }).compileComponents();

    fixture = TestBed.createComponent(ActivitiesOverview);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
