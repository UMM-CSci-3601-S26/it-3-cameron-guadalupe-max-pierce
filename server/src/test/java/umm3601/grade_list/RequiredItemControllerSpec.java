package umm3601.grade_list;

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
//import umm3601.inventory_items.InventoryItem;
//import umm3601.grade_list.requiredItemController;
//import umm3601.inventory_items.InventoryItem;

@SuppressWarnings({"MagicNumber"})
class RequiredItemControllerSpec {

    private RequiredItemController requiredItemController;

    private ObjectId testItemId1;

    private static MongoClient mongoClient;
    private static MongoDatabase testDatabase;

    private static JavalinJackson javalinJackson = new JavalinJackson();

    @Mock
    private Context ctx;

    @Captor
    private ArgumentCaptor<ArrayList<RequiredItem>> requiredItemArrayCaptor;

    @Captor
    private ArgumentCaptor<RequiredItem> requiredItemCaptor;

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

        MongoCollection<Document> inventoryItemDocuments = testDatabase.getCollection("required_items");
        inventoryItemDocuments.drop();
        List<Document> testInventoryItems = new ArrayList<>();
        testInventoryItems.add(
            new Document()
                .append("name", "Pencil")
                .append("type", "pencil")
                .append("desc", "A wooden pencil with a graphite core.")
                .append("grade", "1")
                .append("school", "MAES")
                .append("required", 100));
        testInventoryItems.add(
            new Document()
                .append("name", "Notebook")
                .append("type", "notebook")
                .append("desc", "A spiral-bound notebook with lined paper.")
                .append("grade", "2")
                .append("school", "MAES")
                .append("required", 50));
        testInventoryItems.add(
            new Document()
                .append("name", "Eraser")
                .append("type", "eraser")
                .append("desc", "A pink eraser for removing pencil marks.")
                .append("grade", "3")
                .append("school", "Hancock")
                .append("required", 120));

        testItemId1 = new ObjectId();
        Document marker = new Document()
            .append("_id", testItemId1)
            .append("name", "Marker")
            .append("type", "marker")
            .append("desc", "A black permanent marker.")
            .append("grade", "K")
            .append("school", "Hancock")
            .append("required", 30);

        inventoryItemDocuments.insertMany(testInventoryItems);
        inventoryItemDocuments.insertOne(marker);

        requiredItemController = new RequiredItemController(testDatabase);
    }

    @Test
    void addsRoutes() {
        Javalin mockServer = mock(Javalin.class);
        requiredItemController.addRoutes(mockServer);
        verify(mockServer, Mockito.atLeast(2)).get(any(), any()); //getItem, get Items
        // verify(mockServer, Mockito.atLeastOnce()).post(any(), any());
        // verify(mockServer, Mockito.atLeastOnce()).delete(any(), any());
    }

    @Test
    void canGetAllInventoryItems() throws IOException {
        when(ctx.queryParamMap()).thenReturn(Collections.emptyMap());
        requiredItemController.getItems(ctx);
        verify(ctx).json(requiredItemArrayCaptor.capture());
        verify(ctx).status(HttpStatus.OK);

        assertEquals(
            testDatabase.getCollection("required_items").countDocuments(),
            requiredItemArrayCaptor.getValue().size());
    }

    @Test
    void getItemWithExistentId() throws IOException {
      String id = testItemId1.toHexString();
      when(ctx.pathParam("id")).thenReturn(id);

      requiredItemController.getItem(ctx);

      verify(ctx).json(requiredItemCaptor.capture());
      verify(ctx).status(HttpStatus.OK);
      assertEquals("Marker", requiredItemCaptor.getValue().name);
      assertEquals(testItemId1.toHexString(), requiredItemCaptor.getValue()._id);
    }

  @Test
  void getItemWithBadId() throws IOException {
    when(ctx.pathParam("id")).thenReturn("bad! bad id!");

    Throwable exception = assertThrows(BadRequestResponse.class, () -> {
      requiredItemController.getItem(ctx);
    });

    assertEquals("The requested item id wasn't a legal Mongo Object ID.", exception.getMessage());
  }

  //Not sure how often we're going to be getting single items, but might as well test it anyways.
  @Test
    void getItemWithNonexistentId() throws IOException {
      String id = "588935f5c668650dc77df581";
      when(ctx.pathParam("id")).thenReturn(id);

      Throwable exception = assertThrows(NotFoundResponse.class, () -> {
        requiredItemController.getItem(ctx);
      });

      assertEquals("The requested item was not found", exception.getMessage());
    }

    @Test
  void addItem() throws IOException {
    // Create a new item to add
    RequiredItem newItem = new RequiredItem();
    newItem.name = "Test Item";
    newItem.required = 25;
    newItem.desc = "This is a test";
    newItem.school = "Hogwarts";
    newItem.grade = "K";
    newItem.type = "test";

    String newItemJson = javalinJackson.toJsonString(newItem, RequiredItem.class);

    when(ctx.bodyValidator(RequiredItem.class))
      .thenReturn(new BodyValidator<RequiredItem>(newItemJson, RequiredItem.class,
                    () -> javalinJackson.fromJsonString(newItemJson, RequiredItem.class)));

    requiredItemController.addNewItem(ctx);
    verify(ctx).json(mapCaptor.capture());

    // Our status should be 201, i.e., our new user was successfully created.
    verify(ctx).status(HttpStatus.CREATED);

    // Verify that the user was added to the database with the correct ID
    Document addedItem = testDatabase.getCollection("required_items")
        .find(eq("_id", new ObjectId(mapCaptor.getValue().get("id")))).first();

    // Successfully adding the user should return the newly generated, non-empty
    // MongoDB ID for that user.
    assertNotEquals("", addedItem.get("_id"));
    assertEquals(newItem.name, addedItem.get("name"));
    assertEquals(newItem.required, addedItem.get("required"));
    assertEquals(newItem.type, addedItem.get("type"));
    assertEquals(newItem.desc, addedItem.get("desc"));
    assertEquals(newItem.grade, addedItem.get("grade"));
    assertEquals(newItem.school, addedItem.get("school"));
  }

  @Test
  void addInvalidNameItem() throws IOException {
    // Create a new user JSON string to add.
    // Note that it has an invalid string for the email address, which is
    // why we're using a `String` here instead of a `User` object
    // like we did in the previous tests.
    String newItemJson = """
      {
        "name": "no",
        "required": 25,
        "desc": "This should fail!",
        "grade": "99",
        "school": "Hogwarts",
        "type": "test"
      }
      """;

    when(ctx.body()).thenReturn(newItemJson);
    when(ctx.bodyValidator(RequiredItem.class))
      .thenReturn(new BodyValidator<RequiredItem>(newItemJson, RequiredItem.class,
                    () -> javalinJackson.fromJsonString(newItemJson, RequiredItem.class)));

    ValidationException exception = assertThrows(ValidationException.class, () -> {
      requiredItemController.addNewItem(ctx);
    });
    String exceptionMessage = exception.getErrors().get("REQUEST_BODY").get(0).toString();
    assertTrue(exceptionMessage.contains("no"));
  }

  @Test
  void addInvalidStockItem() throws IOException {
    String newItemJson = """
      {
        "name": "This is a Test",
        "required": "This is not a number!",
        "desc": "This should fail!",
        "school": "Over there",
        "type": "test",
        "grade": "2"
      }
      """;

    when(ctx.body()).thenReturn(newItemJson);
    when(ctx.bodyValidator(RequiredItem.class))
        .thenReturn(new BodyValidator<RequiredItem>(newItemJson, RequiredItem.class,
                      () -> javalinJackson.fromJsonString(newItemJson, RequiredItem.class)));
    ValidationException exception = assertThrows(ValidationException.class, () -> {
      requiredItemController.addNewItem(ctx);
    });
    String exceptionMessage = exception.getErrors().get("REQUEST_BODY").get(0).toString();

    assertTrue(exceptionMessage.contains("This is not a number!"));
  }

  @Test
  void deleteFoundItem() throws IOException { //Don't delete found family! That's the best family!
    String testID = testItemId1.toHexString();
    when(ctx.pathParam("id")).thenReturn(testID);

    // User exists before deletion
    assertEquals(1, testDatabase.getCollection("required_items").countDocuments(eq("_id", new ObjectId(testID))));

    requiredItemController.deleteItem(ctx);

    verify(ctx).status(HttpStatus.OK);

    // User is no longer in the database
    assertEquals(0, testDatabase.getCollection("required_items").countDocuments(eq("_id", new ObjectId(testID))));
  }

  @Test
  void tryToDeleteNotFoundItem() throws IOException {
    String testID = testItemId1.toHexString();
    when(ctx.pathParam("id")).thenReturn(testID);

    requiredItemController.deleteItem(ctx);
    // Family is no longer in the database
    assertEquals(0, testDatabase.getCollection("required_items").countDocuments(eq("_id", new ObjectId(testID))));

    assertThrows(NotFoundResponse.class, () -> {
      requiredItemController.deleteItem(ctx);
    });

    verify(ctx).status(HttpStatus.NOT_FOUND);

    // Family is still not in the database (Again, if this fails, something's gone horribly wrong)
    assertEquals(0, testDatabase.getCollection("required_items").countDocuments(eq("_id", new ObjectId(testID))));
  }
}
