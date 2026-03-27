package umm3601.families;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class FamilySpec {

    private static final String FAKE_ID1 = "5a155d3c-1e9b-4c8e-9f0a-123456789abc";
    private static final String FAKE_ID2 = "5a155d3c-1e9b-4c8e-9f0a-abcdef123456";

    private Family family1;
    private Family family2;

    @BeforeEach
    void setupEach() {
        family1 = new Family();
        family2 = new Family();
    }

    @Test
    void equalsReturnsTrueForSameId() {
        family1._id = FAKE_ID1;
        family2._id = FAKE_ID1;
        assertTrue(family1.equals(family2));
    }

    @Test
    void equalsReturnsFalseForDifferentIds() {
        family1._id = FAKE_ID1;
        family2._id = FAKE_ID2;
        assertFalse(family1.equals(family2));
    }

    @Test
    void equalsReturnsFalseForNull() {
        family1._id = FAKE_ID1;
        assertFalse(family1.equals(null));
    }

    @Test
    void hashCodesAreBasedOnId() {
        family1._id = FAKE_ID1;
        family2._id = FAKE_ID1;
        assertTrue(family1.hashCode() == family2.hashCode());
    }

    @SuppressWarnings("unlikely-arg-type")
    @Test
    void equalsReturnsFalseForDifferentType() {
        family1._id = FAKE_ID1;
        assertFalse(family1.equals("some string"));
    }
}
