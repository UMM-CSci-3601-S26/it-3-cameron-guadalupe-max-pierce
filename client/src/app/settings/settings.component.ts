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
import { SchoolInfo, TimeAvailabilityLabels } from './settings';

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

  // Form for setting clock-time labels for each availability slot
  timeAvailabilityForm = new FormGroup({
    earlyMorning: new FormControl('', Validators.required),
    lateMorning: new FormControl('', Validators.required),
    earlyAfternoon: new FormControl('', Validators.required),
    lateAfternoon: new FormControl('', Validators.required),
  });

  ngOnInit(): void {
    this.settingsService.getSettings().subscribe(settings => {
      this.schools = settings.schools ?? [];
      if (settings.timeAvailability) {
        this.timeAvailabilityForm.patchValue(settings.timeAvailability);
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

  private saveSchools(): void {
    this.settingsService.updateSchools(this.schools).subscribe({
      next: () => this.snackBar.open('Schools saved', 'OK', { duration: 2000 }),
      error: () => this.snackBar.open('Failed to save schools', 'OK', { duration: 3000 })
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
