package umm3601.families;

import org.mongojack.Id;
import org.mongojack.ObjectId;

import umm3601.grade_list.School;

//Helper class. Again. Bloody coverage...
@SuppressWarnings({"VisibilityModifier"})
public class Time {

  @ObjectId @Id
  // By default Java field names shouldn't start with underscores.
  // Here, though, we *have* to use the name `_id` to match the
  // name of the field as used by MongoDB.
  @SuppressWarnings({"MemberName"})
  public String _id;

  public String value;

  @Override
  public boolean equals(Object obj) {
    if (!(obj instanceof School)) {
      return false;
    }
    Time other = (Time) obj;
    return _id.equals(other._id);
  }

  @Override
  public int hashCode() {
    // This means that equal InventoryItems will hash the same, which is good.
    return _id.hashCode();
  }

  @Override
  public String toString() {
    return value;
  }
}
