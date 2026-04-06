import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { AddFamilySurveyComponent } from './add_family_survey.component';
import { FamilyService } from './family.service';

describe('AddFamilySurveyComponent', () => {
  let component: AddFamilySurveyComponent;
  let fixture: ComponentFixture<AddFamilySurveyComponent>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
  let familyServiceSpy: jasmine.SpyObj<FamilyService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    familyServiceSpy = jasmine.createSpyObj('FamilyService', ['addFamily']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [AddFamilySurveyComponent],
      imports: [
        FormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatRadioModule,
        MatButtonModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: FamilyService, useValue: familyServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AddFamilySurveyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add and remove children', () => {
    const initial = component.surveyChildren.length;
    component.addChild();
    expect(component.surveyChildren.length).toBe(initial + 1);

    component.removeChild(0);
    expect(component.surveyChildren.length).toBe(initial);
  });

  it('should reset survey', () => {
    component.surveyFamilyLastName = 'Test';
    component.surveyParentEmail = 'parent@test.com';
    component.surveyChildren[0] = {
      firstName: 'A', lastName: 'B', school: 'S', grade: '1', backpackNeeded: 'yes'
    };
    component.resetSurvey();

    expect(component.surveyFamilyLastName).toBe('');
    expect(component.surveyParentEmail).toBe('');
    expect(component.surveyChildren.length).toBe(1);
    expect(component.surveyChildren[0]).toEqual({ firstName: '', lastName: '', school: '', grade: '', backpackNeeded: '' });
  });

  it('should show error if fields missing', fakeAsync(() => {
    component.submitSurvey();
    tick();
    expect(snackBarSpy.open).toHaveBeenCalledWith('Please fill in all required fields', 'OK', { duration: 5000 });
  }));

  it('should submit survey successfully', fakeAsync(() => {
    component.surveyFamilyLastName = 'Smith';
    component.surveyParentEmail = 'parent@test.com';
    component.surveyChildren = [
      { firstName: 'John', lastName: 'Doe', school: 'Lincoln', grade: '5', backpackNeeded: 'yes' }
    ];

    familyServiceSpy.addFamily.and.returnValue(of('123'));
    component.submitSurvey();
    tick();

    expect(familyServiceSpy.addFamily).toHaveBeenCalled();
    expect(snackBarSpy.open).toHaveBeenCalledWith('Family added successfully!', 'OK', { duration: 5000 });
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/families']);
    expect(component.surveyChildren.length).toBe(1); // reset
  }));

  it('should show error if service fails', fakeAsync(() => {
    component.surveyFamilyLastName = 'Smith';
    component.surveyParentEmail = 'parent@test.com';
    component.surveyChildren[0] = {
      firstName: 'John', lastName: 'Doe', school: 'Lincoln', grade: '5', backpackNeeded: 'yes'
    };

    const error = new Error('Network error');
    familyServiceSpy.addFamily.and.returnValue(throwError(() => error));
    component.submitSurvey();
    tick();

    expect(snackBarSpy.open).toHaveBeenCalledWith('Error adding family: Network error', 'OK', { duration: 5000 });
  }));

  it('should handle multiple children', fakeAsync(() => {
    component.surveyFamilyLastName = 'Doe';
    component.surveyParentEmail = 'parent@test.com';
    component.surveyChildren = [
      { firstName: 'A', lastName: 'A', school: 'S', grade: '1', backpackNeeded: 'yes' },
      { firstName: 'B', lastName: 'B', school: 'S', grade: '2', backpackNeeded: 'no' }
    ];

    familyServiceSpy.addFamily.and.returnValue(of('456'));
    component.submitSurvey();
    tick();

    expect(component.surveyChildren.length).toBe(1); // form reset
  }));
});
