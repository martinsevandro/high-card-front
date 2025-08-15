import { TestBed } from '@angular/core/testing';

import { CardHtmlBuilderService } from './card-html-builder.service';

describe('CardHtmlBuilderService', () => {
  let service: CardHtmlBuilderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CardHtmlBuilderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
