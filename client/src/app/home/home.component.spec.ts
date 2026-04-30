import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HomeComponent } from './home.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { InventoryService } from '../inventory/inventory.service';
import { FamilyService } from '../families/family.service';
import { SettingsService } from '../settings/settings.service';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let de: DebugElement;
  let el: HTMLElement;
  let router: Router;

  const inventoryMock = {
    loadItems: () => of([
      { stocked: 2 },
      { stocked: 10 }
    ])
  };

  const settingsMock = {
    getSettings: () => of({
      schools: [
        { name: 'School A' },
        { name: 'School B' }
      ],
      timeAvailability: {
        earlyMorning: '8:00 AM',
        lateMorning: '10:00 AM',
        earlyAfternoon: '12:00 PM',
        lateAfternoon: '2:00 PM'
      }
    })
  };

  const familyMock = {
    getFamilies: () => of([
      { _id: '1', students: [{ name: 'A'}, { name: 'B'}] },
      { _id: '2', students: [{ name: 'C'}] }
    ])
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HomeComponent,
        NoopAnimationsModule,
        MatCardModule,
        MatIconModule,
        MatButtonModule,
        HttpClientTestingModule,
        RouterTestingModule
      ],
      providers: [
        { provide: InventoryService, useValue: inventoryMock },
        { provide: FamilyService, useValue: familyMock },
        { provide: SettingsService, useValue: settingsMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();

    de = fixture.debugElement.query(By.css('.home-card'));
    expect(de).toBeTruthy();
    el = de.nativeElement;
  });


  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('has the main dashboard text', () => {
    expect(el.textContent).toContain(
      'Welcome to Ready 4 Learning HomePage! this dashboard provides real time updates on the system status, key metrics, and Student Engagement.'
    );
  });

  it('has the subtitle', () => {
    expect(el.textContent).toContain('Operational DashBoard Overview');
  });


  it('should have a mat-card element', () => {
    const matCard = fixture.debugElement.query(By.css('mat-card'));
    expect(matCard).toBeTruthy();
  });

  it('should have a mat-card-header element', () => {
    const header = fixture.debugElement.query(By.css('mat-card-header'));
    expect(header).toBeTruthy();
  });

  it('should display the correct title in the header', () => {
    const title = fixture.debugElement.query(By.css('.hero-header h1'));
    expect(title).toBeTruthy();
    expect(title.nativeElement.textContent).toContain('Ready 4 Learning');
  });

  it('should display the correct subtitle in the header', () => {
    const subtitle = fixture.debugElement.query(By.css('.hero-header p'));
    expect(subtitle).toBeTruthy();
    expect(subtitle.nativeElement.textContent).toContain('Homepage');
  });


  it('should display the family count from the component', () => {
    component.familyCount = 25;
    fixture.detectChanges();

    const value = fixture.debugElement.query(By.css('.families .value'));
    expect(value).toBeTruthy();
    expect(value.nativeElement.textContent).toContain('25');
  });


  it('should show alert when triggered', () => {
    component.lowStockAlert = true;
    fixture.detectChanges();

    const alert = fixture.debugElement.query(By.css('.alert-banner'));
    expect(alert).toBeTruthy();
    expect(alert.nativeElement.textContent.toLowerCase()).toContain('low stock');
  });


  it('should have the "System Overview" section with correct text', () => {
    const infoSection = fixture.debugElement.query(By.css('.general-info p'));
    expect(infoSection).toBeTruthy();
    expect(infoSection.nativeElement.textContent).toContain('Welcome to Ready 4 Learning HomePage!');
  });


  it('should have action buttons', () => {
    const buttons = fixture.debugElement.queryAll(By.css('button[mat-raised-button]'));
    expect(buttons.length).toBe(5);
    expect(buttons[0].nativeElement.textContent).toContain('View Inventory');
    expect(buttons[1].nativeElement.textContent).toContain('View Families');
    expect(buttons[2].nativeElement.textContent).toContain(('View Shopping List'));
    expect(buttons[3].nativeElement.textContent).toContain(('View Settings'));
    expect(buttons[4].nativeElement.textContent).toContain(('View Grade Requirements'));
  });

  it('should navigate to inventory page when "View Inventory" button is clicked', () => {
    const spy = spyOn(router, 'navigate');

    const buttons = fixture.debugElement.queryAll(By.css('button[mat-raised-button]'));
    buttons[0].nativeElement.click();

    expect(spy).toHaveBeenCalledWith(['/inventory']);
  });

  it('should navigate to families page when "View Families" button is clicked', () => {
    const spy = spyOn(router, 'navigate');

    const buttons = fixture.debugElement.queryAll(By.css('button[mat-raised-button]'));
    buttons[1].nativeElement.click();

    expect(spy).toHaveBeenCalledWith(['/families']);
  });

  it('should navigate to shopping list page when "View Shopping List" button is clicked', () => {
    const spy = spyOn(router, 'navigate');

    const buttons = fixture.debugElement.queryAll(By.css('button[mat-raised-button]'));
    buttons[2].nativeElement.click();

    expect(spy).toHaveBeenCalledWith(['/shopping_list']);
  });

  it('should navigate to settings page when "View Settings" button is clicked', () => {
    const spy = spyOn(router, 'navigate');

    const buttons = fixture.debugElement.queryAll(By.css('button[mat-raised-button]'));
    buttons[3].nativeElement.click();

    expect(spy).toHaveBeenCalledWith(['/settings']);
  });

  it('should navigate to Grade Requirements page when "View Grade Requirements" button is clicked', () => {
    const spy = spyOn(router, 'navigate');

    const buttons = fixture.debugElement.queryAll(By.css('button[mat-raised-button]'));
    buttons[4].nativeElement.click();

    expect(spy).toHaveBeenCalledWith(['/grade_list']);
  });

  it('should calculate studentCount and student count from all family students', () => {
    fixture.detectChanges();
    expect(component.studentCount).toBe(3);
  });

  it('should calculate stockCount from all inventory items', () => {
    fixture.detectChanges();
    expect(component.stockCount).toBe(12);
  });

  it('should set schoolCount from settings schools array', () => {
    fixture.detectChanges();
    expect(component.schoolCount).toBe(2);
  });
});
