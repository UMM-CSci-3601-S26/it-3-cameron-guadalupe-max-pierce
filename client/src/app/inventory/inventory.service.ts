import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { InventoryItem } from './inventory_item';
//import { Company } from '../company-list/company';
//import { Signal } from '@angular/core/rxjs-interop';

/**
 * Service that provides the interface for getting information
 * about `Users` from the server.
 */
@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  // The private `HttpClient` is *injected* into the service
  // by the Angular framework. This allows the system to create
  // only one `HttpClient` and share that across all services
  // that need it, and it allows us to inject a mock version
  // of `HttpClient` in the unit tests so they don't have to
  // make "real" HTTP calls to a server that might not exist or
  // might not be currently running.
  private httpClient = inject(HttpClient);

  // The URL for the users part of the server API.
  readonly inventoryUrl: string = `${environment.apiUrl}inventory`;
  //readonly usersByCompanyUrl: string = `${environment.apiUrl}usersByCompany`;

  private readonly nameKey = 'name';
  private readonly locationKey = 'location';
  private readonly typeKey = 'type';
  private readonly descKey = 'desc';
  private readonly stockedKey = 'stocked';

  savedInventoryName = ''; //Per-session saved value for name search bar.
  savedInventoryLocation = ''; //Per-session saved value for location search bar.
  savedInventoryStocked = 0; //Per-session saved value for stocked search bar.
  savedInventoryType = ''; //Per-session saved value for type search bar.
  savedInventoryDesc = ''; //Per-session saved value for description search bar.
  savedInventorySortBy = ''; //Per-session saved value for sort-order search bar.

  typeOptions = [
    { value: 'pencils', label: 'Pencils' },
    { value: 'colored_pencils', label: 'Colored Pencils' },
    { value: 'sharpeners', label: 'Sharpeners' },
    { value: 'markers', label: 'Markers' },
    { value: 'highlighters', label: 'Highlighters' },
    { value: 'dry_erase_markers', label: 'Dry-Erase Markers' },
    { value: 'crayons', label: 'Crayons' },
    { value: 'pens', label: 'Pens' },
    { value: 'erasers', label: 'Erasers' },
    { value: 'folders', label: 'Folders' },
    { value: 'binders', label: 'Binders' },
    { value: 'notebooks', label: 'Notebooks' },
    { value: 'glue', label: 'Glue' },
    { value: 'rulers', label: 'Rulers' },
    { value: 'scissors', label: 'Scissors' },
    { value: 'headphones', label: 'Headphones' },
    { value: 'backpacks', label: 'Backpacks' },
    { value: 'boxes', label: 'Boxes' },
    { value: 'other', label: 'Other' }
  ];

  /**
   * @param fields a map that specifies which search terms to save
  */
  updateSavedSearch(fields: {name: string; stocked: number; desc: string; location: string; type: string; sortby: string;}) {
    //Formerly checked if fields were provided; now required.
    //Defaults to empty strings and zeros.
    this.savedInventoryName = fields.name;
    this.savedInventoryStocked = fields.stocked;
    this.savedInventoryDesc = fields.desc;
    this.savedInventoryLocation = fields.location;
    this.savedInventoryType = fields.type;
    this.savedInventorySortBy = fields.sortby;
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
  getItems(filters?: { name?: string; stocked?: number; desc?: string; location?: string; type?: string; }): Observable<InventoryItem[]> {
    // `HttpParams` is essentially just a map used to hold key-value
    // pairs that are then encoded as "?key1=value1&key2=value2&…" in
    // the URL when we make the call to `.get()` below.
    let httpParams: HttpParams = new HttpParams();
    if (filters) {
      if (filters.name) {
        httpParams = httpParams.set(this.nameKey, filters.name);
      }
      if (filters.stocked) {
        httpParams = httpParams.set(this.stockedKey, filters.stocked.toString());
      }
      if (filters.location) {
        httpParams = httpParams.set(this.locationKey, filters.location);
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
    return this.httpClient.get<InventoryItem[]>(this.inventoryUrl, {
      params: httpParams,
    });
  }

  /**
   * Get the `InventoryItem` with the specified ID.
   *
   * @param id the ID of the desired user
   * @returns an `Observable` containing the resulting user.
   */
  getItemById(id: string): Observable<InventoryItem> {
    // The input to get could also be written as (this.userUrl + '/' + id)
    return this.httpClient.get<InventoryItem>(`${this.inventoryUrl}/${id}`);
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
  filterItems(items: InventoryItem[], filters: { name?: string; stocked?: number; desc?: string; location?: string; type?: string; sortBy?: string;}): InventoryItem[] { // skipcq: JS-0105
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

    if (filters.location) {
      filters.location = filters.location.toLowerCase();
      filteredItems = filteredItems.filter(item => item.location.toLowerCase().indexOf(filters.location) !== -1);
    }

    if (filters.type) {
      filters.type = filters.type.toLowerCase();
      filteredItems = filteredItems.filter(item => item.type.toLowerCase().indexOf(filters.type) !== -1);
    }

    if (filters.stocked) {
      //filters.stocked = filters.type.toLowerCase();
      filteredItems = filteredItems.filter(item => item.stocked >= filters.stocked);
    }

    switch (filters.sortBy) {
    case "quantity":
      filteredItems = filteredItems.sort((i1,i2) => {
        return i1.stocked - i2.stocked;
      });
      break;
    case "quantity_des":
      filteredItems = filteredItems.sort((i1,i2) => {
        return i2.stocked - i1.stocked;
      });
      break;
    case "location":
      filteredItems = filteredItems.sort((i1,i2) => {
        return i1.location.localeCompare(i2.location);
      });
      break;
    case "location_des":
      filteredItems = filteredItems.sort((i1,i2) => {
        return i2.location.localeCompare(i1.location);
      });
      break;
    // case "type":
    //  filteredItems = filteredItems.sort((i1,i2) => {
    //     return i1.type.localeCompare(i2.type);
    //   });
    //   break;
    // case "type_des":
    //   filteredItems = filteredItems.sort((i1,i2) => {
    //     return i2.type.localeCompare(i1.type);
    //   });
    //   break;
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

  addItem(newItem: Partial<InventoryItem>): Observable<string> {
    // Send post request to add a new item with the item data as the body.
    // `res.id` should be the MongoDB ID of the newly added `Item`.
    return this.httpClient.post<{id: string}>(this.inventoryUrl, newItem).pipe(map(response => response.id));
  }

  deleteItem(id: string): Observable<InventoryItem> {
    return this.httpClient.delete<InventoryItem>(`${this.inventoryUrl}/${id}`);
  }

  modifyMass(newProps:InventoryItem,oldItems:InventoryItem[]) {
    //We first need to copy the items into a new array. oldItems is connected to a signal or something.
    //Redoing the whole database is not a great way to do this. For now we're doing it anyways.
    const newItems: InventoryItem[] = [];
    for (let i = 0; i < oldItems.length -1; i ++) {
      //Location is probably the only one this will be used for, but you never know.
      //id is never overwritten; necessary to delete and replace.
      const baseItem: InventoryItem = {
        _id:undefined,
        name:undefined,
        location:undefined,
        desc:undefined,
        stocked:undefined,
        type:undefined,
        pack:undefined
      }
      //Create a new array of items, initialized as empty.
      newItems.push(baseItem);

      if (newProps.name != undefined) {
        newItems[i].name = newProps.name;
      } else {
        newItems[i].name = oldItems[i].name;
      }

      if (newProps.stocked != undefined) {
        newItems[i].stocked = newProps.stocked;
      } else {
        newItems[i].stocked = oldItems[i].stocked;
      }

      if (newProps.pack != undefined) {
        newItems[i].pack = newProps.pack;
      } else {
        newItems[i].pack = oldItems[i].pack;
      }

      if (newProps.location != undefined) {
        newItems[i].location = newProps.location;
      } else {
        newItems[i].location = oldItems[i].location;
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
