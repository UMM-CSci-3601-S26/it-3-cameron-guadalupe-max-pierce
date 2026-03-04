import { Component, signal, inject, Signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { catchError, map, switchMap } from 'rxjs/operators';
import { ItemCardComponent } from './item_card.component';
import { InventoryService } from './inventory.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { RouterLink } from '@angular/router';
import { InventoryItem } from './inventory_item';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-inventory-item-profile',
  templateUrl: './inventory_item_profile.component.html',
  styleUrls: ['./inventory_item_profile.component.scss'],
  imports: [
    ItemCardComponent,
    MatCardModule,
    RouterLink,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule], //UserCardComponent,
})
export class InventoryItemProfileComponent {
  private route = inject(ActivatedRoute);
  private inventoryService = inject(InventoryService);

  item: Signal<InventoryItem> = toSignal(
    this.route.paramMap.pipe(
      // Map the paramMap into the id
      map((paramMap: ParamMap) => paramMap.get('id')),
      // Maps the `id` string into the Observable<InventoryItem>,
      // which will emit zero or one values depending on whether there is a
      // `Item` with that ID.
      switchMap((id: string) => this.inventoryService.getItemById(id)),
      catchError((_err) => {
        this.error.set({
          help: 'There was a problem loading the item – try again.',
          httpResponse: _err.message,
          message: _err.error?.title,
        });
        return of();
      })
      /*
       * You can uncomment the line that starts with `finalize` below to use that console message
       * as a way of verifying that this subscription is completing.
       * We removed it since we were not doing anything interesting on completion
       * and didn't want to clutter the console log
       */
      // finalize(() => console.log('We got a new user, and we are done!'))
    )
  );
  // The `error` will initially have empty strings for all its components.
  error = signal({ help: '', httpResponse: '', message: '' });
}
