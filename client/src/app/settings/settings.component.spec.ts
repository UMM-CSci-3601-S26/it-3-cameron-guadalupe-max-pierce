import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';

import { SettingsComponent } from './settings.component';
import { SettingsService } from './settings.service';
import { AppSettings } from './settings';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;
  let settingsServiceSpy: jasmine.SpyObj<SettingsService>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

  const mockSettings: AppSettings = {
    schools: [],
    itemTypes: [
      { value: 'pencils', label: 'Pencils' },
    ],
    timeAvailability: {
      earlyMorning: '',
      lateMorning: '',
      earlyAfternoon: '',
      lateAfternoon: '',
    },
  };

  beforeEach(async () => {
    settingsServiceSpy = jasmine.createSpyObj('SettingsService', [
      'getSettings',
      'updateSchools',
      'updateTimeAvailability',
      'updateItemTypes',
    ]);
    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    settingsServiceSpy.getSettings.and.returnValue(of(mockSettings));
    settingsServiceSpy.updateSchools.and.returnValue(of(undefined));
    settingsServiceSpy.updateTimeAvailability.and.returnValue(of(undefined));
    settingsServiceSpy.updateItemTypes.and.returnValue(of(undefined));

    await TestBed.configureTestingModule({
      imports: [SettingsComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: SettingsService, useValue: settingsServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads schools and time availability on init', () => {
    expect(settingsServiceSpy.getSettings).toHaveBeenCalled();
    expect(component.schools).toEqual([
      { name: 'Morris Area High School', abbreviation: 'MAHS' }
    ]);
    expect(component.timeAvailabilityForm.value).toEqual({
      earlyMorning: '',
      lateMorning: '',
      earlyAfternoon: '',
      lateAfternoon: '',
    });
  });

  it('addSchool adds school to list and calls updateSchools', () => {
    settingsServiceSpy.updateSchools.and.returnValue(of(undefined));
    component.addSchoolForm.setValue({ name: 'Test School', abbreviation: 'TS' });

    component.addSchool();

    expect(settingsServiceSpy.updateSchools).toHaveBeenCalledWith([
      { name: 'Morris Area High School', abbreviation: 'MAHS' },
      { name: 'Test School', abbreviation: 'TS' }
    ]);
    expect(component.addSchoolForm.value.name).toBeNull(); // form is reset
    expect(component.addSchoolForm.value.abbreviation).toBeNull(); // form is reset
  });

  it('addSchool uppercases abbreviation before saving', () => {
    settingsServiceSpy.updateSchools.and.returnValue(of(undefined));
    component.addSchoolForm.setValue({ name: 'Test School', abbreviation: 'ts' });

    component.addSchool();

    expect(settingsServiceSpy.updateSchools).toHaveBeenCalledWith([
      { name: 'Morris Area High School', abbreviation: 'MAHS' },
      { name: 'Test School', abbreviation: 'TS' }
    ]);
  });

  it('addSchool does nothing when form is invalid', () => {
    settingsServiceSpy.updateSchools.and.returnValue(of(undefined));
    component.addSchoolForm.setValue({ name: 'A', abbreviation: 'TS' }); // name too short

    component.addSchool();

    expect(settingsServiceSpy.updateSchools).toHaveBeenCalledTimes(1);
  });

  it('addSchool shows success snack bar on success', () => {
    settingsServiceSpy.updateSchools.and.returnValue(of(undefined));
    component.addSchoolForm.setValue({ name: 'Test School', abbreviation: 'TS' });

    component.addSchool();

    expect(snackBarSpy.open).toHaveBeenCalledWith('Schools saved', 'OK', { duration: 2000 });
  });

  it('addSchool shows error snack bar on failure', () => {
    settingsServiceSpy.updateSchools.and.returnValue(throwError(() => new Error('fail')));
    component.addSchoolForm.setValue({ name: 'Test School', abbreviation: 'TS' });

    component.addSchool();

    expect(snackBarSpy.open).toHaveBeenCalledWith('Failed to save schools', 'OK', { duration: 3000 });
  });

  it('removeSchool removes school at given index and calls updateSchools', () => {
    settingsServiceSpy.updateSchools.and.returnValue(of(undefined));
    component.schools = [
      { name: 'School A', abbreviation: 'SA' },
      { name: 'School B', abbreviation: 'SB' }
    ];

    component.removeSchool(0);

    expect(component.schools).toEqual([{ name: 'School B', abbreviation: 'SB' }]);
    expect(settingsServiceSpy.updateSchools).toHaveBeenCalledWith([{ name: 'School B', abbreviation: 'SB' }]);
  });

  it('removeSchool shows error snack bar on failure', () => {
    settingsServiceSpy.updateSchools.and.returnValue(throwError(() => new Error('fail')));
    component.schools = [{ name: 'School A', abbreviation: 'SA' }];

    component.removeSchool(0);

    expect(snackBarSpy.open).toHaveBeenCalledWith('Failed to save schools', 'OK', { duration: 3000 });
  });

  it('addItemType adds type and calls updateItemTypes', () => {
    component.addItemTypeForm.setValue({ value: 'markers', label: 'Markers' });

    component.addItemType();

    expect(settingsServiceSpy.updateItemTypes).toHaveBeenCalledWith([
      { value: 'pencils', label: 'Pencils' },
      { value: 'markers', label: 'Markers' }
    ]);
  });

  it('removeItemType removes type and calls updateItemTypes', () => {
    component.itemTypes = [
      { value: 'pencils', label: 'Pencils' },
      { value: 'markers', label: 'Markers' }
    ];

    component.removeItemType(0);

    expect(settingsServiceSpy.updateItemTypes).toHaveBeenCalledWith([
      { value: 'markers', label: 'Markers' }
    ]);
  });

  it('saveTimeAvailability calls updateTimeAvailability and shows success snack bar', () => {
    settingsServiceSpy.updateTimeAvailability.and.returnValue(of(undefined));
    component.timeAvailabilityForm.setValue({
      earlyMorning: '8:00 AM',
      lateMorning: '10:00 AM',
      earlyAfternoon: '12:00 PM',
      lateAfternoon: '2:00 PM',
    });

    component.saveTimeAvailability();

    expect(settingsServiceSpy.updateTimeAvailability).toHaveBeenCalledWith({
      earlyMorning: '8:00 AM',
      lateMorning: '10:00 AM',
      earlyAfternoon: '12:00 PM',
      lateAfternoon: '2:00 PM',
    });
    expect(snackBarSpy.open).toHaveBeenCalledWith('Time windows saved', 'OK', { duration: 2000 });
  });

  it('saveTimeAvailability shows error snack bar on failure', () => {
    settingsServiceSpy.updateTimeAvailability.and.returnValue(throwError(() => new Error('fail')));
    component.timeAvailabilityForm.setValue({
      earlyMorning: '8:00 AM',
      lateMorning: '10:00 AM',
      earlyAfternoon: '12:00 PM',
      lateAfternoon: '2:00 PM',
    });

    component.saveTimeAvailability();

    expect(snackBarSpy.open).toHaveBeenCalledWith('Failed to save time windows', 'OK', { duration: 3000 });
  });

  it('saveTimeAvailability does nothing when form is invalid', () => {
    settingsServiceSpy.updateTimeAvailability.and.returnValue(of(undefined));
    component.timeAvailabilityForm.setValue({
      earlyMorning: '',
      lateMorning: '',
      earlyAfternoon: '',
      lateAfternoon: '',
    });

    component.saveTimeAvailability();

    expect(settingsServiceSpy.updateTimeAvailability).not.toHaveBeenCalled();
  });
});
