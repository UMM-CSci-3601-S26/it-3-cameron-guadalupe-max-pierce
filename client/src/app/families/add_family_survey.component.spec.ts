import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AddFamilySurveyComponent } from './add_family_survey.component';
import { of, throwError } from 'rxjs';
import { FamilyService } from './family.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

describe('AddFamilySurveyComponent', () => {
  let component: AddFamilySurveyComponent;
  let familyServiceSpy: jasmine.SpyObj<FamilyService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

  beforeEach(() => {
    familyServiceSpy = jasmine.createSpyObj('FamilyService', ['addFamily']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    TestBed.configureTestingModule({
      imports: [AddFamilySurveyComponent],
      providers: [
        { provide: FamilyService, useValue: familyServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MatSnackBar, useValue: snackBarSpy }
      ]
    });

    component = TestBed.createComponent(AddFamilySurveyComponent).componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add and remove child', () => {
    component.addChild();
    expect(component.surveyChildren.length).toBe(2);

    component.removeChild(0);
    expect(component.surveyChildren.length).toBe(1);
  });

  it('should not remove the last child', () => {
    component.removeChild(0);
    expect(component.surveyChildren.length).toBe(1);
  });

  it('should reset survey', () => {
    component.surveyFamilyLastName = 'Smith';
    component.surveyParentEmail = 'test@test.com';

    component.resetSurvey();

    expect(component.surveyFamilyLastName).toBe('');
    expect(component.surveyChildren.length).toBe(1);
  });

  it('should show validation error if form incomplete', () => {
    component.submitSurvey();

    expect(snackBarSpy.open).toHaveBeenCalledWith(
      'Please fill in all required fields',
      'OK',
      { duration: 5000 }
    );
    expect(familyServiceSpy.addFamily).not.toHaveBeenCalled();
  });

  it('should submit successfully', fakeAsync(() => {
    component.surveyFamilyLastName = 'Smith';
    component.surveyParentEmail = 'test@test.com';
    component.surveyChildren[0] = {
      firstName: 'John',
      lastName: 'Doe',
      school: 'School',
      grade: '3',
      backpackNeeded: 'yes'
    };

    familyServiceSpy.addFamily.and.returnValue(of('abc123'));

    component.submitSurvey();
    tick();

    expect(familyServiceSpy.addFamily).toHaveBeenCalled();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const submittedPayload: any = familyServiceSpy.addFamily.calls.mostRecent().args[0];
    expect(submittedPayload.name).toBe('Smith');
    expect(submittedPayload.email).toBe('test@test.com');
    expect(submittedPayload.students[0]).toEqual(jasmine.objectContaining({
      firstName: 'John',
      lastName: 'Doe',
      school: 'School',
      grade: '3',
      backpack: true
    }));
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/families']);
    expect(snackBarSpy.open).toHaveBeenCalledWith(
      'Family added successfully!',
      'OK',
      { duration: 5000 }
    );
  }));

  it('should handle error on submit', fakeAsync(() => {
    component.surveyFamilyLastName = 'Smith';
    component.surveyParentEmail = 'test@test.com';
    component.surveyChildren[0] = {
      firstName: 'John',
      lastName: 'Doe',
      school: 'School',
      grade: '3',
      backpackNeeded: 'yes'
    };

    familyServiceSpy.addFamily.and.returnValue(
      throwError(() => new Error('fail'))
    );

    component.submitSurvey();
    tick();

    expect(snackBarSpy.open).toHaveBeenCalledWith(
      'Error adding family: fail',
      'OK',
      { duration: 5000 }
    );
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  }));
});
