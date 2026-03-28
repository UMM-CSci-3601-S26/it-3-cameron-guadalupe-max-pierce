package umm3601.families;

import java.util.List;
import org.mongojack.Id;
import org.mongojack.ObjectId;

// import umm3601.families.Student;
// import umm3601.inventory_items.InventoryItem;
// import umm3601.families.Family;

@SuppressWarnings({"VisibilityModifier"})
public class Family {

  @ObjectId @Id
  @SuppressWarnings({"MemberName"})
  public String _id;

  public String name; //Last name
  //public Student[] students; //Array of students in family
  public List<Student> students; //Parseable string of data
  public String time; //Time of appointment
  public String email;

  @Override
  public boolean equals(Object obj) {
    if (!(obj instanceof Family)) {
      return false;
    }
    Family other = (Family) obj;
    return _id.equals(other._id);
  }

  @Override
  public int hashCode() {
    // This means that equal InventoryItems will hash the same, which is good.
    return _id.hashCode();
  }

  @Override
  public String toString() {
    return name;
  }
}
