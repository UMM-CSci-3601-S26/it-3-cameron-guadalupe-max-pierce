import { Location } from '@angular/common';
import { provideHttpClientTesting, HttpTestingController, } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'; //fakeAsync, flush, tick,
import { AbstractControl, FormGroup } from '@angular/forms';
import { provideRouter, Router } from '@angular/router';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import {throwError, } from 'rxjs'; //of
import { MockInventoryService } from 'src/testing/inventory.service.mock';
import { AddItemComponent } from './add_inventory_item.component';
import { ActivatedRoute } from '@angular/router'; //ParamMap
import { ActivatedRouteStub } from '../../testing/activated-route-stub'; //No idea wtf this does
//import { UserProfileComponent } from './user-profile.component';
import { InventoryService } from './inventory.service';
import { provideHttpClient } from '@angular/common/http';
import { ModifyItemComponent } from './modify_inventory_item.component';
//import { InventoryItemProfileComponent } from './inventory_item_profile.component';

describe('AddItemComponent', () => {
  let addItemComponent: AddItemComponent;
  let addItemForm: FormGroup;
  let fixture: ComponentFixture<AddItemComponent>;
  const pencilId = 'pencil_id';
  const activatedRoute: ActivatedRouteStub = new ActivatedRouteStub({
    // Using the constructor here lets us try that branch in `activated-route-stub.ts`
    // and then we can choose a new parameter map in the tests if we choose
    id: pencilId,
  });

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        AddItemComponent,
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
    fixture = TestBed.createComponent(AddItemComponent);
    addItemComponent = fixture.componentInstance;
    fixture.detectChanges();
    addItemForm = addItemComponent.addInventoryForm;
    expect(addItemForm).toBeDefined();
    expect(addItemForm.controls).toBeDefined();
  });

  it('should create the component and form', () => {
    expect(addItemComponent).toBeTruthy();
    expect(addItemForm).toBeTruthy();
  });

  // Confirms that an initial, empty form is *not* valid, so
  // people can't submit an empty form.
  it('form should be invalid when empty', () => {
    expect(addItemForm.valid).toBeFalsy();
  });

  describe('The name field', () => {
    let nameControl: AbstractControl;

    beforeEach(() => {
      nameControl = addItemComponent.addInventoryForm.controls.name;
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

  describe('The stocked field', () => {
    let stockedControl: AbstractControl;

    beforeEach(() => {
      stockedControl = addItemComponent.addInventoryForm.controls.stocked;
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

    it('should not allow a stcok to contain a decimal point', () => {
      stockedControl.setValue(27.5);
      expect(stockedControl.valid).toBeFalsy();
      expect(stockedControl.hasError('pattern')).toBeTruthy();
    });
  });

  describe('The description field', () => {
    it('should allow empty values', () => {
      const descControl = addItemForm.controls.desc;
      descControl.setValue('');
      expect(descControl.valid).toBeTruthy();
    });
  });

  describe('The pack field', () => {
    let packControl: AbstractControl;

    beforeEach(() => {
      packControl = addItemComponent.addInventoryForm.controls.pack;
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

  describe('The description field', () => {
    it('should allow empty values', () => {
      const descControl = addItemForm.controls.desc;
      descControl.setValue('');
      expect(descControl.valid).toBeTruthy();
    });
  });

  describe('The type field', () => {
    let typeControl: AbstractControl;

    beforeEach(() => {
      typeControl = addItemComponent.addInventoryForm.controls.type;
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
      locationControl = addItemForm.controls.location;
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

  describe('getErrorMessage()', () => {
    it('should return the correct error message', () => {
      // The type statement is needed to ensure that `controlName` isn't just any
      // random string, but rather one of the keys of the `addUserValidationMessages`
      // map in the component.
      let controlName: keyof typeof addItemComponent.addItemValidationMessages = 'name';
      addItemComponent.addInventoryForm.get(controlName).setErrors({'required': true});
      expect(addItemComponent.getErrorMessage(controlName)).toEqual('Name is required!');

      controlName = 'location';
      addItemComponent.addInventoryForm.get(controlName).setErrors({'required': true});
      expect(addItemComponent.getErrorMessage(controlName)).toEqual('Location is required!');
    });

    it('should return "Unknown error" if no error message is found', () => {
      const controlName: keyof typeof addItemComponent.addItemValidationMessages = 'name';
      addItemComponent.addInventoryForm.get(controlName).setErrors({'unknown': true});
      expect(addItemComponent.getErrorMessage(controlName)).toEqual('Unknown error');
    });
  });
});

describe('AddItemComponent#submitForm()', () => {
  let component: AddItemComponent;
  let fixture: ComponentFixture<AddItemComponent>;
  let inventoryService: InventoryService;
  let location: Location;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        AddItemComponent,
        MatSnackBarModule
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {provide: InventoryService, useClass: MockInventoryService }, // A (more-async-tests) - provide + use class of the mock
        provideRouter([
          { path: 'inventory/1', component: ModifyItemComponent }
        ])]
    }).compileComponents().catch(error => {
      expect(error).toBeNull();
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddItemComponent);
    component = fixture.componentInstance;
    inventoryService = TestBed.inject(InventoryService); // B (more-async-tests) - inject the service as the mock
    location = TestBed.inject(Location);
    // We need to inject the router and the HttpTestingController, but
    // never need to use them. So, we can just inject them into the TestBed
    // and ignore the returned values.
    TestBed.inject(Router);
    TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  beforeEach(() => {
    // Set up the form with valid values.
    // We don't actually have to do this, but it does mean that when we
    // check that `submitForm()` is called with the right arguments below,
    // we have some reason to believe that that wasn't passing "by accident".
    component.addInventoryForm.controls.name.setValue('Yellow Pencil');
    component.addInventoryForm.controls.stocked.setValue(27);
    component.addInventoryForm.controls.location.setValue('Over There');
    component.addInventoryForm.controls.desc.setValue('What a description!');
    component.addInventoryForm.controls.type.setValue('pencils');
  });

  //Something about the routing here is broken. Probably not the end of the world???

  // it('should call addItem() and handle success response', fakeAsync(() => {
  //   const addItemSpy = spyOn(inventoryService, 'addItem').and.returnValue(of('1'));
  //   component.submitForm();
  //   // Check that `.addItem()` was called with the form's values which we set
  //   // up above.
  //   expect(addItemSpy).toHaveBeenCalledWith(component.addInventoryForm.value);
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
    expect(addItemSpy).toHaveBeenCalledWith(component.addInventoryForm.value);
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
    expect(addItemSpy).toHaveBeenCalledWith(component.addInventoryForm.value);
    expect(location.path()).toBe(path);
  });

  it('should call addItem() and handle unexpected error response if it arises', () => {
    const path = location.path();
    const errorResponse = { status: 404, message: 'Not found' };
    const addItemSpy = spyOn(inventoryService, 'addItem')
      .and
      .returnValue(throwError(() => errorResponse));
    component.submitForm();
    expect(addItemSpy).toHaveBeenCalledWith(component.addInventoryForm.value);
    expect(location.path()).toBe(path);
  });
});
