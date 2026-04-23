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

describe('Home', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let de: DebugElement;
  let el: HTMLElement;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HomeComponent,
        NoopAnimationsModule,
        MatCardModule,
        MatIconModule,
        MatButtonModule,
        RouterTestingModule
      ],
    });

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance; // BannerComponent test instance
    fixture.detectChanges();

    // query for the link (<a> tag) by CSS element selector
    de = fixture.debugElement.query(By.css('.home-card'));
    expect(de).toBeTruthy();
    el = de.nativeElement;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance; // HomeComponent Test Instance
    de = fixture.debugElement.query(By.css('.home-card'))
  });

  it('It has the basic home page text', () => {
    fixture.detectChanges();
    expect(el.textContent).toContain('Welcome to Ready 4 Learning HomePage! this dashboard provides real time updates on the system status, key metrics, and Student Engagement.');
    expect(component).toBeTruthy();
  });

  it('It has the basic home page subtitle', () => {
    fixture.detectChanges();
    expect(el.textContent).toContain("Operational DashBoard Overview");
    expect(component).toBeTruthy();
  });

  it('It has the basic home page content', () => {
    fixture.detectChanges();
    expect(el.textContent).toContain("This is the content for the home page.");
    expect(component).toBeTruthy();
  });

  it('the home page should have a mat-card element', () => {
    fixture.detectChanges();
    const matCardElement = de.query(predicate => predicate.name === 'MatCard');
    expect(matCardElement).toBeTruthy();
  });

  it('The home page should have a mat-card-header element', () => {
    fixture.detectChanges();
    const matCardHeaderElement = de.query(predicate => predicate.name === 'MatCardHeader');
    expect(matCardHeaderElement).toBeTruthy();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should display the Big Company Title "Ready 4 Learning"', () => {
    const titleElement = fixture.debugElement.query(By.css('.hero-header h1')).nativeElement;
    expect(titleElement.textContent).toContain('Ready 4 Learning');
  });

  it('should display the correct subtitle in the header', () => {
    const subtitle = fixture.debugElement.query(By.css('.hero-header p')).nativeElement;
    expect(subtitle.textContent).toContain('Homepage');
  });

  it('should display the student count from the component', () => {
    // Manually set a value to test data binding
    component.studentCount = 25;
    fixture.detectChanges();

    const studentValue = fixture.debugElement.query(By.css('.students .value')).nativeElement;
    expect(studentValue.textContent).toContain('25');
  });


  it('should show "Low Stock Alert" when lowStockAlert is true', () => {
    component.lowStockAlert = true;
    fixture.detectChanges();

    const statusText = fixture.debugElement.query(By.css('.status-text')).nativeElement;
    expect(statusText.textContent).toContain('Low Stock Alert');
  });

  it('should have the "System Overview" section with correct text', () => {
    const infoSection = fixture.debugElement.query(By.css('.general-info p')).nativeElement;
    expect(infoSection.textContent).toContain('Welcome to Ready 4 Learning HomePage!');
  });

  it('should have functional action buttons', () => {
    const buttons = fixture.debugElement.queryAll(By.css('button[mat-raised-button]'));
    expect(buttons.length).toBe(2);
    expect(buttons[0].nativeElement.textContent).toContain('View Inventory');
    expect(buttons[1].nativeElement.textContent).toContain('Manage Students');
  });


  it('should navigate to inventory page when "View Inventory" button is clicked', () => {
    const spy = spyOn(router, 'navigate');

    const viewInventoryButton = fixture.debugElement.query(By.css('button[color="primary"]')).nativeElement;
    viewInventoryButton.click();

    expect(spy).toHaveBeenCalledWith(['/inventory']);
  });

  it('should navigate to students page when "Manage Students" button is clicked', () => {
    const spy = spyOn(router, 'navigate');

    const manageStudentsButton = fixture.debugElement.query(By.css('button[color="accent"]')).nativeElement;
    manageStudentsButton.click();

    expect(spy).toHaveBeenCalledWith(['/students']);
  });
});



