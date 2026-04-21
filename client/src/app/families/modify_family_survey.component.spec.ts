// import { TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
// import { ModifyFamilySurveyComponent } from './modify_family_survey.component';
// import { of, throwError } from 'rxjs';
// import { FamilyService } from './family.service';
// import { Router } from '@angular/router';
// import { MatSnackBar } from '@angular/material/snack-bar';
// import { MockFamilyService } from 'src/testing/family.service.mock';
// import { Family } from './family';
// import { ActivatedRoute } from '@angular/router'; //ParamMap
// import { ActivatedRouteStub } from '../../testing/activated-route-stub'; //Still no idea wtf this does
// import { provideHttpClient } from '@angular/common/http';
// import { provideHttpClientTesting } from '@angular/common/http/testing'; //HttpTestingController
// import { MatSnackBarModule } from '@angular/material/snack-bar';
// //import { MockFamilyService } from 'src/testing/family.service.mock';

// describe('ModifyFamilySurveyComponent', () => {
//   let component: ModifyFamilySurveyComponent;
//   let familyServiceSpy: jasmine.SpyObj<FamilyService>;
//   let routerSpy: jasmine.SpyObj<Router>;
//   let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
//   //const expectedItem: Family = MockFamilyService.testItems[0];
//   const activatedRoute: ActivatedRouteStub = new ActivatedRouteStub({
//     id: 'richards_id',
//   });

//   beforeEach(waitForAsync(() => {
//     TestBed.configureTestingModule({
//       imports: [
//         ModifyFamilySurveyComponent,
//         MatSnackBarModule
//       ],
//       providers: [
//         provideHttpClient(),
//         provideHttpClientTesting(),
//         { provide: FamilyService, useClass: MockFamilyService },
//         { provide: ActivatedRoute, useValue: activatedRoute }
//         //For some reason necessary if ANY button has a router link? What does this even do?!
//       ]
//     }).compileComponents().catch(error => {
//       expect(error).toBeNull();
//     });
//   }));

//   beforeEach(() => {
//     familyServiceSpy = jasmine.createSpyObj('FamilyService', ['addFamily', 'deleteFamily', 'getSchools', 'getTimes', 'getFamilyById']);
//     routerSpy = jasmine.createSpyObj('Router', ['navigate']);
//     snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

//     familyServiceSpy.getSchools.and.returnValue(of([]));
//     familyServiceSpy.getTimes.and.returnValue(of([]));

//     TestBed.configureTestingModule({
//       imports: [ModifyFamilySurveyComponent],
//       providers: [
//         { provide: FamilyService, useValue: familyServiceSpy },
//         { provide: ActivatedRoute, useValue: activatedRoute },
//         { provide: Router, useValue: routerSpy },
//         { provide: MatSnackBar, useValue: snackBarSpy }
//       ]
//     });

//     component = TestBed.createComponent(ModifyFamilySurveyComponent).componentInstance;
//     //activatedRoute.setParamMap({ id: expectedItem._id });
//     component.initFamily();
//   });

//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });

//   it('should navigate to a specific family profile', () => {
//     const expectedItem: Family = MockFamilyService.testItems[0];
//     activatedRoute.setParamMap({ id: expectedItem._id });
//     expect(component.family()).toEqual(expectedItem);
//   });

//   it('should already have correct # of students on init',  () =>  {
//     expect(component.surveyChildren.length).toBe(2);
//   });

//   it('should add and remove child', () => {
//     component.addChild();
//     expect(component.surveyChildren.length).toBe(3);

//     component.removeChild(0);
//     expect(component.surveyChildren.length).toBe(2);
//   });

//   it('should not remove the last child', () => {
//     component.removeChild(0);
//     component.removeChild(0);
//     component.removeChild(0);
//     component.removeChild(0);
//     expect(component.surveyChildren.length).toBe(1);
//   });

//   it('should reset survey', () => {
//     component.surveyFamilyFirstName = 'John';
//     component.surveyFamilyLastName = 'Smith';
//     component.surveyParentEmail = 'test@test.com';

//     component.resetSurvey();

//     expect(component.surveyFamilyFirstName).toBe(component.family().first_name);
//     expect(component.surveyFamilyLastName).toBe(component.family().last_name);
//     expect(component.surveyChildren.length).toBe(2); //Values from test data
//   });

//   it('should show validation error if form incomplete', () => {
//     component.surveyParentEmail = 'test@test.com';

//     component.submitSurvey();

//     expect(snackBarSpy.open).toHaveBeenCalledWith(
//       'Please fill in all required fields',
//       'OK',
//       { duration: 5000 }
//     );
//     expect(familyServiceSpy.addFamily).not.toHaveBeenCalled();
//   });

//   it('should submit successfully', fakeAsync(() => {
//     component.surveyFamilyFirstName = 'John';
//     component.surveyFamilyLastName = 'Smith';
//     component.surveyFamilyTime = '9:00am';
//     component.surveyFamilyFirstNameAlt = '';
//     component.surveyFamilyLastNameAlt = '';
//     component.surveyParentEmail = 'test@test.com';
//     component.surveyChildren[0] = {
//       first_name: 'John',
//       last_name: 'Doe',
//       school: 'School',
//       grade: '3',
//       teacher: 'Mrs.Oaks',
//       backpack: true,
//       headphones: true,
//     };

//     familyServiceSpy.addFamily.and.returnValue(of('abc123'));

//     component.submitSurvey();
//     tick();

//     expect(familyServiceSpy.addFamily).toHaveBeenCalled();
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     const submittedPayload: any = familyServiceSpy.addFamily.calls.mostRecent().args[0];
//     expect(submittedPayload.first_name).toBe('John');
//     expect(submittedPayload.last_name).toBe('Smith');
//     expect(submittedPayload.email).toBe('test@test.com');
//     expect(submittedPayload.students[0]).toEqual(jasmine.objectContaining({
//       first_name: 'John',
//       last_name: 'Doe',
//       school: 'School',
//       grade: '3',
//       backpack: true,
//       teacher: 'Mrs.Oaks',
//       headphones: true,
//     }));
//     expect(routerSpy.navigate).toHaveBeenCalledWith(['/families']);
//     expect(snackBarSpy.open).toHaveBeenCalledWith(
//       'Survey submitted successfully!',
//       'OK',
//       { duration: 5000 }
//     );
//   }));

//   it('should handle error on submit', fakeAsync(() => {
//     component.surveyFamilyLastName = 'Smith';
//     component.surveyParentEmail = 'test@test.com';
//     component.surveyChildren[0] = {
//       first_name: 'John',
//       last_name: 'Doe',
//       school: 'School',
//       grade: '3',
//       backpack: true,
//       teacher: 'Mrs.Oaks',
//       headphones: true,
//     };

//     familyServiceSpy.addFamily.and.returnValue(
//       throwError(() => new Error('fail'))
//     );

//     component.submitSurvey();
//     tick();

//     expect(snackBarSpy.open).toHaveBeenCalledWith(
//       'Please fill in all required fields',
//       'OK',
//       { duration: 5000 }
//     );
//     expect(routerSpy.navigate).not.toHaveBeenCalled();
//   }));
// });
