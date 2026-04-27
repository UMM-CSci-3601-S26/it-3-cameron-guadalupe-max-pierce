import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AddFamilySurveyComponent } from './add_family_survey.component';
import { of, throwError } from 'rxjs';
import { FamilyService } from './family.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
//import { MockFamilyService } from 'src/testing/family.service.mock';

describe('AddFamilySurveyComponent', () => {
  let component: AddFamilySurveyComponent;
  let familyServiceSpy: jasmine.SpyObj<FamilyService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

  beforeEach(() => {
    familyServiceSpy = jasmine.createSpyObj('FamilyService', ['addFamily', 'getSchools', 'getTimes']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    familyServiceSpy.getSchools.and.returnValue(of([]));
    familyServiceSpy.getTimes.and.returnValue(of([]));

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
    component.surveyFamilyFirstName = 'John';
    component.surveyFamilyLastName = 'Smith';
    component.surveyParentEmail = 'test@test.com';

    component.resetSurvey();

    expect(component.surveyFamilyFirstName).toBe('');
    expect(component.surveyFamilyLastName).toBe('');
    expect(component.surveyChildren.length).toBe(1);
  });

  it('should show validation errors if form incomplete', () => {
    //Missing Email
    component.submitSurvey();
    expect(snackBarSpy.open).toHaveBeenCalledWith(
      'Please enter a valid email address',
      'OK',
      { duration: 5000 }
    );
    expect(familyServiceSpy.addFamily).not.toHaveBeenCalled();

    //Missing email (in Spanish)
    component.espanol = true;
    component.submitSurvey();
    expect(snackBarSpy.open).toHaveBeenCalledWith(
      'Por favor, introduce una dirección de correo electrónico válida',
      'OK',
      { duration: 5000 }
    );
    expect(familyServiceSpy.addFamily).not.toHaveBeenCalled();

    //Missing phone
    component.surveyParentEmail = 'test@test.com';
    component.espanol = false;
    component.submitSurvey();
    expect(snackBarSpy.open).toHaveBeenCalledWith(
      'Please enter a valid phone number',
      'OK',
      { duration: 5000 }
    );
    expect(familyServiceSpy.addFamily).not.toHaveBeenCalled();

    //Missing phone (in Spanish)
    component.espanol = true;
    component.submitSurvey();
    expect(snackBarSpy.open).toHaveBeenCalledWith(
      'Por favor, ingrese un número de teléfono válido.',
      'OK',
      { duration: 5000 }
    );
    expect(familyServiceSpy.addFamily).not.toHaveBeenCalled();

    //Missing other
    component.surveyParentPhone = '320-287-1867';
    component.espanol = false;
    component.submitSurvey();
    expect(snackBarSpy.open).toHaveBeenCalledWith(
      'Please fill in all required fields',
      'OK',
      { duration: 5000 }
    );
    expect(familyServiceSpy.addFamily).not.toHaveBeenCalled();

    //Missing other (In Spanish)
    component.espanol = true;
    component.submitSurvey();
    expect(snackBarSpy.open).toHaveBeenCalledWith(
      'Por favor, complete toda la información requerida.',
      'OK',
      { duration: 5000 }
    );
    expect(familyServiceSpy.addFamily).not.toHaveBeenCalled();
  });

  //Example with all information completed
  it('should submit successfully', fakeAsync(() => {
    component.surveyFamilyFirstName = 'John';
    component.surveyFamilyLastName = 'Smith';
    component.surveyFamilyTime = '9:00am';
    component.surveyFamilyFirstNameAlt = '';
    component.surveyFamilyLastNameAlt = '';
    component.surveyParentEmail = 'test@test.com';
    component.surveyParentPhone = '320-287-1867'
    component.surveyChildren[0] = {
      first_name: 'John',
      last_name: 'Doe',
      school: 'School',
      grade: '3',
      teacher: 'Mrs.Oaks',
      backpack: true,
      headphones: true,
    };

    familyServiceSpy.addFamily.and.returnValue(of('abc123'));

    component.submitSurvey();
    tick();

    expect(familyServiceSpy.addFamily).toHaveBeenCalled();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const submittedPayload: any = familyServiceSpy.addFamily.calls.mostRecent().args[0];
    expect(submittedPayload.first_name).toBe('John');
    expect(submittedPayload.last_name).toBe('Smith');
    expect(submittedPayload.email).toBe('test@test.com');
    expect(submittedPayload.phone).toBe('320-287-1867');
    expect(submittedPayload.students[0]).toEqual(jasmine.objectContaining({
      first_name: 'John',
      last_name: 'Doe',
      school: 'School',
      grade: '3',
      backpack: true,
      teacher: 'Mrs.Oaks',
      headphones: true,
    }));
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/families']);
    expect(snackBarSpy.open).toHaveBeenCalledWith(
      'Survey submitted successfully!',
      'OK',
      { duration: 5000 }
    );
  }));

  it('should handle error on submit', fakeAsync(() => {
    //Missing parent first name
    component.surveyFamilyLastName = 'Smith';
    component.surveyParentEmail = 'test@test.com';
    component.surveyParentPhone = '320-287-1867'
    component.surveyChildren[0] = {
      first_name: 'John',
      last_name: 'Doe',
      school: 'School',
      grade: '3',
      backpack: true,
      teacher: 'Mrs.Oaks',
      headphones: true,
    };

    familyServiceSpy.addFamily.and.returnValue(
      throwError(() => new Error('fail'))
    );

    component.submitSurvey();
    tick();

    expect(snackBarSpy.open).toHaveBeenCalledWith(
      'Please fill in all required fields',
      'OK',
      { duration: 5000 }
    );
    expect(routerSpy.navigate).not.toHaveBeenCalled();

    //Error should also be returned in spanish.
    component.espanol = true;
    component.submitSurvey();
    tick();

    expect(snackBarSpy.open).toHaveBeenCalledWith(
      'Por favor, complete toda la información requerida.',
      'OK',
      { duration: 5000 }
    );
    expect(routerSpy.navigate).not.toHaveBeenCalled();

  }));
});
