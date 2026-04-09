import { Component, computed, signal, inject, ViewChild, AfterViewInit, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { catchError, combineLatest, of, switchMap, tap } from 'rxjs';
import { InventoryItem } from './inventory_item';
//import { MatTableModule, MatTableDataSource } from '@angular/material/table';
//import { InventoryCardComponent } from './inventory_card.component';
import { InventoryService } from './inventory.service';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSort, Sort, MatSortModule } from '@angular/material/sort';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatToolbar } from '@angular/material/toolbar';
import { MatCheckboxChange } from '@angular/material/checkbox';

/**
 * A component that displays a list of users, either as a grid
 * of cards or as a vertical list.
 *
 * The component supports local filtering by name and/or company,
 * and remote filtering (i.e., filtering by the server) by
 * role and/or age. These choices are fairly arbitrary here,
 * but in "real" projects you want to think about where it
 * makes the most sense to do the filtering.
 */
@Component({
  selector: 'app-inventory-list-component',
  templateUrl: 'inventory_list.component.html',
  styleUrls: ['./inventory_list.component.scss'],
  providers: [],
  imports: [
    MatCardModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatOptionModule,
    MatRadioModule,
    MatTableModule,
    MatSortModule,
    MatToolbar,
    // MatTableModule,
    //InventoryCardComponent,
    MatListModule,
    RouterLink,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule
  ],
})
export class InventoryListComponent implements AfterViewInit {
  private inventoryService = inject(InventoryService);
  // snackBar the `MatSnackBar` used to display feedback
  private snackBar = inject(MatSnackBar);

  private liveAnnouncer = inject(LiveAnnouncer);

  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['name', 'type', 'desc', 'location', 'stocked'];
  dataSource = new MatTableDataSource<InventoryItem>([]);
  viewMode = signal<'list' | 'grid'>('list');

  constructor() {
    effect(() => {
      this.dataSource.data = this.filteredItems() ?? [];
    });
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this.liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this.liveAnnouncer.announce('Sorting cleared');
    }
  }

  //dataSource = new MatTableDataSource<InventoryItem>([]);
  itemName = signal<string|undefined>(this.inventoryService.savedInventoryName);
  itemStock = signal<number|undefined>(this.inventoryService.savedInventoryStocked);
  itemDesc = signal<string|undefined>(this.inventoryService.savedInventoryDesc);
  itemLocation = signal<string|undefined>(this.inventoryService.savedInventoryLocation);
  itemType = signal<string|undefined>(this.inventoryService.savedInventoryType);
  sortBy = signal<string|undefined>(this.inventoryService.savedInventorySortBy);
  resetVisible = signal<boolean|undefined>(false);//Reset button is initially hidden.
  private refreshToken = signal(0);

  filteredTypeOptions = computed(() => {
    const input = (this.itemType() || '').toLowerCase();
    if (!input) return this.inventoryService.typeOptions;
    return this.inventoryService.typeOptions.filter(option =>
      option.label.toLowerCase().includes(input) || option.value.toLowerCase().includes(input)
    );
  });

  displayTypeLabel = (value: string | null): string => {
    if (!value) return '';
    const match = this.filteredTypeOptions().find(option => option.value === value);
    return match ? match.label : value;
  };

  errMsg = signal<string | undefined>(undefined);


  //Do we still need to define observables just to make sure items are retrieved when values change?
  //Even if we're not doing filtering on the server?
  private itemName$ = toObservable(this.itemName);
  private itemStock$ = toObservable(this.itemStock);
  private itemDesc$ = toObservable(this.itemDesc);
  private itemLocation$ = toObservable(this.itemLocation);
  private itemType$ = toObservable(this.itemType);
  private refreshToken$ = toObservable(this.refreshToken);

  serverFilteredItems =
    toSignal(
      //Not actually doing any filtering on the server, just need to get Items.
      combineLatest([this.itemName$,this.itemStock$,this.itemDesc$,this.itemLocation$,this.itemType$,this.refreshToken$]).pipe(
        switchMap(() =>
          this.inventoryService.getItems({}) //If we decide to filter on server, args go her
        ),
        catchError((err) => {
          if (!(err.error instanceof ErrorEvent)) {
            this.errMsg.set(
              `Problem contacting the server – Error Code: ${err.status}\nMessage: ${err.message}`
            );
          }
          this.snackBar.open(this.errMsg() ?? 'Unknown error', 'OK', { duration: 6000 });
          return of<InventoryItem[]>([]);
        }),
        tap(() => {
        })
      )
    );


  filteredItems = computed(() => {
    const currentItems = this.serverFilteredItems();
    //Whenever we sort, we also update saved search.
    //Since this is through service, should be saved between pages.
    this.inventoryService.updateSavedSearch({
      name: this.itemName() ?? '',
      stocked: this.itemStock() ?? 0,
      desc: this.itemDesc() ?? '',
      location: this.itemLocation() ?? '',
      type: this.itemType() ?? '',
      sortby: this.sortBy() ?? ''
    });
    return this.inventoryService.filterItems(currentItems ?? [], {
      name: this.itemName(),
      type: this.itemType(),
      stocked: this.itemStock(),
      desc: this.itemDesc(),
      location: this.itemLocation(),
      sortBy: this.sortBy()
      // company: this.userCompany(),
    });
  });

  typeFilteredItems = computed(() => {
    const currentItems = this.serverFilteredItems() ?? [];
    const typedArray: { header: string, items: InventoryItem[] }[] = [];
    let matchingItems = [];
    for (let i = 0; i < this.inventoryService.typeOptions.length; i++) {
      matchingItems = this.inventoryService.filterItems(currentItems, {
        name: this.itemName(),
        type: this.inventoryService.typeOptions[i].value,
        stocked: this.itemStock(),
        desc: this.itemDesc(),
        location: this.itemLocation(),
        sortBy: this.sortBy()
      })
      //Only sections that have matching items are shown.
      if (matchingItems.length > 0) {
        typedArray.push({
          header: this.inventoryService.typeOptions[i].label,
          items: matchingItems
        })
      }
    }


    return typedArray;
  })

  revealReset() {
    // this.resetVisible = true;
    this.resetVisible.set(true);
    this.snackBar.open(
      `Press 'Clear all Locations' to proceed. This CANNOT be undone. `,
      'OK',
      { duration: 6000 }
    );
  }

  resetLocations() {
    const tempItem: Partial<InventoryItem> = {
      location:'N/A',
    }
    this.inventoryService.modifyMass(tempItem,this.filteredItems()).subscribe({
      complete: () => {
        this.refreshToken.update(value => value + 1);
        this.snackBar.open(
          `Locations reset.`,
          'OK',
          { duration: 6000 }
        );
      }
    });
  }

  selectedItems = signal(new Set<string>());

  selectionToggle(id: string, event: MatCheckboxChange) {
    const updated = new Set(this.selectedItems());
    if (event.checked) {
      updated.add(id);
    } else {
      updated.delete(id);
    }
    this.selectedItems.set(updated);
  }

  isSelected(id: string): boolean {
    return this.selectedItems().has(id);
  }

  relocateSelected() {
    const newLocation = prompt("Enter new location for selected items:");
    if (newLocation !== null) {
      const tempItem: Partial<InventoryItem> = { location:newLocation };
      this.inventoryService.modifyMass(tempItem, this.filteredItems().filter(item => this.selectedItems().has(item._id))).subscribe({
        complete: () => {
          this.selectedItems.set(new Set());
          this.refreshToken.update(value => value + 1);
          this.snackBar.open(
            `Selected items updated.`,
            'OK',
            { duration: 6000 }
          );
        }
      });
    }
  }

  resetInventory() {
    const warning = confirm("This will delete ALL items. Are you sure?");
    if (warning == true) {
      this.inventoryService.deleteAll(this.filteredItems());
      this.snackBar.open(
        `Inventory reset. Please wait for page to reload...`,
        'OK',
        { duration: 6000 }
      );
      this.inventoryService.reloadPage();
    }
  }

  adjustStock(item: InventoryItem, delta: number) {
    const newStocked = (item.stocked ?? 0) + delta;
    let updatedItem: Partial<InventoryItem>;

    if (newStocked < 0) {
      updatedItem = {
        ...item,
        stocked: 0
      };
    } else {
      updatedItem = {
        ...item,
        stocked: newStocked
      };
    }

    this.inventoryService.updateItem(updatedItem).subscribe(() => {
      this.refreshToken.update(value => value + 1);
    });
  }

  handleStockButtonClick(event: MouseEvent, item: InventoryItem, delta: number) {
    // Buttons are nested inside a router link; block the link navigation.
    event.preventDefault();
    event.stopPropagation();
    this.adjustStock(item, delta);
  }

}


