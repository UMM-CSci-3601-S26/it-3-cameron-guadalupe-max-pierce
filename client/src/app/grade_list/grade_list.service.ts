import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { RequiredItem } from './required_item';
import { School } from './school';
import { InventoryService } from '../inventory/inventory.service';
import { FamilyService } from '../families/family.service';
//import { Company } from '../company-list/company';
//import { Signal } from '@angular/core/rxjs-interop';

/**
 * Service that provides the interface for getting information
 * about `Users` from the server.
 */
@Injectable({
  providedIn: 'root'
})
export class GradeListService {
  // The private `HttpClient` is *injected* into the service
  // by the Angular framework. This allows the system to create
  // only one `HttpClient` and share that across all services
  // that need it, and it allows us to inject a mock version
  // of `HttpClient` in the unit tests so they don't have to
  // make "real" HTTP calls to a server that might not exist or
  // might not be currently running.
  private httpClient = inject(HttpClient);

  // The URL for the users part of the server API.
  readonly inventoryUrl: string = `${environment.apiUrl}grade_list`;
  readonly schoolUrl: string = `${environment.apiUrl}schools`;
  //readonly usersByCompanyUrl: string = `${environment.apiUrl}usersByCompany`;

  private readonly nameKey = 'name';
  private readonly typeKey = 'type';
  private readonly descKey = 'desc';
  private readonly requiredKey = 'required';
  private readonly gradeKey = 'grade';
  private readonly schoolKey = 'school';

  savedGradeListName = ''; //Per-session saved value for name search bar.
  savedGradeListRequired = 0; //Per-session saved value for stocked search bar.
  savedGradeListType = ''; //Per-session saved value for type search bar.
  savedGradeListDesc = ''; //Per-session saved value for description search bar.
  savedGradeListGrade = ''; //Per-session saved value for description search bar.
  savedGradeListSchool = ''; //Per-session saved value for description search bar.
  savedGradeListSortBy = 'school'; //Per-session saved value for sort-order search bar. School is probably the most useful default.

  //TODO - is this the correct way to do this? Better than copying the type lists in multiple places?
  inventoryService = new InventoryService;
  typeOptions = this.inventoryService.typeOptions;

  gradeService = new FamilyService
  gradeOptions = this.gradeService.gradeOptions;
  //What are the odds this last one works?
  //schoolOptions = this.httpClient.get<[School[]]>(this.schoolUrl);


  /**
   * @param fields a map that specifies which search terms to save
  */
  updateSavedSearch(fields: {name: string; required: number; desc: string; grade: string; school: string; type: string; sortby: string;}) {
    //Formerly checked if fields were provided; now required.
    //Defaults to empty strings and zeros.
    this.savedGradeListName = fields.name;
    this.savedGradeListRequired = fields.required;
    this.savedGradeListDesc = fields.desc;
    this.savedGradeListGrade = fields.grade;
    this.savedGradeListSchool = fields.school;
    this.savedGradeListType = fields.type;
    this.savedGradeListSortBy = fields.sortby;
  }

  /**
   * Get all the items from the server, filtered by the information
   * in the `filters` map.
   *
   *
   * @param filters a map that allows us to specify a target role, age,
   *  or company to filter by, or any combination of those
   * @returns an `Observable` of an array of `InventoryItems`. Wrapping the array
   *  in an `Observable` means that other bits of of code can `subscribe` to
   *  the result (the `Observable`) and get the results that come back
   *  from the server after a possibly substantial delay (because we're
   *  contacting a remote server over the Internet).
   */
  getItems(filters?: { name?: string; required?: number; desc?: string; grade?: string; school?: string; type?: string; }): Observable<RequiredItem[]> {
    // `HttpParams` is essentially just a map used to hold key-value
    // pairs that are then encoded as "?key1=value1&key2=value2&…" in
    // the URL when we make the call to `.get()` below.
    let httpParams: HttpParams = new HttpParams();
    if (filters) {
      if (filters.name) {
        httpParams = httpParams.set(this.nameKey, filters.name);
      }
      if (filters.required) {
        httpParams = httpParams.set(this.requiredKey, filters.required.toString());
      }
      if (filters.grade) {
        httpParams = httpParams.set(this.gradeKey, filters.grade);
      }
      if (filters.school) {
        httpParams = httpParams.set(this.schoolKey, filters.school);
      }
      if (filters.desc) {
        httpParams = httpParams.set(this.descKey, filters.desc);
      }
      if (filters.type) {
        httpParams = httpParams.set(this.typeKey, filters.type);
      }
    }
    // Send the HTTP GET request with the given URL and parameters.
    // That will return the desired `Observable<InventoryItem[]>`.
    return this.httpClient.get<RequiredItem[]>(this.inventoryUrl, {
      params: httpParams,
    });
  }

  //Helper function
  getSchools(): Observable<School[]> {
    return this.httpClient.get<School[]>(this.schoolUrl);
  }

  /**
   * Get the `InventoryItem` with the specified ID.
   *
   * @param id the ID of the desired user
   * @returns an `Observable` containing the resulting user.
   */
  getItemById(id: string): Observable<RequiredItem> {
    // The input to get could also be written as (this.userUrl + '/' + id)
    return this.httpClient.get<RequiredItem>(`${this.inventoryUrl}/${id}`);
  }

  /**
   * A service method that filters an array of `InventoryItems` using
   * the specified filters.
   *
   * Note that the filters here support partial matches. Since the
   * matching is done locally we can afford to repeatedly look for
   * partial matches instead of waiting until we have a full string
   * to match against.
   *
   * @param items the array of `InventoryItems` that we're filtering
   * @param filters the map of key-value pairs used for the filtering
   * @returns an array of `Users` matching the given filters
   */
  filterItems(items: RequiredItem[], filters: { name?: string; required?: number; desc?: string; grade?: string; school?: string; type?: string; sortBy?: string;}): RequiredItem[] { // skipcq: JS-0105
    let filteredItems = items; //.getValue();
    // let filteredItems: InventoryItem[] = [];

    //TODO, write sorting logic here!
    // Filter by name
    if (filters.name) {
      filters.name = filters.name.toLowerCase();
      filteredItems = filteredItems.filter(item => item.name.toLowerCase().indexOf(filters.name) !== -1);
    }

    if (filters.desc) {
      filters.desc = filters.desc.toLowerCase();
      filteredItems = filteredItems.filter(item => item.desc.toLowerCase().indexOf(filters.desc) !== -1);
    }

    if (filters.grade) {
      filters.grade = filters.grade.toLowerCase();
      filteredItems = filteredItems.filter(item => item.grade.toLowerCase().indexOf(filters.grade) !== -1);
    }

    if (filters.school) {
      filters.school = filters.school.toLowerCase();
      filteredItems = filteredItems.filter(item => item.school.toLowerCase().indexOf(filters.school) !== -1);
    }

    if (filters.type) {
      filters.type = filters.type.toLowerCase();
      filteredItems = filteredItems.filter(item => item.type.toLowerCase().indexOf(filters.type) !== -1);
    }

    if (filters.required) {
      //filters.stocked = filters.type.toLowerCase();
      filteredItems = filteredItems.filter(item => item.required >= filters.required);
    }

    switch (filters.sortBy) {
    case "quantity":
      filteredItems = filteredItems.sort((i1,i2) => {
        return i1.required - i2.required;
      });
      break;
    case "quantity_des":
      filteredItems = filteredItems.sort((i1,i2) => {
        return i2.required - i1.required;
      });
      break;
    case "name":
      filteredItems = filteredItems.sort((i1,i2) => {
        return i1.name.localeCompare(i2.name);
      });
      break;
    case "name_des":
      filteredItems = filteredItems.sort((i1,i2) => {
        return i2.name.localeCompare(i1.name);
      });
      break;
    }

    return filteredItems;
  }

  addItem(newItem: Partial<RequiredItem>): Observable<string> {
    // Send post request to add a new item with the item data as the body.
    // `res.id` should be the MongoDB ID of the newly added `Item`.
    return this.httpClient.post<{id: string}>(this.inventoryUrl, newItem).pipe(map(response => response.id));
  }

  deleteItem(id: string): Observable<RequiredItem> {
    return this.httpClient.delete<RequiredItem>(`${this.inventoryUrl}/${id}`);
  }

  modifyMass(newProps:RequiredItem,oldItems:RequiredItem[]) {
    //We first need to copy the items into a new array. oldItems is connected to a signal or something.
    //Redoing the whole database is not a great way to do this. For now we're doing it anyways.
    const newItems: RequiredItem[] = [];
    for (let i = 0; i < oldItems.length -1; i ++) {
      //Location is probably the only one this will be used for, but you never know.
      //id is never overwritten; necessary to delete and replace.
      const baseItem: RequiredItem = {
        _id:undefined,
        name:undefined,
        grade:undefined,
        school:undefined,
        desc:undefined,
        required:undefined,
        type:undefined
      }
      //Create a new array of items, initialized as empty.
      newItems.push(baseItem);

      if (newProps.name != undefined) {
        newItems[i].name = newProps.name;
      } else {
        newItems[i].name = oldItems[i].name;
      }

      if (newProps.required != undefined) {
        newItems[i].required = newProps.required;
      } else {
        newItems[i].required = oldItems[i].required;
      }

      if (newProps.grade != undefined) {
        newItems[i].grade = newProps.grade;
      } else {
        newItems[i].grade = oldItems[i].grade;
      }

      if (newProps.school != undefined) {
        newItems[i].school = newProps.school;
      } else {
        newItems[i].school = oldItems[i].school;
      }

      if (newProps.desc != undefined) {
        newItems[i].desc = newProps.desc;
      } else {
        newItems[i].desc = oldItems[i].desc;
      }

      if (newProps.type != undefined) {
        newItems[i].type = newProps.type;
      } else {
        newItems[i].type = oldItems[i].type;
      }
      this.addItem(newItems[i]).subscribe(); //Need to subscribe for changes to take effect
      this.deleteItem(oldItems[i]._id).subscribe();
    }
  }
}
