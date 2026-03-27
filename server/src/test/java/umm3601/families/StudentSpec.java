package umm3601.families;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class StudentSpec {

    private static final String FAKE_ID1 = "5a155d3c-1e9b-4c8e-9f0a-123456789abc";
    private static final String FAKE_ID2 = "5a155d3c-1e9b-4c8e-9f0a-abcdef123456";

    private Student student1;
    private Student student2;

    @BeforeEach
    void setupEach() {
        student1 = new Student();
        student2 = new Student();
    }

    @Test
    void equalsReturnsTrueForSameId() {
        student1._id = FAKE_ID1;
        student2._id = FAKE_ID1;
        assertTrue(student1.equals(student2));
    }

    @Test
    void equalsReturnsFalseForDifferentIds() {
        student1._id = FAKE_ID1;
        student2._id = FAKE_ID2;
        assertFalse(student1.equals(student2));
    }

    @Test
    void equalsReturnsFalseForNull() {
        student1._id = FAKE_ID1;
        assertFalse(student1.equals(null));
    }

    @SuppressWarnings("unlikely-arg-type")
    @Test
    void equalsReturnsFalseForDifferentType() {
        student1._id = FAKE_ID1;
        assertFalse(student1.equals("some string"));
    }
}
