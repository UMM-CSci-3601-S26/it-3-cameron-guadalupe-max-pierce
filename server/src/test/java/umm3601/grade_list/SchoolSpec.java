package umm3601.grade_list;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class SchoolSpec {

    private static final String FAKE_ID1 = "5a155d3c-1e9b-4c8e-9f0a-123456789abc";
    private static final String FAKE_ID2 = "5a155d3c-1e9b-4c8e-9f0a-abcdef123456";

    private School item1;
    private School item2;

    @BeforeEach
    void setupEach() {
        item1 = new School();
        item2 = new School();
    }

    @Test
    void equalsReturnsTrueForSameId() {
        item1._id = FAKE_ID1;
        item2._id = FAKE_ID1;
        assertTrue(item1.equals(item2));
    }

    @Test
    void equalsReturnsFalseForDifferentIds() {
        item1._id = FAKE_ID1;
        item2._id = FAKE_ID2;
        assertFalse(item1.equals(item2));
    }

    @Test
    void equalsReturnsFalseForNull() {
        item1._id = FAKE_ID1;
        assertFalse(item1.equals(null));
    }

    @Test
    void hashCodesAreBasedOnId() {
        item1._id = FAKE_ID1;
        item2._id = FAKE_ID1;
        assertTrue(item1.hashCode() == item2.hashCode());
    }

    @SuppressWarnings("unlikely-arg-type")
    @Test
    void equalsReturnsFalseForDifferentType() {
        item1._id = FAKE_ID1;
        assertFalse(item1.equals("some string"));
    }
}
