import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TextBox } from './text-box';

describe('TextBox', () => {
  let component: TextBox;
  let fixture: ComponentFixture<TextBox>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextBox],
    }).compileComponents();

    fixture = TestBed.createComponent(TextBox);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
