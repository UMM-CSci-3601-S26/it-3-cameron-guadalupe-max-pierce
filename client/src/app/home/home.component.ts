import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import {MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
@Component({
  selector: 'app-home-component',
  templateUrl: 'home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [],
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule
  ]
})
export class HomeComponent implements OnInit {
  studentCount: number = 0;
  stockCount: number = 0;
  lowStockAlert: boolean = false;

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    // Simulate loading initial data
    this.studentCount = 25;
    this.stockCount = 10;
    this.lowStockAlert = false;

  checkStockStatus(): void {
    this.lowStockAlert = this.stockCount < 5;
  }

  viewInventory(): void {
    console.log('Navigating to Inventory Page...');
  }

  manageStudents(): void {
    console.log('Navigating to Students List Page...');
  }

}
