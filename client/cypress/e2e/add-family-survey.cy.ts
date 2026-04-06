describe('Backpack Need Survey', () => {
  beforeEach(() => {
    cy.visit('/add-family-survey'); // adjust route to your component
  });

  it('fills out the survey form and submits', () => {
    // Family info
    cy.get('input[name="familyLastName"]').type('Smith');
    cy.get('input[name="parentEmail"]').type('parent@example.com');

    // First child
    cy.get('input[name="childFirstName0"]').type('John');
    cy.get('input[name="childLastName0"]').type('Smith');
    cy.get('input[name="school0"]').type('Lincoln Elementary');
    cy.get('mat-select[name="grade0"]').click();
    cy.get('mat-option').contains('3').click();
    cy.get('mat-radio-button[value="yes"]').click();

    // Add second child
    cy.contains('Add Another Child').click();
    cy.get('input[name="childFirstName1"]').type('Emma');
    cy.get('input[name="childLastName1"]').type('Smith');
    cy.get('input[name="school1"]').type('Lincoln Elementary');
    cy.get('mat-select[name="grade1"]').click();
    cy.get('mat-option').contains('1').click();
    cy.get('mat-radio-button[value="no"]').last().click();

    // Submit
    cy.get('button[type="submit"]').click();

    // Confirm form reset
    cy.get('input[name="familyLastName"]').should('have.value', '');
    cy.get('input[name="parentEmail"]').should('have.value', '');
  });

  it('can add and remove a child', () => {
    cy.contains('Add Another Child').click();
    cy.get('.child-form').should('have.length', 2);
    cy.get('.child-form button').contains('Remove Child').last().click();
    cy.get('.child-form').should('have.length', 1);
  });
});
