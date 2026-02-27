import { Component, computed, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
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
//import { InventoryCardComponent } from './inventory_card.component';
import { InventoryService } from './inventory.service';
import { toSignal } from '@angular/core/rxjs-interop';

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
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatSelectModule,
    MatOptionModule,
    MatRadioModule,
    //InventoryCardComponent,
    MatListModule,
    RouterLink,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule
  ],
})
export class InventoryListComponent {
  private inventoryService = inject(InventoryService);
  // snackBar the `MatSnackBar` used to display feedback
  private snackBar = inject(MatSnackBar);

  itemName = signal<string|undefined>(undefined);
  itemStock = signal<number|undefined>(undefined);
  itemDesc = signal<string|undefined>(undefined);
  itemLocation = signal<string|undefined>(undefined);
  itemType = signal<string|undefined>(undefined);

  errMsg = signal<string | undefined>(undefined);

  //Unessesary, we are no longer contacting the server for filtering; only for getting items.
  serverFilteredItems =
    toSignal(
      combineLatest([]).pipe( //Not actually doing any filtering on the server, just need to get Items.
        switchMap(() =>
          this.inventoryService.getItems({})
        ),
        catchError((err) => {
          if (!(err.error instanceof ErrorEvent)) {
            this.errMsg.set(
              `Problem contacting the server – Error Code: ${err.status}\nMessage: ${err.message}`
            );
          }
          this.snackBar.open(this.errMsg(), 'OK', { duration: 6000 });
          return of<InventoryItem[]>([]);
        }),
        tap(() => {
        })
      )
    );

  filteredItems = computed(() => {
    const currentItems = this.serverFilteredItems();
    return this.inventoryService.filterItems(currentItems, {
      name: this.itemName(),
      type: this.itemType(),
      stocked: this.itemStock(),
      desc: this.itemDesc(),
      location: this.itemLocation()
      // company: this.userCompany(),
    });
  });
}
