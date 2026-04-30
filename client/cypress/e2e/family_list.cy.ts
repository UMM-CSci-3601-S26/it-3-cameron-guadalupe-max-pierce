import { FamilyListPage } from '../support/family_list.po';

const page = new FamilyListPage();

describe('Family list', () => {

  before(() => {
    cy.task('seed:database');
  });

  beforeEach(() => {
    page.navigateTo();
  });

  it('Should have the correct title', () => {
    page.getItemTitle().should('have.text', 'FAMILIES');
  });

  it('Should show items in list view', () => {
    page.getItemListItems().should('have.length', 12);
  });

  it('Should type something in the name filter and return one item', () => {
    cy.get('[data-test=familyNameInput]').clear().type('Richards');

    page.getItemListItems().should('have.length', 1);

    page.getItemListItems().first().find('.family-name').should('contain.text', 'Richards');
  });

  it('Should select something in the school filter and return correct items', () => {
    page.selectMatSelectValue(cy.get('[data-test=familySchoolInput]'),'MAES');

    page.getItemListItems().should('have.length', 8);
  });

  it('Should type something in the grades filter and return correct items', () => {
    cy.get('[data-test=familyGradeInput]').clear().type('1');

    page.getItemListItems().should('have.length', 2);
  });

  it('Should click family edit button and go to the right URL', () => {
    cy.get('[data-test=modifyFamilyButton]').first().click();

    cy.url().should('match', /\/families\/[0-9a-fA-F]{24}$/);

    //Not allowed for survey
    //cy.contains('Back to Family List', { timeout: 10000 }).should('exist');
  });

  it('Should click add family and go to the right URL', () => {
    page.addFamilyButton().click();

    cy.url().should(url => expect(url.endsWith('/families/survey')).to.be.true);

    cy.get('.add-item-title').should('have.text', 'FAMILY SURVEY');
  });

  it('Should display export CSV button', () => {
    page.exportCSVButton().should('be.visible');
    page.exportCSVButton().should('contain.text', 'Export CSV'); //Inconsistent with other buttons?
  });

  it('Should export all items to CSV when button is clicked', () => {
    page.exportCSVButton().first().click();

    // Verify snackbar confirmation
    // cy.contains('Families exported successfully', { timeout: 5000 }).should('be.visible');
  });

  it('Should export filtered items to CSV', () => {
    cy.get('[data-test=familyNameInput]').clear().type('Richards');
    page.getItemListItems().should('have.length', 1);

    page.exportCSVButton().first().click();

    // Verify snackbar confirmation appears
    //cy.contains('Families exported successfully', { timeout: 5000 }).should('be.visible');
  });
});
