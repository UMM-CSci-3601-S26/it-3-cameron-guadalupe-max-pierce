import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Observable } from 'rxjs';
import { MockInventoryService } from 'src/testing/inventory.service.mock';
import { InventoryListComponent } from './inventory_list.component';
import { InventoryItem } from './inventory_item';
import { InventoryService } from './inventory.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('Inventory list', () => {
  let inventoryList: InventoryListComponent;
  let fixture: ComponentFixture<InventoryListComponent>;
  let inventoryService: InventoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [InventoryListComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: InventoryService, useClass: MockInventoryService },
        provideRouter([])
      ],
    });
  });

  beforeEach(waitForAsync(() => {
    TestBed.compileComponents().then(() => {
      fixture = TestBed.createComponent(InventoryListComponent);
      inventoryList = fixture.componentInstance;
      inventoryService = TestBed.inject(InventoryService);
      fixture.detectChanges();
    });
  }));

  it('should create the component', () => {
    expect(inventoryList).toBeTruthy();
  });

  it('should initialize with serverFilteredItems available', () => {
    const items = inventoryList.serverFilteredItems();
    expect(items).toBeDefined();
    expect(Array.isArray(items)).toBe(true);
  });

  it('should initialize with filteredItems available', () => {
    const items = inventoryList.filteredItems();
    expect(items).toBeDefined();
    expect(Array.isArray(items)).toBe(true);
  });

  it('should initialize with typeFilteredItems available', () => {
    const typedItems = inventoryList.typeFilteredItems();
    expect(typedItems).toBeDefined();
    expect(Array.isArray(typedItems)).toBe(true);
  });

  it('should call getItems() and updateSavedSearch() when itemName signal changes', () => {
    const spy = spyOn(inventoryService, 'getItems').and.callThrough();
    const doubleAgent = spyOn(inventoryService, 'updateSavedSearch').and.callThrough();
    inventoryList.itemName.set('test');
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith({  }); //Since we're not filtering on server, no arguements should be passed.
    expect(doubleAgent).toHaveBeenCalled();
  });

  //Current setup just calls getItems when anything changes. Probably a better way to test this.
  // it('should call getUsers() when userAge signal changes', () => {
  //   const spy = spyOn(userService, 'getUsers').and.callThrough();
  //   userList.userAge.set(25);
  //   fixture.detectChanges();
  //   expect(spy).toHaveBeenCalledWith({ role: undefined, age: 25 });
  // });

  it('should not show error message on successful load', () => {
    expect(inventoryList.errMsg()).toBeUndefined();
  });

  it("correctly handles the 'Location Reset' button", () => {
    expect(inventoryList.resetVisible()).toEqual(false);
    inventoryList.revealReset();
    expect(inventoryList.resetVisible()).toEqual(true);
  });

  it("calls the service with correct parameters for location reset", () => {
    const spy = spyOn(inventoryService, 'modifyMass').and.callThrough();
    const originalItems = inventoryList.filteredItems();
    inventoryList.resetLocations();
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledOnceWith(
      {
        _id:undefined,
        location:"N/A",
        stocked:undefined,
        name:undefined,
        type:undefined,
        desc:undefined
      },
      originalItems
    );
  });

  it('announceSortChange announces when direction is set', () => {
    const spy = spyOn(inventoryList['liveAnnouncer'], 'announce');
    inventoryList.announceSortChange({ active: 'name', direction: 'asc' });
    expect(spy).toHaveBeenCalledWith('Sorted ascending');
  });

  it('announceSortChange announces sort cleared when direction is empty', () => {
    const spy = spyOn(inventoryList['liveAnnouncer'], 'announce');
    inventoryList.announceSortChange({ active: '', direction: '' });
    expect(spy).toHaveBeenCalledWith('Sorting cleared');
  });

  it('filteredTypeOptions filters correctly when itemType is set', () => {
    inventoryList.itemType.set('pen');
    const result = inventoryList.filteredTypeOptions();
    expect(result.length).toBeGreaterThan(0);
    expect(result.every(opt =>
      opt.label.toLowerCase().includes('pen') || opt.value.toLowerCase().includes('pen')
    )).toBeTrue();
  });

  it('displayTypeLabel returns label when value matches a typeOption', () => {
    const label = inventoryList.displayTypeLabel('pencils');
    expect(label).toBe('Pencils');
  });

  it('displayTypeLabel returns the value itself when no match is found', () => {
    const label = inventoryList.displayTypeLabel('nonexistent_type');
    expect(label).toBe('nonexistent_type');
  });
});

describe('Misbehaving Item List', () => {
  let itemList: InventoryListComponent;
  let fixture: ComponentFixture<InventoryListComponent>;

  let inventoryServiceStub: {
    getItems: () => Observable<InventoryItem[]>;
    filterItems: () => InventoryItem[];
    updateSavedSearch: () => undefined;
  };

  beforeEach(() => {
    // stub UserService for test purposes
    inventoryServiceStub = {
      getItems: () =>
        new Observable((observer) => {
          observer.error('getItems() Observer generates an error');
        }),
      filterItems: () => [],
      updateSavedSearch: () => undefined
    };
  });

  // Construct the `userList` used for the testing in the `it` statement
  // below.
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        InventoryListComponent
      ],
      // providers:    [ UserService ]  // NO! Don't provide the real service!
      // Provide a test-double instead
      providers: [{
        provide: InventoryService,
        useValue: inventoryServiceStub
      }, provideRouter([])],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoryListComponent);
    itemList = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("generates an error if we don't set up an InventoryListService", () => {
    // If the service fails, we expect the `serverFilteredUsers` signal to
    // be an empty array of users.
    expect(itemList.serverFilteredItems())
      .withContext("service can't give values to the list if it's not there")
      .toEqual([]);
    // We also expect the `errMsg` signal to contain the "Problem contacting…"
    // error message. (It's arguably a bit fragile to expect something specific
    // like this; maybe we just want to expect it to be non-empty?)
    expect(itemList.errMsg())
      .withContext('the error message will be')
      .toContain('Problem contacting the server – Error Code:');
  });
});
