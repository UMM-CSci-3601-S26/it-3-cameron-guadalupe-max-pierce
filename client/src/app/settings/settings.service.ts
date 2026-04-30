// Angular Imports
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

// RxJS Imports
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Environment and Settings Interface Imports
import { environment } from '../../environments/environment';
import { AppSettings, SchoolInfo, TimeAvailabilityLabels, ItemType } from './settings';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private httpClient = inject(HttpClient);

  private readonly DEFAULT_SCHOOLS: SchoolInfo[] = [
    { name: 'Morris Area High School', abbreviation: 'MAHS' }
  ];

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

  readonly settingsUrl: string = `${environment.apiUrl}settings`;

  // Returns the full settings document (schools + time availability labels)
  getSettings(): Observable<AppSettings> {
    return this.httpClient.get<AppSettings>(this.settingsUrl).pipe(
      map((settings) => ({
        ...settings,
        schools: settings.schools?.length ? settings.schools : this.DEFAULT_SCHOOLS,
        itemTypes: settings.itemTypes?.length ? settings.itemTypes : this.DEFAULT_ITEM_TYPES,
      }))
    );
  }

  // Replaces the schools list. Only touches the schools field on the server.
  updateSchools(schools: SchoolInfo[]): Observable<void> {
    return this.httpClient.patch<void>(`${this.settingsUrl}/schools`, { schools });
  }

  // Replaces the time availability labels. Only touches the timeAvailability field.
  updateTimeAvailability(labels: TimeAvailabilityLabels): Observable<void> {
    return this.httpClient.patch<void>(`${this.settingsUrl}/timeAvailability`, labels);
  }

  // Replaces the item types list. Only touches the itemTypes field.
  updateItemTypes(itemTypes: ItemType[]): Observable<void> {
    return this.httpClient.patch<void>(`${this.settingsUrl}/itemTypes`, { itemTypes });
  }
}
