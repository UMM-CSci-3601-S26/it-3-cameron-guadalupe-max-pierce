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
export class MockInventoryService implements Pick<InventoryService, 'getItems' | 'filterItems' | 'addItem' | 'deleteItem' | 'modifyMass' > {
  //'getUsers' | 'getUserById' | 'addUser' | 'filterUsers'
  static testItems: InventoryItem[] = [
    {
      _id: 'pencil_id',
      name: 'Yellow Pencils',
      type: 'pencil',
      location: 'Tote #3',
      stocked: 6,
      desc: 'yellow Ticonderoga pencils'
    },
    {
      _id: 'eraser_id',
      name: '2-inch Eraser',
      type: 'eraser',
      location: 'Tote #4',
      stocked: 2,
      desc: '2-inch rubber eraser'
    },
    {
      _id: '1',
      name: 'Red Plastic Folder',
      type: 'folder',
      location: 'Tote #2',
      stocked: 0,
      desc: 'standard size red plastic folder.'
    }
  ];
  static emptyItem: InventoryItem = {
    _id: '',
    name: '',
    type: '',
    location: '',
    stocked: 0,
    desc: ''
  }

  //Probably terrible form, but best way I could figure to get the tests working.
  realService = new InventoryService;
  typeOptions = this.realService.typeOptions;

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
    //Doesn't return anything; just modifies database.
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
