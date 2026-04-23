import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { InventoryService} from '../inventory/inventory.service';
import { InventoryItem } from '../inventory/inventory_item';
@Component({
  selector: 'app-home-component',
  templateUrl: 'home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule
  ]
})
export class HomeComponent implements OnInit {
  private router = inject(Router);
  private inventoryService = inject(InventoryService);

  studentCount: number = 150;

  lowStockAlert = false;
  lowStockItems: InventoryItem[] = [];


  ngOnInit(): void {
    this.inventoryService.inventory$.subscribe(items => {
      this.lowStockItems = items.filter(i => i.stocked < 5);
      this.lowStockAlert = this.lowStockItems.length > 0;
    });
  }

  dismissAlert(): void {
    this.lowStockAlert = false;
  }

  viewInventory(): void {
    console.log('Navigating to Inventory Page...');
    this.router.navigate(['/inventory']);

  }

  manageStudents(): void {
    console.log('Navigating to Students List Page...');
    this.router.navigate(['/students']);
  }
}


