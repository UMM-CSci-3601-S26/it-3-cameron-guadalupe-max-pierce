package umm3601.families;

import org.mongojack.Id;
import org.mongojack.ObjectId;

//import umm3601.families.Student;

@SuppressWarnings({"VisibilityModifier"})
public class Student {

  @ObjectId @Id
  @SuppressWarnings({"MemberName"})
  public String _id;

  public boolean backpack; //If true, student also needs a backpack.
  public String grade; //Just need grade, not name.
  public String school;
  //Tracked as a string to account for kindergarten and preschool.

  @Override
  public int hashCode() {
    return _id.hashCode();
  }

  @Override
  public boolean equals(Object obj) {
    if (!(obj instanceof Student)) {
      return false;
    }
    Student other = (Student) obj;
    return _id.equals(other._id);
  }
}
