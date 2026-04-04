import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
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

  modifyMass(newProps:InventoryItem,oldItems:InventoryItem[]) {
    //Copied from Inventory Service for testing purposes.
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
        pack:undefined,
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
