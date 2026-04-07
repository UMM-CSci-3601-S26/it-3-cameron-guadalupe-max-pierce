import { Injectable } from '@angular/core';
import { Observable, forkJoin, of, switchMap } from 'rxjs';
import { AppComponent } from 'src/app/app.component';
import { InventoryItem } from '../app/inventory/inventory_item';
import { InventoryService } from 'src/app/inventory/inventory.service';

/**
 * A "mock" version of the `InventoryService` that can be used to test components
 * without having to create an actual service. It needs to be `Injectable` since
 * that's how services are typically provided to components.
 */
@Injectable({
  providedIn: AppComponent
})
export class MockInventoryService implements Pick<InventoryService, 'getItems' | 'filterItems' | 'addItem' | 'deleteItem'| 'updateSavedSearch'| 'modifyMass'> {
  savedInventoryName = ''; //Per-session saved value for name search bar.
  savedInventoryLocation = ''; //Per-session saved value for location search bar.
  savedInventoryStocked = 0; //Per-session saved value for stocked search bar.
  savedInventoryType = ''; //Per-session saved value for type search bar.
  savedInventoryDesc = ''; //Per-session saved value for description search bar.
  savedInventorySortBy = ''; //Per-session saved value for sort-order search bar.

  static testItems: InventoryItem[] = [
    {
      _id: 'pencil_id',
      name: 'Yellow Pencils',
      type: 'pencil',
      location: 'Tote #3',
      stocked: 6,
      desc: 'yellow Ticonderoga pencils',
      pack:1
    },
    {
      _id: 'eraser_id',
      name: '2-inch Eraser',
      type: 'eraser',
      location: 'Tote #4',
      stocked: 2,
      desc: '2-inch rubber eraser',
      pack:1
    },
    {
      _id: '1',
      name: 'Red Plastic Folder',
      type: 'folder',
      location: 'Tote #2',
      stocked: 0,
      desc: 'standard size red plastic folder.',
      pack:1
    }
  ];
  static emptyItem: InventoryItem = {
    _id: '',
    name: '',
    type: '',
    location: '',
    stocked: 0,
    desc: '',
    pack:1
  }

  //Probably terrible form, but best way I could figure to get the tests working.
  realService = new InventoryService;
  typeOptions = this.realService.typeOptions;

  //For testing purposes, this is identical to the actual service. (Otherwise linting is mad about not using fields.)
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

  // skipcq: JS-0105
  // It's OK that the `_filters` argument isn't used here, so we'll disable
  // this warning for just his function.
  /* eslint-disable @typescript-eslint/no-unused-vars */
  getItems(_filters: { name?: string; stocked?: number; desc?: string; location?: string; type?: string;}): Observable<InventoryItem[]> {
    return of(MockInventoryService.testItems);
  }

  //Probably unessesary
  // skipcq: JS-0105
  getItemById(id: string): Observable<InventoryItem> {
    // If the specified ID is for one of the first two test users,
    // return that user, otherwise return `null` so
    // we can test illegal user requests.
    // If you need more, just add those in too.
    if (id === MockInventoryService.testItems[0]._id) {
      return of(MockInventoryService.testItems[0]);
    } else if (id === MockInventoryService.testItems[1]._id) {
      return of(MockInventoryService.testItems[1]);
    } else {
      return of(null);
    }
  }

  //Todo
  addItem(item: Partial<InventoryItem>): Observable<string> {
    // Send post request to add a new item with the item data as the body.
    // `res.id` should be the MongoDB ID of the newly added `Item`.
    return of('');
  }

  deleteItem(id: string): Observable<InventoryItem> {
    // Send post request to add a new item with the item data as the body.
    // `res.id` should be the MongoDB ID of the newly added `Item`.
    return of(MockInventoryService.emptyItem);
  }

  modifyMass(newProps:InventoryItem,oldItems:InventoryItem[]): Observable<void> {
    if (oldItems.length === 0) {
      return of(void 0);
    }

    return forkJoin(
      oldItems.map((oldItem) => {
        const newItem: Partial<InventoryItem> = {
          name: newProps.name != undefined ? newProps.name : oldItem.name,
          location: newProps.location != undefined ? newProps.location : oldItem.location,
          desc: newProps.desc != undefined ? newProps.desc : oldItem.desc,
          stocked: newProps.stocked != undefined ? newProps.stocked : oldItem.stocked,
          type: newProps.type != undefined ? newProps.type : oldItem.type,
          pack: newProps.pack != undefined ? newProps.pack : oldItem.pack,
        };

        return this.addItem(newItem).pipe(
          switchMap(() => this.deleteItem(oldItem._id))
        );
      })
    ).pipe(switchMap(() => of(void 0)));
  }

  filterItems(items: InventoryItem[], filters: {
    name?: string;
    stocked?: number;
    desc?: string;
    location?: string;
    type?: string;
  }): InventoryItem[] {
    return []
  }
}
