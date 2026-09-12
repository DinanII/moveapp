import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PermissionsOverview } from './permissions-overview';

describe('PermissionsOverview', () => {
  let component: PermissionsOverview;
  let fixture: ComponentFixture<PermissionsOverview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PermissionsOverview],
    }).compileComponents();

    fixture = TestBed.createComponent(PermissionsOverview);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
