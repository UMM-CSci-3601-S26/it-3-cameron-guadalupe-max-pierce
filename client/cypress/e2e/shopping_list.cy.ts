import { ShoppingListPage } from '../support/shopping_list.po';

const page = new ShoppingListPage();

describe('Shopping List', () => {

  before(() => {
    cy.task('seed:database');
  });

  beforeEach(() => {
    page.navigateTo();
  });

  it('should have the correct title', () => {
    page.getItemTitle().should('have.text', 'SHOPPING LIST');
  });

  it('should show items in the list view', () => {
    page.getItemListItems().should('exist');
  });

  it('should filter by name and return matching items', () => {
    page.getNameInput().clear().type('Pencil', {delay: 10 });
    cy.wait(300);
    page.getItemListItems().each(el => {
      cy.wrap(el).find('.item-list-name').should('contain.text', 'Pencil');
    });
  });


  it('should filter by description and return matching items', () => {
    page.getDescInput().clear().type('yellow', {delay: 10 });
    cy.wait(300);
    page.getItemListItems().each(el => {
      cy.wrap(el).find('.item-list-desc').should('contain.text', 'Yellow');
    });
  });

  it('should filter by type using autocomplete', () => {
    page.getTypeInput().clear().type('pencil', { delay: 10 });
    cy.wait(300);
    cy.get('mat-option').contains('Pencils').click();
    cy.wait(300);
    page.getItemListItems().each(el => {
      cy.wrap(el).find('.item-list-name').should('contain.text', 'Pencil');
    });
  });

  it('Should filter by school', () => {
    page.getSchoolSelect().click();
    cy.get('mat-option').contains('MAES').click();
    cy.wait(300);
    page.getItemListItems().should('exist');
  });

  it('Should reset school filter to Any School', () => {
    page.getSchoolSelect().click();
    cy.get('mat-option').contains('Any School').click();
    cy.wait(300);
    page.getItemListItems().should('exist');
  });

  it('Should filter by grade', () => {
    page.getGradeSelect().click();
    cy.get('mat-option').contains('1').click();
    cy.wait(300);
    page.getItemListItems().should('exist');
  });

  it('Should reset grade filter to All Grades', () => {
    page.getGradeSelect().click();
    cy.get('mat-option').contains('All Grades').click();
    cy.wait(300);
    page.getItemListItems().should('exist');
  });

  it('Should toggle to Ignore Inventory and show full List', () => {
    page.selectSubtractInventory(false);
    cy.wait(300);
    page.getItemListItems().should('exist');
  });

  it('Should toggle back to Subtract Inventory', () => {
    page.selectSubtractInventory(true)
    cy.wait(300);
    page.getItemListItems().should('exist');
  });

  it('Should sort by type and show sectioned list', () => {
    page.getSortBySelect().click();
    cy.get('mat-option').contains('Sort By Type').click();
    cy.wait(300);
    page.getItemListItems().should('exist');
  });

  it('Should sort by name A-Z', () => {
    page.getSortBySelect().click();
    cy.get('mat-option').contains('Sort By Name (A-Z)').click();
    cy.wait(300);
    page.getItemListItems().should('exist');
  });


  it('Should sort by name Z-A', () => {
    page.getSortBySelect().click();
    cy.get('mat-option').contains('Sort By Name (Z-A)').click();
    cy.wait(300);
    page.getItemListItems().should('exist');
  });


  it('Should sort by required quantity ascending', () => {
    page.getSortBySelect().click();
    cy.get('mat-option').contains('Sort By Required (1-9)').click();
    cy.wait(300);
    page.getItemListItems().should('exist');
  });

  it('Should sort by required quantity descending', () => {
    page.getSortBySelect().click();
    cy.get('mat-option').contains('Sort By Required (9-1)').click();
    cy.wait(300);
    page.getItemListItems().should('exist');
  });

  it('Should clear all filter and show full list', () => {
    page.getNameInput().clear();
    page.getDescInput().clear();
    page.getTypeInput().clear();
    cy.wait(300);
    page.getItemListItems().should('exist');
  });


});







