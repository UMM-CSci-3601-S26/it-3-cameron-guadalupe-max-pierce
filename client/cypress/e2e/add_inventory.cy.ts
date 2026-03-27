import { InventoryItem } from '../../src/app/inventory/inventory_item';
import { AddItemPage } from '../support/add_inventory.po';

describe('Add item', () => {
  const page = new AddItemPage();

  beforeEach(() => {
    page.navigateTo();
  });

  it('Should have the correct title', () => {
    page.getTitle().should('have.text', 'New Item');
  });

  it('Should enable and disable the add item button', () => {
    // ADD Item button should be disabled until name, stocked, and type are filled.
    // (location has a default value of "N/A")
    page.addItemButton().should('be.disabled');
    page.getFormField('name').type('Yellow Pencils 12-Pack', { delay: 10 });
    cy.wait(100);
    page.addItemButton().should('be.disabled');
    page.getFormField('stocked').type('5', { delay: 10 });
    cy.wait(100);
    page.addItemButton().should('be.disabled');
    page.getFormField('type').type('pencils', { delay: 10 });
    cy.wait(100);
    page.addItemButton().should('be.enabled');
  });

  it('Should show error messages for invalid inputs', () => {
    // Test button disabled state based on form validation
    page.getFormField('name').type('a', { delay: 10 }).clear().blur();
    cy.wait(150);
    page.addItemButton().should('be.disabled');
    page.getFormField('name').type('J', { delay: 10 }).blur();
    cy.wait(150);
    page.addItemButton().should('be.disabled');
    page.getFormField('name').clear().type('A very long item name that exceeds fifty characters for testing', { delay: 5 }).blur();
    cy.wait(150);
    page.addItemButton().should('be.disabled');
    page.getFormField('name').clear().type('Yellow Pencils 12-Pack', { delay: 10 }).blur();
    cy.wait(150);

    // Stocked field with valid name filled
    page.getFormField('stocked').type('a', { delay: 10 }).clear().blur();
    cy.wait(150);
    page.addItemButton().should('be.disabled');
    page.getFormField('stocked').type('-5', { delay: 10 }).blur();
    cy.wait(150);
    page.addItemButton().should('be.disabled');
    page.getFormField('stocked').clear().type('abc', { delay: 10 }).blur();
    cy.wait(150);
    page.addItemButton().should('be.disabled');
    page.getFormField('stocked').clear().type('5', { delay: 10 }).blur();
    cy.wait(150);
    // Now add remaining required fields
    page.getFormField('type').type('pencils', { delay: 10 });
    cy.wait(150);
    page.getFormField('location').type('tote #1', { delay: 10 });
    cy.wait(150);
    // Button should now be enabled since all fields are valid
    page.addItemButton().should('be.enabled');
  });

  describe('Adding a new item', () => {
    beforeEach(() => {
      cy.task('seed:database');
    });

    it('Should go to the right page, and have the right info', () => {
      const item: InventoryItem = {
        _id: null,
        name: 'Red Folders',
        type: 'folders',
        desc: 'Red plastic folders, GreatValue',
        location: 'Tote #2',
        stocked: 3,
      };

      cy.intercept('POST', '/api/inventory').as('addItem');
      page.addItem(item);
      cy.wait('@addItem', { timeout: 10000 });

      // Wait a bit for navigation to complete
      cy.wait(1000);

      // Verify we navigated away from the /inventory/new page
      cy.url().should('not.match', /\/inventory\/new$/);
    });

    it('Should fail with no location', () => {
      const item: InventoryItem = {
        _id: null,
        name: 'Bad Item',
        type: 'erasers',
        location: null, // The company being set to null means nothing will be typed for it
        desc: 'missing location',
        stocked: 5,
      };

      // Fill the form but leave location empty
      page.getFormField('name').type(item.name, { delay: 10 });
      cy.wait(100);
      page.getFormField('stocked').type(item.stocked.toString(), { delay: 10 });
      cy.wait(100);
      page.getFormField('type').type(item.type, { delay: 10 });
      cy.wait(100);
      page.getFormField('desc').type(item.desc, { delay: 10 });
      cy.wait(100);

      // Button should be enabled even without location
      page.addItemButton().should('be.enabled');

      // We should have stayed on the new item page
      cy.url().should('match', /\/inventory\/new$/);

      // The things we entered in the form should still be there
      page.getFormField('name').should('have.value', item.name);
      page.getFormField('desc').should('have.value', item.desc);
      page.getFormField('stocked').should('have.value', item.stocked.toString());
    });
  });
});
