package umm3601.families;

//import static com.mongodb.client.model.Filters.eq;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
//import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
//import static org.mockito.ArgumentMatchers.eq;
import static com.mongodb.client.model.Filters.eq;
//import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.IOException;
//import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
//import java.util.HashMap;
import java.util.List;
import java.util.Map;
//import java.util.stream.Collectors;

import org.bson.Document;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
//import org.mockito.ArgumentMatcher;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;

//import com.fasterxml.jackson.core.JsonProcessingException;
//import com.fasterxml.jackson.databind.JsonMappingException;
import com.mongodb.MongoClientSettings;
import com.mongodb.ServerAddress;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;

import io.javalin.Javalin;
import io.javalin.http.BadRequestResponse;
import io.javalin.http.Context;
import io.javalin.http.HttpStatus;
import io.javalin.http.NotFoundResponse;
import io.javalin.json.JavalinJackson;
//import io.javalin.validation.BodyValidator;
//import io.javalin.validation.Validation;
//import io.javalin.validation.ValidationError;
//import io.javalin.validation.ValidationException;
//import io.javalin.validation.Validator;
import io.javalin.validation.BodyValidator;
import io.javalin.validation.ValidationException;
//import umm3601.user.UserController;
// import umm3601.families.Family;
// import umm3601.families.FamilyController;
// import umm3601.inventory_items.InventoryItem;

@SuppressWarnings({"MagicNumber"})
class FamilyControllerSpec {

    private FamilyController familyController;

    private ObjectId testItemId1;

    private static MongoClient mongoClient;
    private static MongoDatabase testDatabase;

    private static JavalinJackson javalinJackson = new JavalinJackson();

    @Mock
    private Context ctx;

    @Captor
    private ArgumentCaptor<ArrayList<Family>> inventoryItemArrayCaptor;

    @Captor
    private ArgumentCaptor<Family> familyCaptor;

    @Captor
    private ArgumentCaptor<Map<String, String>> mapCaptor;

    @BeforeAll
    static void setupAll() {
        String mongoAddr = System.getenv().getOrDefault("MONGO_ADDR", "localhost");

        mongoClient = MongoClients.create(
            MongoClientSettings.builder()
                .applyToClusterSettings(builder ->
                    builder.hosts(Arrays.asList(new ServerAddress(mongoAddr))))
                .build());
        testDatabase = mongoClient.getDatabase("test");
    }

    @AfterAll
    static void tearDownAll() {
        testDatabase.drop();
        mongoClient.close();
    }

    @BeforeEach
    void setupEach() throws IOException {
        MockitoAnnotations.openMocks(this);

        MongoCollection<Document> familyDocuments = testDatabase.getCollection("families");
        familyDocuments.drop();

       //First batch of test students
        List<Document> testStudents1 = new ArrayList<>();
        testStudents1.add(
          new Document()
            .append("grade", "K")
            .append("backpack", false));
        testStudents1.add(
          new Document()
            .append("grade", "2")
            .append("backpack", true));

        //Second test student
        List<Document> testStudents2 = new ArrayList<>();
        testStudents2.add(
        new Document()
          .append("grade", "5")
          .append("backpack", false));

        //Last batch of test students
        List<Document> testStudents3 = new ArrayList<>();
        testStudents3.add(
        new Document()
          .append("grade", "P")
          .append("backpack", false));
        testStudents3.add(
        new Document()
          .append("grade", "2")
          .append("backpack", false));
        testStudents3.add(
        new Document()
          .append("grade", "6")
          .append("backpack", false));

        //Test families, using test students to supply student field.
        List<Document> testFamilies = new ArrayList<>();
        testFamilies.add(
            new Document()
                .append("name", "Richards")
                .append("time", "1:00pm")
                .append("students",  testStudents1));
        testFamilies.add(
            new Document()
                .append("name", "Hendersons")
                .append("time", "2:00pm")
                .append("students",  testStudents2));
        testFamilies.add(
            new Document()
                .append("name", "Jones")
                .append("time", "3:00pm")
                .append("students",  testStudents3));

        testItemId1 = new ObjectId();
        Document exampleFam = new Document()
            .append("_id", testItemId1)
            .append("name", "Obamas")
            .append("time", 600)
            .append("students",  testStudents3);

        familyDocuments.insertMany(testFamilies);
        familyDocuments.insertOne(exampleFam);

        familyController = new FamilyController(testDatabase);
    }

    @Test
    void addsRoutes() {
        Javalin mockServer = mock(Javalin.class);
        familyController.addRoutes(mockServer);
        verify(mockServer, Mockito.atLeast(2)).get(any(), any()); //getItem, get Items
        // verify(mockServer, Mockito.atLeastOnce()).post(any(), any());
        // verify(mockServer, Mockito.atLeastOnce()).delete(any(), any());
    }

    @Test
    void canGetAllFamilies() throws IOException {
        when(ctx.queryParamMap()).thenReturn(Collections.emptyMap());
        familyController.getFamilies(ctx);
        verify(ctx).json(inventoryItemArrayCaptor.capture());
        verify(ctx).status(HttpStatus.OK);

        assertEquals(
            testDatabase.getCollection("families").countDocuments(),
            inventoryItemArrayCaptor.getValue().size());
    }

    @Test
    void getFamiliesSupportsDescendingSortOrder() throws IOException {
      when(ctx.queryParamMap()).thenReturn(Collections.emptyMap());
      when(ctx.queryParam("sortby")).thenReturn("name");
      when(ctx.queryParam("sortorder")).thenReturn("desc");

      familyController.getFamilies(ctx);

      verify(ctx).json(inventoryItemArrayCaptor.capture());
      verify(ctx).status(HttpStatus.OK);
      List<Family> sortedFamilies = inventoryItemArrayCaptor.getValue();
      assertEquals("Richards", sortedFamilies.get(0).name);
      assertEquals("Hendersons", sortedFamilies.get(sortedFamilies.size() - 1).name);
    }

    @Test
    void getFamilyWithExistentId() throws IOException {
      String id = testItemId1.toHexString();
      when(ctx.pathParam("id")).thenReturn(id);

      familyController.getFamily(ctx);

      verify(ctx).json(familyCaptor.capture());
      verify(ctx).status(HttpStatus.OK);
      assertEquals("Obamas", familyCaptor.getValue().name);
      assertEquals(testItemId1.toHexString(), familyCaptor.getValue()._id);
    }

  @Test
  void getFamilyWithBadId() throws IOException {
    when(ctx.pathParam("id")).thenReturn("bad! bad id!");

    Throwable exception = assertThrows(BadRequestResponse.class, () -> {
      familyController.getFamily(ctx);
    });

    assertEquals("The requested item id wasn't a legal Mongo Object ID.", exception.getMessage());
  }

  //Not sure how often we're going to be getting single items, but might as well test it anyways.
  @Test
    void getFamilyWithNonexistentId() throws IOException {
      String id = "588935f5c668650dc77df581";
      when(ctx.pathParam("id")).thenReturn(id);

      Throwable exception = assertThrows(NotFoundResponse.class, () -> {
        familyController.getFamily(ctx);
      });

      assertEquals("The requested family was not found", exception.getMessage());
    }

  @Test
  void addFamily() throws IOException {
    // Create a new item to add
    Family newFamily = new Family();

    Student student1 = new Student();
    student1.grade = "K";
    student1.backpack = false;

    Student student2 = new Student();
    student2.grade = "2";
    student2.backpack = true;

    List<Student> newStudents = new ArrayList<Student>(); //Why are java arrays like this???
    newStudents.add(student1);
    newStudents.add(student2);

    newFamily.name = "Hendrixes";
    newFamily.time = "2:50";
    newFamily.students = newStudents;

    String newFamilyJson = javalinJackson.toJsonString(newFamily, Family.class);

    // A `BodyValidator` needs
    //   - The string (`newUserJson`) being validated
    //   - The class (`User.class) it's trying to generate from that string
    //   - A function (`() -> User`) which "shows" the validator how to convert
    //     the JSON string to a `User` object. We'll again use `javalinJackson`,
    //     but in the other direction.
    when(ctx.bodyValidator(Family.class))
      .thenReturn(new BodyValidator<Family>(newFamilyJson, Family.class,
                    () -> javalinJackson.fromJsonString(newFamilyJson, Family.class)));

    familyController.addNewFamily(ctx);
    verify(ctx).json(mapCaptor.capture());

    // Our status should be 201, i.e., our new user was successfully created.
    verify(ctx).status(HttpStatus.CREATED);

    // Verify that the user was added to the database with the correct ID
    Document addedItem = testDatabase.getCollection("families")
        .find(eq("_id", new ObjectId(mapCaptor.getValue().get("id")))).first();

    // Successfully adding the user should return the newly generated, non-empty
    // MongoDB ID for that user.
    assertNotEquals("", addedItem.get("_id"));
    // The new user in the database (`addedUser`) should have the same
    // field values as the user we asked it to add (`newUser`).
    assertEquals(newFamily.name, addedItem.get("name"));
    assertEquals(newFamily.time, addedItem.get("time"));
    //TODO, actually add some meaningful tests for student equality;
    //An array of structs does not automatically equal a student.
    //assertEquals(newFamily.students, addedItem.get("students")); //This is gonna be a troublemaker
  }

  @Test
  void addInvalidNameFamily() throws IOException {
    // Create a new user JSON string to add.
    // Note that it has an invalid string for the email address, which is
    // why we're using a `String` here instead of a `User` object
    // like we did in the previous tests.
    String newFamilyJson = """
      {
        "name": "no",
        "time": "2",
        "students":[]
      }
      """;

    when(ctx.body()).thenReturn(newFamilyJson);
    when(ctx.bodyValidator(Family.class))
      .thenReturn(new BodyValidator<Family>(newFamilyJson, Family.class,
                    () -> javalinJackson.fromJsonString(newFamilyJson, Family.class)));

    ValidationException exception = assertThrows(ValidationException.class, () -> {
      familyController.addNewFamily(ctx);
    });
    String exceptionMessage = exception.getErrors().get("REQUEST_BODY").get(0).toString();
    assertTrue(exceptionMessage.contains("no"));
  }

  @Test
  void deleteFoundFamily() throws IOException { //Don't delete found family! That's the best family!
    String testID = testItemId1.toHexString();
    when(ctx.pathParam("id")).thenReturn(testID);

    // User exists before deletion
    assertEquals(1, testDatabase.getCollection("families").countDocuments(eq("_id", new ObjectId(testID))));

    familyController.deleteFamily(ctx);

    verify(ctx).status(HttpStatus.OK);

    // User is no longer in the database
    assertEquals(0, testDatabase.getCollection("families").countDocuments(eq("_id", new ObjectId(testID))));
  }

  @Test
  void tryToDeleteNotFoundFamily() throws IOException {
    String testID = testItemId1.toHexString();
    when(ctx.pathParam("id")).thenReturn(testID);

    familyController.deleteFamily(ctx);
    // Family is no longer in the database
    assertEquals(0, testDatabase.getCollection("families").countDocuments(eq("_id", new ObjectId(testID))));

    assertThrows(NotFoundResponse.class, () -> {
      familyController.deleteFamily(ctx);
    });

    verify(ctx).status(HttpStatus.NOT_FOUND);

    // Family is still not in the database (If this fails, something's gone horribly wrong)
    assertEquals(0, testDatabase.getCollection("families").countDocuments(eq("_id", new ObjectId(testID))));
  }
}
