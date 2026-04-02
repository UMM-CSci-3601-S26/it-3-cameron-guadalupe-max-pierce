describe('Backpack Need Survey', () => {
  it('visits survey and submits required data', () => {
    cy.visit('/families/survey');

    cy.get('[name=familyLastName]').should('be.visible').type('Smith');
    cy.get('[name=childFirstName]').type('Emma');
    cy.get('[name=school]').type('Lincoln Elementary');

    cy.get('[name=grade]').click();
    cy.get('mat-option').contains('4').click();

    cy.get('mat-radio-button[value="yes"]').click();

    cy.get('button[type="submit"]').click();

    cy.url({ timeout: 10000 }).should('include', '/families');
    cy.contains('FAMILIES').should('be.visible');
  });
});
