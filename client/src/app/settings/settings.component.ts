// Angular and Material Imports
import { Component, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { CommonModule } from '@angular/common';

// Settings Service and Type Imports
import { SettingsService } from './settings.service';
import { SchoolInfo, TimeAvailabilityLabels, ItemType } from './settings';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
  ]
})
export class SettingsComponent implements OnInit {
  private settingsService = inject(SettingsService);
  private snackBar = inject(MatSnackBar);

  schools: SchoolInfo[] = [];
  itemTypes: ItemType[] = [];

  // Default item types (legacy hardcoded values for backward compatibility)
  private readonly DEFAULT_ITEM_TYPES: ItemType[] = [
    { value: 'pencils', label: 'Pencils' },
    { value: 'colored_pencils', label: 'Colored Pencils' },
    { value: 'sharpeners', label: 'Sharpeners' },
    { value: 'markers', label: 'Markers' },
    { value: 'highlighters', label: 'Highlighters' },
    { value: 'dry_erase_markers', label: 'Dry-Erase Markers' },
    { value: 'crayons', label: 'Crayons' },
    { value: 'pens', label: 'Pens' },
    { value: 'erasers', label: 'Erasers' },
    { value: 'folders', label: 'Folders' },
    { value: 'binders', label: 'Binders' },
    { value: 'notebooks', label: 'Notebooks' },
    { value: 'glue', label: 'Glue' },
    { value: 'rulers', label: 'Rulers' },
    { value: 'scissors', label: 'Scissors' },
    { value: 'headphones', label: 'Headphones' },
    { value: 'backpacks', label: 'Backpacks' },
    { value: 'boxes', label: 'Boxes' },
    { value: 'other', label: 'Other' }
  ];

  // Default schools (legacy seed data for backward compatibility)
  private readonly DEFAULT_SCHOOLS: SchoolInfo[] = [
    { name: 'Morris Area High School', abbreviation: 'MAHS' }
  ];

  // Form for adding a new school entry
  addSchoolForm = new FormGroup({
    name: new FormControl('', Validators.compose([
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(100),
    ])),
    abbreviation: new FormControl('', Validators.compose([
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(10),
      Validators.pattern('^[A-Za-z0-9-]+$')
    ]))
  });

  // Form for adding a new item type entry
  addItemTypeForm = new FormGroup({
    value: new FormControl('', Validators.compose([
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(50),
      Validators.pattern('^[a-z_]+$')
    ])),
    label: new FormControl('', Validators.compose([
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(100),
    ]))
  });

  // Form for setting clock-time labels for each availability slot
  timeAvailabilityForm = new FormGroup({
    earlyMorning: new FormControl('', Validators.required),
    lateMorning: new FormControl('', Validators.required),
    earlyAfternoon: new FormControl('', Validators.required),
    lateAfternoon: new FormControl('', Validators.required),
  });

  ngOnInit(): void {
    this.settingsService.getSettings().subscribe(settings => {
      // Use defaults if settings fields are empty or undefined
      this.schools = (settings.schools && settings.schools.length > 0)
        ? settings.schools
        : this.DEFAULT_SCHOOLS;

      this.itemTypes = (settings.itemTypes && settings.itemTypes.length > 0)
        ? settings.itemTypes
        : this.DEFAULT_ITEM_TYPES;

      if (settings.timeAvailability) {
        this.timeAvailabilityForm.patchValue(settings.timeAvailability);
      }

      // If using defaults, save them to the server
      if (!settings.schools || settings.schools.length === 0) {
        this.saveSchools();
      }
      if (!settings.itemTypes || settings.itemTypes.length === 0) {
        this.saveItemTypes();
      }
    });
  }

  addSchool(): void {
    if (this.addSchoolForm.valid) {
      const name = this.addSchoolForm.value.name!.trim();
      const abbreviation = this.addSchoolForm.value.abbreviation!.trim().toUpperCase();
      this.schools = [...this.schools, { name, abbreviation }];
      this.saveSchools();
      this.addSchoolForm.reset();
    }
  }

  removeSchool(index: number): void {
    this.schools = this.schools.filter((_, i) => i !== index);
    this.saveSchools();
  }

  addItemType(): void {
    if (this.addItemTypeForm.valid) {
      const value = this.addItemTypeForm.value.value!.trim().toLowerCase();
      const label = this.addItemTypeForm.value.label!.trim();
      this.itemTypes = [...this.itemTypes, { value, label }];
      this.saveItemTypes();
      this.addItemTypeForm.reset();
    }
  }

  removeItemType(index: number): void {
    this.itemTypes = this.itemTypes.filter((_, i) => i !== index);
    this.saveItemTypes();
  }

  private saveSchools(): void {
    this.settingsService.updateSchools(this.schools).subscribe({
      next: () => this.snackBar.open('Schools saved', 'OK', { duration: 2000 }),
      error: () => this.snackBar.open('Failed to save schools', 'OK', { duration: 3000 })
    });
  }

  private saveItemTypes(): void {
    this.settingsService.updateItemTypes(this.itemTypes).subscribe({
      next: () => this.snackBar.open('Item types saved', 'OK', { duration: 2000 }),
      error: () => this.snackBar.open('Failed to save item types', 'OK', { duration: 3000 })
    });
  }

  saveTimeAvailability(): void {
    if (this.timeAvailabilityForm.valid) {
      this.settingsService.updateTimeAvailability(
        this.timeAvailabilityForm.value as TimeAvailabilityLabels
      ).subscribe({
        next: () => this.snackBar.open('Time windows saved', 'OK', { duration: 2000 }),
        error: () => this.snackBar.open('Failed to save time windows', 'OK', { duration: 3000 })
      });
    }
  }
}
