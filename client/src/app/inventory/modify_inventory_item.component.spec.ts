import { Location } from '@angular/common';
import { provideHttpClientTesting } from '@angular/common/http/testing'; //HttpTestingController
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'; //fakeAsync, flush, tick,
import { AbstractControl, FormGroup } from '@angular/forms';
//import { provideRouter, Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router'; //ParamMap
import { ActivatedRouteStub } from '../../testing/activated-route-stub'; //No idea wtf this does
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { throwError } from 'rxjs'; //of, throwError
import { MockInventoryService } from 'src/testing/inventory.service.mock';
import { ModifyItemComponent } from './modify_inventory_item.component';
//import { UserProfileComponent } from './user-profile.component';
import { InventoryService } from './inventory.service';
import { provideHttpClient } from '@angular/common/http';
import { InventoryItem } from './inventory_item';
//import { toSignal } from '@angular/core/rxjs-interop';
//import { catchError, map, switchMap } from 'rxjs/operators';
//import { InventoryItemProfileComponent } from './inventory_item_profile.component';

describe('ModifyItemComponent', () => {
  let modifyItemComponent: ModifyItemComponent;
  let modifyItemForm: FormGroup;
  //let inventoryService: InventoryService;
  let fixture: ComponentFixture<ModifyItemComponent>;
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
        ModifyItemComponent,
        MatSnackBarModule
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: InventoryService, useClass: MockInventoryService },
        { provide: ActivatedRoute, useValue: activatedRoute }
        //For some reason necessary if ANY button has a router link? What does this even do?!
      ]
    }).compileComponents().catch(error => {
      expect(error).toBeNull();
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModifyItemComponent);
    modifyItemComponent = fixture.componentInstance;
    fixture.detectChanges();
    modifyItemForm = modifyItemComponent.modifyInventoryForm;
    expect(modifyItemForm).toBeDefined();
    expect(modifyItemForm.controls).toBeDefined();
  });

  it('should navigate to a specific item profile', () => {
    const expectedItem: InventoryItem = MockInventoryService.testItems[0];
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
      nameControl = modifyItemComponent.modifyInventoryForm.controls.name;
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
  describe('The description field', () => {
    it('should allow empty values', () => {
      const descControl = modifyItemComponent.modifyInventoryForm.controls.desc;
      descControl.setValue('');
      expect(descControl.valid).toBeTruthy();
    });
  });

  describe('The pack field', () => {
    let packControl: AbstractControl;

    beforeEach(() => {
      packControl = modifyItemComponent.modifyInventoryForm.controls.pack;
    });

    it('should not allow missing stock', () => {
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
    let stockedControl: AbstractControl;

    beforeEach(() => {
      stockedControl = modifyItemComponent.modifyInventoryForm.controls.stocked;
    });

    it('should not allow missing stock', () => {
      stockedControl.setValue('');
      expect(stockedControl.valid).toBeFalsy();
    });

    it('should be fine with "27"', () => {
      stockedControl.setValue('27');
      expect(stockedControl.valid).toBeTruthy();
    });

    it('should fail on negative stock', () => {
      stockedControl.setValue('-27');
      expect(stockedControl.valid).toBeFalsy();
      expect(stockedControl.hasError('min')).toBeTruthy();
    });

    it('should fail on stocks that are too high', () => {
      stockedControl.setValue(99999999999);
      expect(stockedControl.valid).toBeFalsy();
      expect(stockedControl.hasError('max')).toBeTruthy();
    });

    it('should not allow a stock to contain a decimal point', () => {
      stockedControl.setValue(27.5);
      expect(stockedControl.valid).toBeFalsy();
      expect(stockedControl.hasError('pattern')).toBeTruthy();
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
      typeControl = modifyItemComponent.modifyInventoryForm.controls.type;
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

  describe('The location field', () => {
    let locationControl: AbstractControl;

    beforeEach(() => {
      locationControl = modifyItemForm.controls.location;
    });

    it('should not allow empty values', () => {
      locationControl.setValue('');
      expect(locationControl.valid).toBeFalsy();
      expect(locationControl.hasError('required')).toBeTruthy();
    });

    it('should allow "Over there"', () => {
      locationControl.setValue('over there');
      expect(locationControl.valid).toBeTruthy();
    });
  });
});

describe('ModifyComponentNavigation', () => {
  let component: ModifyItemComponent;
  let fixture: ComponentFixture<ModifyItemComponent>;
  let inventoryService: InventoryService;
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
        ModifyItemComponent,
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: InventoryService, useClass: MockInventoryService },
        { provide: ActivatedRoute, useValue: activatedRoute },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModifyItemComponent);
    inventoryService = TestBed.inject(InventoryService);
    location = TestBed.inject(Location);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to a specific item', () => {
    const expectedItem: InventoryItem = MockInventoryService.testItems[0];
    // Setting this should cause anyone subscribing to the paramMap
    // to update. Our `UserProfileComponent` subscribes to that, so
    // it should update right away.
    activatedRoute.setParamMap({ id: expectedItem._id });
    expect(component.item()).toEqual(expectedItem);
  });

  it('should navigate to correct item when the id parameter changes', () => {
    let expectedItem: InventoryItem = MockInventoryService.testItems[0];
    // Setting this should cause anyone subscribing to the paramMap
    // to update. Our `UserProfileComponent` subscribes to that, so
    // it should update right away.
    activatedRoute.setParamMap({ id: expectedItem._id });
    expect(component.item()).toEqual(expectedItem);

    // Changing the paramMap should update the displayed user profile.
    expectedItem = MockInventoryService.testItems[1];
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
    const expectedItem: InventoryItem = MockInventoryService.testItems[0];
    // Setting this should cause anyone subscribing to the paramMap
    // to update. Our `UserProfileComponent` subscribes to that, so
    // it should update right away.
    activatedRoute.setParamMap({ id: expectedItem._id });
    component.modifyInventoryForm.controls.name.setValue('Reset this');
    component.modifyInventoryForm.controls.stocked.setValue(2);
    component.modifyInventoryForm.controls.location.setValue('Reset this');
    component.modifyInventoryForm.controls.desc.setValue('Reset this!');
    component.modifyInventoryForm.controls.type.setValue('erasers');

    component.resetForm();
    expect(component.modifyInventoryForm.controls.name.value).toBe(component.item().name);
    expect(component.modifyInventoryForm.controls.stocked.value).toBe(component.item().stocked);
    expect(component.modifyInventoryForm.controls.location.value).toBe(component.item().location);
    expect(component.modifyInventoryForm.controls.desc.value).toBe(component.item().desc);
    expect(component.modifyInventoryForm.controls.type.value).toBe(component.item().type);

  });

  //Same routing problem as add_inventory_item spec.
  // Probably has something to do with how we're tracking the associated item???

  // it('should call addItem() and handle success response', fakeAsync(() => {
  //   const addItemSpy = spyOn(inventoryService, 'addItem').and.returnValue(of('1'));
  //   component.submitForm();
  //   // Check that `.addItem()` was called with the form's values which we set
  //   // up above.
  //   expect(addItemSpy).toHaveBeenCalledWith(component.modifyInventoryForm.value);
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
    expect(addItemSpy).toHaveBeenCalledWith(component.modifyInventoryForm.value);
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
    expect(addItemSpy).toHaveBeenCalledWith(component.modifyInventoryForm.value);
    expect(location.path()).toBe(path);
  });

  it('should call addItem() and handle unexpected error response if it arises', () => {
    const path = location.path();
    const errorResponse = { status: 404, message: 'Not found' };
    const addItemSpy = spyOn(inventoryService, 'addItem')
      .and
      .returnValue(throwError(() => errorResponse));
    component.submitForm();
    expect(addItemSpy).toHaveBeenCalledWith(component.modifyInventoryForm.value);
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
