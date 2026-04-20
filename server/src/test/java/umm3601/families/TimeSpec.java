package umm3601.families;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class TimeSpec {

    private static final String FAKE_ID1 = "5a155d3c-1e9b-4c8e-9f0a-123456789abc";
    private static final String FAKE_ID2 = "5a155d3c-1e9b-4c8e-9f0a-abcdef123456";

    private Time time1;
    private Time time2;

    @BeforeEach
    void setupEach() {
        time1 = new Time();
        time2 = new Time();
    }

    @Test
    void equalsReturnsTrueForSameId() {
        time1._id = FAKE_ID1;
        time2._id = FAKE_ID1;
        assertTrue(time1.equals(time2));
    }

    @Test
    void equalsReturnsFalseForDifferentIds() {
        time1._id = FAKE_ID1;
        time2._id = FAKE_ID2;
        assertFalse(time1.equals(time2));
    }

    @Test
    void equalsReturnsFalseForNull() {
        time1._id = FAKE_ID1;
        assertFalse(time1.equals(null));
    }

    @SuppressWarnings("unlikely-arg-type")
    @Test
    void equalsReturnsFalseForDifferentType() {
        time1._id = FAKE_ID1;
        assertFalse(time1.equals("some string"));
    }

    @Test
    void hashCodesAreBasedOnId() {
        time1._id = FAKE_ID1;
        time2._id = FAKE_ID1;
        assertTrue(time1.hashCode() == time2.hashCode());
    }
}
