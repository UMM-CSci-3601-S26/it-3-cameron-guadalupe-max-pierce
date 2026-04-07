import { ItemListPage } from '../support/inventory_list.po';

const page = new ItemListPage();

describe('Item list', () => {

  before(() => {
    cy.task('seed:database');
  });

  beforeEach(() => {
    page.navigateTo();
  });

  it('Should have the correct title', () => {
    page.getItemTitle().should('have.text', 'INVENTORY');
  });

  it('Should show items in list view', () => {
    page.getItemListItems().should('have.length', 7);
    page.getItemCards().should('not.exist');
  });

  it('Should type something in the name filter and return one item', () => {
    cy.get('[data-test=itemNameInput]').clear().type('Yellow Pencil');

    page.getItemListItems().should('have.length', 1);

    page.getItemListItems().first().find('.item-list-name').should('contain.text', 'Yellow Pencil');
  });

  it('Should type something in the location filter and return correct items', () => {
    cy.get('[data-test=itemLocationInput]').clear().type('Tote #1');

    page.getItemListItems().should('have.length', 1);

    page.getItemListItems().first().find('.item-list-desc').should('contain.text', 'Yellow #2 Ticonderoga pencils');
  });

  it('Should type partial in the type filter and return pencil items', () => {
    cy.get('[data-test=itemDescSelect]').clear().type('pe');

    page.getItemListItems().should('have.length', 2);

    page.getItemListItems().each(el => {
      cy.wrap(el).find('.item-list-name').should('contain.text', 'Pencils');
    });
  });

  it('Should type something in the stocked filter and return items with stock 3 or more', () => {
    cy.get('[data-test=itemStockInput]').clear().type('3');

    page.getItemListItems().should('have.length', 5);

    page.getItemListItems().find('.item-list-name')
      .should('contain.text', 'Red Folders')
      .should('contain.text', 'Green Folders')
      //.should('contain.text', 'Colored Pencils 16-Pack')
      .should('contain.text', 'Pencil Box')
      .should('contain.text', 'Paper Folders')
      .should('not.contain.text', 'Erasers 6-Pack')
      .should('not.contain.text', 'Yellow Pencils 12-Pack');
  });

  it('Should type something in the description filter and return matching items', () => {
    cy.get('[data-test=itemDescInput]').clear().type('Yellow #2');

    page.getItemListItems().should('have.length', 1);
    page.getItemListItems().first().find('.item-list-desc').should('contain.text', 'Yellow #2');
  });

  it('Should click item and go to the right URL', () => {
    page.getItemListItems().first().click();

    cy.url().should('match', /\/inventory\/[0-9a-fA-F]{24}$/);

    cy.contains('Back to Inventory', { timeout: 10000 }).should('exist');
  });

  it('Should click add item and go to the right URL', () => {
    page.addItemButton().click();

    cy.url().should(url => expect(url.endsWith('/inventory/new')).to.be.true);

    cy.get('.add-item-title').should('have.text', 'New Item');
  });

  it('Should relocate a selected item and refresh the list without manual reload', () => {
    page.clickFirstEnabledItemCheckbox().should('be.checked');

    page.relocateSelectedButton().should('be.visible');

    cy.window().then((win) => {
      cy.stub(win, 'prompt').returns('Shelf A');
    });

    page.relocateSelectedButton().click();

    page.getItemListItems().first().find('.item-list-desc').should('contain.text', 'Shelf A');
    page.relocateSelectedButton().should('not.exist');
  });

});
