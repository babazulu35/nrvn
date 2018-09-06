import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FileUploadBoxComponent } from './file-upload-box.component';

describe('FileUploadBoxComponent', () => {
  let component: FileUploadBoxComponent;
  let fixture: ComponentFixture<FileUploadBoxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FileUploadBoxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FileUploadBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
