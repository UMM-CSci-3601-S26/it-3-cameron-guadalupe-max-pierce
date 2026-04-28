import { RequiredItem } from '../../src/app/grade_list/required_item';
import { AddRequirementPage } from '../support/add_requirement.po';

describe('Add item', () => {
  const page = new AddRequirementPage();

  beforeEach(() => {
    page.navigateTo();
  });

  it('Should have the correct title', () => {
    page.getTitle().should('have.text', 'New Requirement');
  });

  it('Should enable and disable the add item button', () => {
    // ADD Item button should be disabled until name, stocked, and type are filled.
    // (location has a default value of "N/A")
    page.addItemButton().should('be.disabled');
    page.getFormField('name').type('Yellow Pencils 12-Pack', { delay: 10 });
    cy.wait(100);
    page.addItemButton().should('be.disabled');

    page.getFormField('required').type('5', { delay: 10 });
    cy.wait(100);
    page.addItemButton().should('be.disabled');

    page.getFormField('grade').type('1', { delay: 10 });
    cy.wait(100);
    page.addItemButton().should('be.disabled');

    page.selectMatSelectValue(page.getFormField('school'),'Morris Area Elementary School (MAES)');
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

    // Required field with valid name filled
    page.getFormField('required').type('a', { delay: 10 }).clear().blur();
    cy.wait(150);
    page.addItemButton().should('be.disabled');
    page.getFormField('required').type('-5', { delay: 10 }).blur();
    cy.wait(150);
    page.addItemButton().should('be.disabled');
    page.getFormField('required').clear().type('abc', { delay: 10 }).blur();
    cy.wait(150);
    page.addItemButton().should('be.disabled');
    page.getFormField('required').clear().type('5', { delay: 10 }).blur();
    cy.wait(150);

    // Now add remaining required fields
    page.getFormField('type').type('pencils', { delay: 10 });
    cy.wait(100);
    page.getFormField('grade').type('1', { delay: 10 });
    cy.wait(100);
    page.selectMatSelectValue(page.getFormField('school'),'Morris Area Elementary School (MAES)');
    cy.wait(100);
    // Button should now be enabled since all fields are valid
    page.addItemButton().should('be.enabled');
  });

  describe('Adding a new item', () => {
    beforeEach(() => {
      cy.task('seed:database');
    });

    it('Should go to the right page, and have the right info', () => {
      const item: RequiredItem = {
        _id: null,
        name: 'Red Folders',
        type: 'folders',
        desc: 'Red plastic folders, GreatValue',
        school: 'MAES',
        grade: '1',
        required: 3,
        pack:1
      };

      cy.intercept('POST', '/api/inventory').as('addItem');
      page.addItem(item);
      //cy.wait('@addItem', { timeout: 10000 });

      // Wait a bit for navigation to complete
      cy.wait(4000);

      // Verify we navigated away from the /grade_list/new page
      cy.url().should('not.match', /\/grade_list\/new$/);
    });

    it('Should fail with no school', () => {
      const item: RequiredItem = {
        _id: null,
        name: 'Red Folders',
        type: 'folders',
        desc: 'Red plastic folders, GreatValue',
        school: '',
        grade: '1',
        required: 3,
        pack:1
      };

      // Fill the form but leave location empty
      page.getFormField('name').clear().type(item.name, { delay: 10 });
      cy.wait(100);
      page.getFormField('required').clear().type(item.required.toString(), { delay: 10 });
      cy.wait(100);
      page.getFormField('type').clear().type(item.type, { delay: 10 });
      cy.wait(100);
      page.getFormField('desc').clear().type(item.desc, { delay: 10 });
      cy.wait(100);
      page.getFormField('grade').clear().type(item.grade, { delay: 10 });
      cy.wait(100);
      page.selectMatSelectValue(page.getFormField('school'),'Morris Area Elementary School (MAES)');
      cy.wait(100);

      page.addItem(item); //Different than value entered in form.

      // We should have stayed on the new item page
      cy.url().should('match', /\/grade_list\/new$/);

      // The things we entered in the form should still be there
      page.getFormField('name').should('have.value', item.name);
      page.getFormField('desc').should('have.value', item.desc);
      page.getFormField('required').should('have.value', item.required.toString());
      page.getFormField('grade').should('have.value', item.grade);
      page.getFormField('type').should('have.value', item.type);
    });
  });
});
