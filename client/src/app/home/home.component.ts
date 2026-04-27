import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NavigationEnd, Router } from '@angular/router';
import { InventoryService} from '../inventory/inventory.service';
import { InventoryItem } from '../inventory/inventory_item';
import { FamilyService } from '../families/family.service';
import { GradeListService } from '../grade_list/grade_list.service';
import { RequiredItem } from '../grade_list/required_item';
import { Family } from '../families/family';
import { filter } from 'rxjs/internal/operators/filter';@Component({
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
  private familyService = inject(FamilyService);
  private gradeListService = inject(GradeListService);
  familyCount = 0;
  inventoryCount = 0;

  lowStockAlert = false;
  lowStockItems: InventoryItem[] = [];


  ngOnInit(): void {
    this.loadData();
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.loadData();
      });
  }

  private loadData(): void {


    this.inventoryService.getInventory().subscribe((items: InventoryItem[]) => {
      this.inventoryCount = items.length;
      this.lowStockItems = items.filter(i => i.stocked < 5);
      this.lowStockAlert = this.lowStockItems.length > 0;
    });
    this.familyService.getFamilies().subscribe((families: Family[]) => {
      this.familyCount = families.length;
    });
  }

  dismissAlert(): void {
    this.lowStockAlert = false;
  }

  viewInventory(): void {
    console.log('Navigating to Inventory Page...');
    this.router.navigate(['/inventory']);

  }

  viewFamilies(): void {
    console.log('Navigating to Families List Page...');
    this.router.navigate(['/families']);
  }

  viewShoppingList(): void {
    console.log('Navigating to Shopping List Page..');
    this.router.navigate(['/shopping-list']);
  }

  viewSettings(): void {
    console.log('Navigating to Settings Page...');
    this.router.navigate(['/settings']);
  }

  viewGradeReq():  void {
    console.log('Navigating to Grade Requirements Page...');
    this.router.navigate(['/grade_list']);
  }
}


