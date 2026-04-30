import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { filter } from 'rxjs/operators';
import { MatButtonModule } from '@angular/material/button';
import { NavigationEnd, Router } from '@angular/router';
import { InventoryService} from '../inventory/inventory.service';
import { InventoryItem } from '../inventory/inventory_item';
import { FamilyService } from '../families/family.service';
import { Family } from '../families/family';
import { GradeListService } from '../grade_list/grade_list.service';
import { ShoppingListService } from '../shopping_list/shopping_list.service';
import { SettingsService } from '../settings/settings.service';
import { AppSettings } from  '../settings/settings';

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
  private familyService = inject(FamilyService);
  private gradeListService = inject(GradeListService);
  private shoppingListService = inject(ShoppingListService);
  private settingsService = inject(SettingsService);
  familyCount = 0;
  inventoryCount = 0;
  stockCount = 0;
  studentCount =0;
  schoolCount = 0;

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


    this.inventoryService.loadItems().subscribe((items: InventoryItem[]) => {
      this.inventoryCount = items.length;
      this.stockCount = items.reduce((sum, i) => sum + (i.stocked || 0), 0);
      this.lowStockItems = items.filter(i => i.stocked < 5);
      this.lowStockAlert = this.lowStockItems.length > 0;
    });
    this.familyService.getFamilies().subscribe((families: Family[]) => {
      this.familyCount = families.length;
      this.studentCount = families.reduce((sum, f) => sum + (f.students?.length || 0), 0);
    });

    this.settingsService.getSettings().subscribe((settings: AppSettings) => {
      this.schoolCount = settings.schools.length;
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
    this.router.navigate(['/shopping_list']);
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


