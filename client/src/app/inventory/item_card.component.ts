import { Component, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { RouterLink } from '@angular/router';
import { InventoryItem } from './inventory_item';

@Component({
  selector: 'app-item-card',
  templateUrl: './item_card.component.html',
  styleUrls: ['./item_card.component.scss'],
  imports: [MatCardModule, MatButtonModule, MatListModule, MatIconModule, RouterLink]
})
export class ItemCardComponent {

  item = input.required<InventoryItem>();
  simple = input(false);
}
