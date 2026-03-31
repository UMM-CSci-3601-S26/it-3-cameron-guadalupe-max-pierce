import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Observable } from 'rxjs';
import { MockGradeListService } from 'src/testing/grade_list.service.mock';
import { GradeListComponent } from './grade_list.component';
import { GradeListService } from './grade_list.service';
import { RequiredItem } from './required_item';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('Grade List', () => {
  let gradeList: GradeListComponent;
  let fixture: ComponentFixture<GradeListComponent>;
  let inventoryService: GradeListService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [GradeListComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: GradeListService, useClass: MockGradeListService },
        provideRouter([])
      ],
    });
  });

  beforeEach(waitForAsync(() => {
    TestBed.compileComponents().then(() => {
      fixture = TestBed.createComponent(GradeListComponent);
      gradeList = fixture.componentInstance;
      inventoryService = TestBed.inject(GradeListService);
      fixture.detectChanges();
    });
  }));

  it('should create the component', () => {
    expect(gradeList).toBeTruthy();
  });

  it('should initialize with serverFilteredItems available', () => {
    const items = gradeList.serverFilteredItems();
    expect(items).toBeDefined();
    expect(Array.isArray(items)).toBe(true);
  });

  it('should initialize with filteredItems available', () => {
    const items = gradeList.filteredItems();
    expect(items).toBeDefined();
    expect(Array.isArray(items)).toBe(true);
  });

  it('should initialize with filteredTypeOptions available', () => {
    const items = gradeList.filteredTypeOptions();
    expect(items).toBeDefined();
    expect(Array.isArray(items)).toBe(true);
  });

  it('should initialize with filteredGradeOptions available', () => {
    const items = gradeList.filteredGradeOptions();
    expect(items).toBeDefined();
    expect(Array.isArray(items)).toBe(true);
  });

  it('should initialize with typeFilteredItems available', () => {
    const typedItems = gradeList.typeFilteredItems();
    expect(typedItems).toBeDefined();
    expect(Array.isArray(typedItems)).toBe(true);
  });

  it('should initialize with schoolFilteredItems available', () => {
    const schoolItems = gradeList.schoolFilteredItems();
    expect(schoolItems).toBeDefined();
    expect(Array.isArray(schoolItems)).toBe(true);
  });

  it('should call getItems() and updateSavedSearch() when itemName signal changes', () => {
    const spy = spyOn(inventoryService, 'getItems').and.callThrough();
    const doubleAgent = spyOn(inventoryService, 'updateSavedSearch').and.callThrough();
    gradeList.itemName.set('test');
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith({  }); //Since we're not filtering on server, no arguements should be passed.
    expect(doubleAgent).toHaveBeenCalled();
  });

  it('should not show error message on successful load', () => {
    expect(gradeList.errMsg()).toBeUndefined();
  });

  it("correctly handles the 'Location Reset' button", () => {
    expect(gradeList.resetVisible()).toEqual(false);
    gradeList.revealReset();
    expect(gradeList.resetVisible()).toEqual(true);
  });

  //Irrellevant; eventually add a test for clearing the grade list.
  // it("calls the service with correct parameters for location reset", () => {
  //   const spy = spyOn(inventoryService, 'modifyMass').and.callThrough();
  //   const originalItems = gradeList.filteredItems();
  //   gradeList.resetLocations();
  //   fixture.detectChanges();
  //   expect(spy).toHaveBeenCalledOnceWith(
  //     {
  //       _id:undefined,
  //       location:"N/A",
  //       stocked:undefined,
  //       name:undefined,
  //       type:undefined,
  //       desc:undefined
  //     },
  //     originalItems
  //   );
  // });
});

describe('Misbehaving Grade List', () => {
  let itemList: GradeListComponent;
  let fixture: ComponentFixture<GradeListComponent>;

  let inventoryServiceStub: {
    getItems: () => Observable<RequiredItem[]>;
    filterItems: () => RequiredItem[];
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
  //Still no idea what this is doing, whatever
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        GradeListComponent
      ],
      providers: [{
        provide: GradeListService,
        useValue: inventoryServiceStub
      }, provideRouter([])],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GradeListComponent);
    itemList = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("generates an error if we don't set up a GradeListService", () => {
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
