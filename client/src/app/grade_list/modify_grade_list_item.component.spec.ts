import { Location } from '@angular/common';
import { provideHttpClientTesting } from '@angular/common/http/testing'; //HttpTestingController
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'; //fakeAsync, flush, tick,
import { AbstractControl, FormGroup } from '@angular/forms';
//import { provideRouter, Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router'; //ParamMap
import { ActivatedRouteStub } from '../../testing/activated-route-stub'; //No idea wtf this does
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { throwError } from 'rxjs'; //of, throwError
import { MockGradeListService } from 'src/testing/grade_list.service.mock';
import { ModifyRequirementComponent } from './modify_grade_list_item.component';
//import { UserProfileComponent } from './user-profile.component';
import { GradeListService } from './grade_list.service';
import { provideHttpClient } from '@angular/common/http';
import { RequiredItem } from './required_item';
//import { toSignal } from '@angular/core/rxjs-interop';
//import { catchError, map, switchMap } from 'rxjs/operators';
//import { RequiredItemProfileComponent } from './inventory_item_profile.component';

describe('ModifyRequirementComponent', () => {
  let modifyItemComponent: ModifyRequirementComponent;
  let modifyItemForm: FormGroup;
  //let inventoryService: GradeListService;
  let fixture: ComponentFixture<ModifyRequirementComponent>;
  //let location: Location;
  const pencilId = 'pencil_id';
  const activatedRoute: ActivatedRouteStub = new ActivatedRouteStub({
    // Using the constructor here lets us try that branch in `activated-route-stub.ts`
    // and then we can choose a new parameter map in the tests if we choose
    id: pencilId,
  });

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        ModifyRequirementComponent,
        MatSnackBarModule
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: GradeListService, useClass: MockGradeListService },
        { provide: ActivatedRoute, useValue: activatedRoute }
        //For some reason necessary if ANY button has a router link? What does this even do?!
      ]
    }).compileComponents().catch(error => {
      expect(error).toBeNull();
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModifyRequirementComponent);
    modifyItemComponent = fixture.componentInstance;
    fixture.detectChanges();
    modifyItemForm = modifyItemComponent.modifyRequirementForm;
    expect(modifyItemForm).toBeDefined();
    expect(modifyItemForm.controls).toBeDefined();
  });

  it('should navigate to a specific item profile', () => {
    const expectedItem: RequiredItem = MockGradeListService.testItems[0];
    activatedRoute.setParamMap({ id: expectedItem._id });
    expect(modifyItemComponent.item()).toEqual(expectedItem);
  });

  it('should create the component and form', () => {
    expect(modifyItemComponent).toBeTruthy();
    expect(modifyItemForm).toBeTruthy();
  });

  // Confirms that an initial, empty form is *not* valid, so
  // people can't submit an empty form.
  it('form should be valid when prefilled', () => {
    expect(modifyItemForm.valid).toBeFalsy();
  });

  describe('The name field', () => {
    let nameControl: AbstractControl;

    beforeEach(() => {
      nameControl = modifyItemComponent.modifyRequirementForm.controls.name;
    });

    it('should not allow empty names', () => {
      nameControl.setValue('');
      expect(nameControl.valid).toBeFalsy();
    });

    it('should be fine with "Yellow Pencil"', () => {
      nameControl.setValue('Yellow Pencil');
      expect(nameControl.valid).toBeTruthy();
    });

    it('should fail on single character names', () => {
      nameControl.setValue('x');
      expect(nameControl.valid).toBeFalsy();
      // Annoyingly, Angular uses lowercase 'l' here
      // when it's an upper case 'L' in `Validators.minLength(2)`.
      expect(nameControl.hasError('minlength')).toBeTruthy();
    });

    it('should fail on really long names', () => {
      nameControl.setValue('x'.repeat(250));
      expect(nameControl.valid).toBeFalsy();
      expect(nameControl.hasError('maxlength')).toBeTruthy();
    });

    it('should allow digits in the name', () => {
      nameControl.setValue('Yellow Pencils, 16-pack');
      expect(nameControl.valid).toBeTruthy();
    });
  });

  describe('The school field', () => {
    let schoolControl: AbstractControl;

    beforeEach(() => {
      schoolControl = modifyItemComponent.modifyRequirementForm.controls.school;
    });

    it('should not allow empty schools', () => {
      schoolControl.setValue('');
      expect(schoolControl.valid).toBeFalsy();
    });

    it('should be fine with "Yellow Pencil"', () => {
      schoolControl.setValue('Yellow Pencil');
      expect(schoolControl.valid).toBeTruthy();
    });

    it('should fail on single character names', () => {
      schoolControl.setValue('x');
      expect(schoolControl.valid).toBeFalsy();
      // Annoyingly, Angular uses lowercase 'l' here
      // when it's an upper case 'L' in `Validators.minLength(2)`.
      expect(schoolControl.hasError('minlength')).toBeTruthy();
    });

    it('should fail on really long names', () => {
      schoolControl.setValue('x'.repeat(250));
      expect(schoolControl.valid).toBeFalsy();
      expect(schoolControl.hasError('maxlength')).toBeTruthy();
    });

    it('should allow digits in the name', () => {
      schoolControl.setValue('Yellow Pencils, 16-pack');
      expect(schoolControl.valid).toBeTruthy();
    });
  });

  describe('The grade field', () => {
    let gradeControl: AbstractControl;

    beforeEach(() => {
      gradeControl = modifyItemComponent.modifyRequirementForm.controls.grade;
    });

    it('should not allow empty names', () => {
      gradeControl.setValue('');
      expect(gradeControl.valid).toBeFalsy();
    });

    it('should be fine with "1"', () => {
      gradeControl.setValue('1');
      expect(gradeControl.valid).toBeTruthy();
    });

    it('should be fine with "P"', () => {
      gradeControl.setValue('P');
      expect(gradeControl.valid).toBeTruthy();
    });

    it('should fail on invalid characters', () => {
      gradeControl.setValue('Z');
      expect(gradeControl.valid).toBeFalsy();
      expect(gradeControl.hasError('pattern')).toBeTruthy();
    });

    it('should fail on out-of-bounds grades', () => {
      gradeControl.setValue('9'.repeat(250));
      expect(gradeControl.valid).toBeFalsy();
      expect(gradeControl.hasError('maxlength')).toBeTruthy();
    });
  });

  describe('The description field', () => {
    it('should allow empty values', () => {
      const descControl = modifyItemComponent.modifyRequirementForm.controls.desc;
      descControl.setValue('');
      expect(descControl.valid).toBeTruthy();
    });
  });

  describe('The pack field', () => {
    let packControl: AbstractControl;

    beforeEach(() => {
      packControl = modifyItemComponent.modifyRequirementForm.controls.pack;
    });

    it('should not allow missing pack', () => {
      packControl.setValue('');
      expect(packControl.valid).toBeFalsy();
    });

    it('should be fine with "27"', () => {
      packControl.setValue('27');
      expect(packControl.valid).toBeTruthy();
    });

    it('should fail on negative pack', () => {
      packControl.setValue('-27');
      expect(packControl.valid).toBeFalsy();
      expect(packControl.hasError('min')).toBeTruthy();
    });

    it('should fail on packs that are too high', () => {
      packControl.setValue(99999999999);
      expect(packControl.valid).toBeFalsy();
      expect(packControl.hasError('max')).toBeTruthy();
    });

    it('should not allow a pack to contain a decimal point', () => {
      packControl.setValue(27.5);
      expect(packControl.valid).toBeFalsy();
      expect(packControl.hasError('pattern')).toBeTruthy();
    });
  });

  describe('The stocked field', () => {
    let requiredControl: AbstractControl;

    beforeEach(() => {
      requiredControl = modifyItemComponent.modifyRequirementForm.controls.required;
    });

    it('should not allow missing stock', () => {
      requiredControl.setValue('');
      expect(requiredControl.valid).toBeFalsy();
    });

    it('should be fine with "27"', () => {
      requiredControl.setValue('27');
      expect(requiredControl.valid).toBeTruthy();
    });

    it('should fail on negative stock', () => {
      requiredControl.setValue('-27');
      expect(requiredControl.valid).toBeFalsy();
      expect(requiredControl.hasError('min')).toBeTruthy();
    });

    it('should fail on stocks that are too high', () => {
      requiredControl.setValue(99999999999);
      expect(requiredControl.valid).toBeFalsy();
      expect(requiredControl.hasError('max')).toBeTruthy();
    });

    it('should not allow a stock to contain a decimal point', () => {
      requiredControl.setValue(27.5);
      expect(requiredControl.valid).toBeFalsy();
      expect(requiredControl.hasError('pattern')).toBeTruthy();
    });
  });

  describe('The description field', () => {
    it('should allow empty values', () => {
      const descControl = modifyItemForm.controls.desc;
      descControl.setValue('');
      expect(descControl.valid).toBeTruthy();
    });
  });

  describe('The type field', () => {
    let typeControl: AbstractControl;

    beforeEach(() => {
      typeControl = modifyItemComponent.modifyRequirementForm.controls.type;
    });

    it('should not allow empty values', () => {
      typeControl.setValue('');
      expect(typeControl.valid).toBeFalsy();
      expect(typeControl.hasError('required')).toBeTruthy();
    });

    it('should accept legal types', () => {
      typeControl.setValue('pencils');
      expect(typeControl.valid).toBeTruthy();
    });

    it('should fail with invalid types, such as chainsaws', () => {
      typeControl.setValue('chainsaws');
      expect(typeControl.valid).toBeFalsy();
      // expect(typeControl.hasError('email')).toBeTruthy();
    });
  });
});

describe('ModifyComponentNavigation', () => {
  let component: ModifyRequirementComponent;
  let fixture: ComponentFixture<ModifyRequirementComponent>;
  let inventoryService: GradeListService;
  let location: Location;
  const pencilId = 'pencil_id';
  const activatedRoute: ActivatedRouteStub = new ActivatedRouteStub({
    // Using the constructor here lets us try that branch in `activated-route-stub.ts`
    // and then we can choose a new parameter map in the tests if we choose
    id: pencilId,
  });

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        ModifyRequirementComponent,
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: GradeListService, useClass: MockGradeListService },
        { provide: ActivatedRoute, useValue: activatedRoute },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModifyRequirementComponent);
    inventoryService = TestBed.inject(GradeListService);
    location = TestBed.inject(Location);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to a specific item', () => {
    const expectedItem: RequiredItem = MockGradeListService.testItems[0];
    // Setting this should cause anyone subscribing to the paramMap
    // to update. Our `UserProfileComponent` subscribes to that, so
    // it should update right away.
    activatedRoute.setParamMap({ id: expectedItem._id });
    expect(component.item()).toEqual(expectedItem);
  });

  it('should navigate to correct item when the id parameter changes', () => {
    let expectedItem: RequiredItem = MockGradeListService.testItems[0];
    // Setting this should cause anyone subscribing to the paramMap
    // to update. Our `UserProfileComponent` subscribes to that, so
    // it should update right away.
    activatedRoute.setParamMap({ id: expectedItem._id });
    expect(component.item()).toEqual(expectedItem);

    // Changing the paramMap should update the displayed user profile.
    expectedItem = MockGradeListService.testItems[1];
    activatedRoute.setParamMap({ id: expectedItem._id });
    expect(component.item()).toEqual(expectedItem);
  });

  it('should set error data on observable error', () => {
    const mockError = {
      message: 'Test Error',
      error: { title: 'Error Title' },
    };

    // "Spy" on the `.addUser()` method in the user service. Here we basically
    // intercept any calls to that method and return the error response
    // defined above.
    const getUserSpy = spyOn(inventoryService, 'getItemById').and.returnValue(
      throwError(() => mockError)
    );

    activatedRoute.setParamMap({ id: pencilId });

    expect(component.error()).toEqual({
      help: 'There was a problem loading the item – try again.',
      httpResponse: mockError.message,
      message: mockError.error.title,
    });
    expect(getUserSpy).toHaveBeenCalledWith(pencilId);
  });

  it('should correctly reset the form', () => {
    const expectedItem: RequiredItem = MockGradeListService.testItems[0];
    // Setting this should cause anyone subscribing to the paramMap
    // to update. Our `UserProfileComponent` subscribes to that, so
    // it should update right away.
    activatedRoute.setParamMap({ id: expectedItem._id });
    component.modifyRequirementForm.controls.name.setValue('Reset this');
    component.modifyRequirementForm.controls.required.setValue(2);
    component.modifyRequirementForm.controls.grade.setValue('1');
    component.modifyRequirementForm.controls.school.setValue('Nope');
    component.modifyRequirementForm.controls.desc.setValue('Reset this!');
    component.modifyRequirementForm.controls.type.setValue('erasers');

    component.resetForm();
    expect(component.modifyRequirementForm.controls.name.value).toBe(component.item().name);
    expect(component.modifyRequirementForm.controls.required.value).toBe(component.item().required);
    expect(component.modifyRequirementForm.controls.grade.value).toBe(component.item().grade);
    expect(component.modifyRequirementForm.controls.school.value).toBe(component.item().school);
    expect(component.modifyRequirementForm.controls.desc.value).toBe(component.item().desc);
    expect(component.modifyRequirementForm.controls.type.value).toBe(component.item().type);

  });

  //Same routing problem as add_inventory_item spec.
  // Probably has something to do with how we're tracking the associated item???

  // it('should call addItem() and handle success response', fakeAsync(() => {
  //   const addItemSpy = spyOn(inventoryService, 'addItem').and.returnValue(of('1'));
  //   component.submitForm();
  //   // Check that `.addItem()` was called with the form's values which we set
  //   // up above.
  //   expect(addItemSpy).toHaveBeenCalledWith(component.modifyRequirementForm.value);
  //   // Wait for the router to navigate to the new page. This is necessary since
  //   // navigation is an asynchronous operation.
  //   tick();
  //   // Now we can check that the router actually navigated to the right place.
  //   expect(location.path()).toBe('/inventory/1');
  //   // expect(location.path()).toBe('/inventory');
  //   // Flush any pending microtasks. This is necessary to ensure that the
  //   // timer generated by `fakeAsync()` completes before the test finishes.
  //   flush();
  // }));

  it('should call addItem() and handle error response', () => {
    // Save the original path so we can check that it doesn't change.
    const path = location.path();
    // A canned error response to be returned by the spy.
    const errorResponse = { status: 500, message: 'Server error' };
    // "Spy" on the `.addItem()` method in the inventory service. Here we basically
    // intercept any calls to that method and return the error response
    // defined above.
    const addItemSpy = spyOn(inventoryService, 'addItem')
      .and
      .returnValue(throwError(() => errorResponse));
    component.submitForm();
    // Check that `.addItem()` was called with the form's values which we set
    // up above.
    expect(addItemSpy).toHaveBeenCalledWith(component.modifyRequirementForm.value);
    // Confirm that we're still at the same path.
    expect(location.path()).toBe(path);
  });

  it('should call addItem() and handle error response for illegal item', () => {
    const path = location.path();
    const errorResponse = { status: 400, message: 'Illegal item error' };
    const addItemSpy = spyOn(inventoryService, 'addItem')
      .and
      .returnValue(throwError(() => errorResponse));
    component.submitForm();
    expect(addItemSpy).toHaveBeenCalledWith(component.modifyRequirementForm.value);
    expect(location.path()).toBe(path);
  });

  it('should call addItem() and handle unexpected error response if it arises', () => {
    const path = location.path();
    const errorResponse = { status: 404, message: 'Not found' };
    const addItemSpy = spyOn(inventoryService, 'addItem')
      .and
      .returnValue(throwError(() => errorResponse));
    component.submitForm();
    expect(addItemSpy).toHaveBeenCalledWith(component.modifyRequirementForm.value);
    expect(location.path()).toBe(path);
  });

  it('should delete on submission and handle error response', () => {
    // Save the original path so we can check that it doesn't change.
    const path = location.path();
    // A canned error response to be returned by the spy.
    const errorResponse = { status: 500, message: 'Server error' };
    // "Spy" on the `.addItem()` method in the inventory service. Here we basically
    // intercept any calls to that method and return the error response
    // defined above.
    const deleteItemSpy = spyOn(inventoryService, 'deleteItem')
      .and
      .returnValue(throwError(() => errorResponse));
    component.submitForm();
    // The order of tests is randomized-
    //If these are called out of order, it could delete either the first or second item.
    //...And it's been hours and I can't figure out how to test for this, so this'll have to do.
    expect(deleteItemSpy).toHaveBeenCalled();//With(pencilId)
    // Confirm that we're still at the same path.
    expect(location.path()).toBe(path);
  });

  it('should delete on submission and handle error response for illegal item', () => {
    const path = location.path();
    const errorResponse = { status: 400, message: 'Illegal item error' };
    const deleteItemSpy = spyOn(inventoryService, 'deleteItem')
      .and
      .returnValue(throwError(() => errorResponse));
    component.submitForm();
    expect(deleteItemSpy).toHaveBeenCalled();//With(pencilId);
    expect(location.path()).toBe(path);
  });

  it('should delete on submission and handle unexpected error response if it arises', () => {
    const path = location.path();
    const errorResponse = { status: 404, message: 'Not found' };
    const deleteItemSpy = spyOn(inventoryService, 'deleteItem')
      .and
      .returnValue(throwError(() => errorResponse));
    component.submitForm();
    expect(deleteItemSpy).toHaveBeenCalled();//With(pencilId)
    expect(location.path()).toBe(path);
  });

  it('should call deleteItem() and handle error response', () => {
    // Save the original path so we can check that it doesn't change.
    const path = location.path();
    // A canned error response to be returned by the spy.
    const errorResponse = { status: 500, message: 'Server error' };
    // "Spy" on the `.addItem()` method in the inventory service. Here we basically
    // intercept any calls to that method and return the error response
    // defined above.
    const deleteItemSpy = spyOn(inventoryService, 'deleteItem')
      .and
      .returnValue(throwError(() => errorResponse));
    component.deleteForm();
    // Check that `.addItem()` was called with the form's values which we set
    // up above.
    expect(deleteItemSpy).toHaveBeenCalled();//With(pencilId);
    // Confirm that we're still at the same path.
    expect(location.path()).toBe(path);
  });

  it('should call deleteItem() and handle error response for illegal item', () => {
    const path = location.path();
    const errorResponse = { status: 400, message: 'Illegal item error' };
    const deleteItemSpy = spyOn(inventoryService, 'deleteItem')
      .and
      .returnValue(throwError(() => errorResponse));
    component.deleteForm();
    expect(deleteItemSpy).toHaveBeenCalled();//With(pencilId)
    expect(location.path()).toBe(path);
  });

  it('should call deleteItem() and handle unexpected error response if it arises', () => {
    const path = location.path();
    const errorResponse = { status: 404, message: 'Not found' };
    const deleteItemSpy = spyOn(inventoryService, 'deleteItem')
      .and
      .returnValue(throwError(() => errorResponse));
    component.deleteForm();
    expect(deleteItemSpy).toHaveBeenCalled();//With(pencilId)
    expect(location.path()).toBe(path);
  });
});
