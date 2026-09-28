import { TestBed } from '@angular/core/testing';
import { GeolocationService } from './GeolocationService';

describe('Geolocation', () => {
  let service: GeolocationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GeolocationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
