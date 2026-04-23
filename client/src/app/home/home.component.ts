import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import {MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
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

  studentCount: number = 150;
  stockCount: number = 5;
  lowStockAlert: boolean = false;


  ngOnInit(): void {
    this.lowStockAlert = this.stockCount < 10;
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


