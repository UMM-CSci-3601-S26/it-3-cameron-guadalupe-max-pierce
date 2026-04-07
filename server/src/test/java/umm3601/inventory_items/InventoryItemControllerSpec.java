package umm3601.inventory_items;

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

@SuppressWarnings({"MagicNumber"})
class InventoryItemControllerSpec {

    private InventoryItemController inventoryItemController;

    private ObjectId testItemId1;

    private static MongoClient mongoClient;
    private static MongoDatabase testDatabase;

    private static JavalinJackson javalinJackson = new JavalinJackson();

    @Mock
    private Context ctx;

    @Captor
    private ArgumentCaptor<ArrayList<InventoryItem>> inventoryItemArrayCaptor;

    @Captor
    private ArgumentCaptor<InventoryItem> inventoryItemCaptor;

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

        MongoCollection<Document> inventoryItemDocuments = testDatabase.getCollection("inventory_items");
        inventoryItemDocuments.drop();
        List<Document> testInventoryItems = new ArrayList<>();
        testInventoryItems.add(
            new Document()
                .append("name", "Pencil")
                .append("type", "pencil")
                .append("desc", "A wooden pencil with a graphite core.")
                .append("location", "Aisle 3, Shelf B")
                .append("stocked", 100));
        testInventoryItems.add(
            new Document()
                .append("name", "Notebook")
                .append("type", "notebook")
                .append("desc", "A spiral-bound notebook with lined paper.")
                .append("location", "Aisle 3, Shelf C")
                .append("stocked", 50));
        testInventoryItems.add(
            new Document()
                .append("name", "Eraser")
                .append("type", "eraser")
                .append("desc", "A pink eraser for removing pencil marks.")
                .append("location", "Aisle 3, Shelf B")
                .append("stocked", 120));

        testItemId1 = new ObjectId();
        Document marker = new Document()
            .append("_id", testItemId1)
            .append("name", "Marker")
            .append("type", "marker")
            .append("desc", "A black permanent marker.")
            .append("location", "Aisle 3, Shelf D")
            .append("stocked", 30);

        inventoryItemDocuments.insertMany(testInventoryItems);
        inventoryItemDocuments.insertOne(marker);

        inventoryItemController = new InventoryItemController(testDatabase);
    }

    @Test
    void addsRoutes() {
        Javalin mockServer = mock(Javalin.class);
        inventoryItemController.addRoutes(mockServer);
        verify(mockServer, Mockito.atLeast(2)).get(any(), any()); //getItem, get Items
      verify(mockServer, Mockito.atLeastOnce()).post(any(), any());
      verify(mockServer, Mockito.atLeastOnce()).delete(any(), any());
      verify(mockServer, Mockito.atLeastOnce()).put(any(), any());
    }

    @Test
    void canGetAllInventoryItems() throws IOException {
        when(ctx.queryParamMap()).thenReturn(Collections.emptyMap());
        inventoryItemController.getItems(ctx);
        verify(ctx).json(inventoryItemArrayCaptor.capture());
        verify(ctx).status(HttpStatus.OK);

        assertEquals(
            testDatabase.getCollection("inventory_items").countDocuments(),
            inventoryItemArrayCaptor.getValue().size());
    }

    @Test
    void getItemsSupportsDescendingSortOrder() throws IOException {
      when(ctx.queryParamMap()).thenReturn(Collections.emptyMap());
      when(ctx.queryParam("sortby")).thenReturn("name");
      when(ctx.queryParam("sortorder")).thenReturn("desc");

      inventoryItemController.getItems(ctx);

      verify(ctx).json(inventoryItemArrayCaptor.capture());
      verify(ctx).status(HttpStatus.OK);
      List<InventoryItem> sortedItems = inventoryItemArrayCaptor.getValue();
      assertEquals("Pencil", sortedItems.get(0).name);
      assertEquals("Eraser", sortedItems.get(sortedItems.size() - 1).name);
    }

    @Test
    void getItemWithExistentId() throws IOException {
      String id = testItemId1.toHexString();
      when(ctx.pathParam("id")).thenReturn(id);

      inventoryItemController.getItem(ctx);

      verify(ctx).json(inventoryItemCaptor.capture());
      verify(ctx).status(HttpStatus.OK);
      assertEquals("Marker", inventoryItemCaptor.getValue().name);
      assertEquals(testItemId1.toHexString(), inventoryItemCaptor.getValue()._id);
    }

  @Test
  void getItemWithBadId() throws IOException {
    when(ctx.pathParam("id")).thenReturn("bad! bad id!");

    Throwable exception = assertThrows(BadRequestResponse.class, () -> {
      inventoryItemController.getItem(ctx);
    });

    assertEquals("The requested item id wasn't a legal Mongo Object ID.", exception.getMessage());
  }

  //Not sure how often we're going to be getting single items, but might as well test it anyways.
  @Test
    void getItemWithNonexistentId() throws IOException {
      String id = "588935f5c668650dc77df581";
      when(ctx.pathParam("id")).thenReturn(id);

      Throwable exception = assertThrows(NotFoundResponse.class, () -> {
        inventoryItemController.getItem(ctx);
      });

      assertEquals("The requested item was not found", exception.getMessage());
    }

    @Test
  void addItem() throws IOException {
    // Create a new item to add
    InventoryItem newItem = new InventoryItem();
    newItem.name = "Test Item";
    newItem.stocked = 25;
    newItem.desc = "This is a test";
    newItem.location = "located here";
    newItem.type = "test";

    // Use `javalinJackson` to convert the `User` object to a JSON string representing that user.
    // This would be equivalent to:
    //   String testNewUser = """
    //       {
    //         "name": "Test User",
    //         "age": 25,
    //         "company": "testers",
    //         "email": "test@example.com",
    //         "role": "viewer"
    //       }
    //       """;
    // but using `javalinJackson` to generate the JSON avoids repeating all the field values,
    // which is then less error prone.
    String newItemJson = javalinJackson.toJsonString(newItem, InventoryItem.class);

    // A `BodyValidator` needs
    //   - The string (`newUserJson`) being validated
    //   - The class (`User.class) it's trying to generate from that string
    //   - A function (`() -> User`) which "shows" the validator how to convert
    //     the JSON string to a `User` object. We'll again use `javalinJackson`,
    //     but in the other direction.
    when(ctx.bodyValidator(InventoryItem.class))
      .thenReturn(new BodyValidator<InventoryItem>(newItemJson, InventoryItem.class,
                    () -> javalinJackson.fromJsonString(newItemJson, InventoryItem.class)));

    inventoryItemController.addNewItem(ctx);
    verify(ctx).json(mapCaptor.capture());

    // Our status should be 201, i.e., our new user was successfully created.
    verify(ctx).status(HttpStatus.CREATED);

    // Verify that the user was added to the database with the correct ID
    Document addedItem = testDatabase.getCollection("inventory_items")
        .find(eq("_id", new ObjectId(mapCaptor.getValue().get("id")))).first();

    // Successfully adding the user should return the newly generated, non-empty
    // MongoDB ID for that user.
    assertNotEquals("", addedItem.get("_id"));
    // The new user in the database (`addedUser`) should have the same
    // field values as the user we asked it to add (`newUser`).
    assertEquals(newItem.name, addedItem.get("name"));
    assertEquals(newItem.stocked, addedItem.get(InventoryItemController.STOCKED_KEY));
    assertEquals(newItem.type, addedItem.get(InventoryItemController.TYPE_KEY));
    assertEquals(newItem.desc, addedItem.get("desc"));
    assertEquals(newItem.location, addedItem.get(InventoryItemController.LOCATION_KEY));
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
        "stocked": 25,
        "desc": "This should fail!",
        "location": "Over there",
        "type": "test"
      }
      """;

    when(ctx.body()).thenReturn(newItemJson);
    when(ctx.bodyValidator(InventoryItem.class))
      .thenReturn(new BodyValidator<InventoryItem>(newItemJson, InventoryItem.class,
                    () -> javalinJackson.fromJsonString(newItemJson, InventoryItem.class)));

    ValidationException exception = assertThrows(ValidationException.class, () -> {
      inventoryItemController.addNewItem(ctx);
    });
    String exceptionMessage = exception.getErrors().get("REQUEST_BODY").get(0).toString();
    assertTrue(exceptionMessage.contains("no"));
  }

  @Test
  void addInvalidStockItem() throws IOException {
    String newItemJson = """
      {
        "name": "This is a Test",
        "stocked": "This is not a number!",
        "desc": "This should fail!",
        "location": "Over there",
        "type": "test"
      }
      """;

    when(ctx.body()).thenReturn(newItemJson);
    when(ctx.bodyValidator(InventoryItem.class))
        .thenReturn(new BodyValidator<InventoryItem>(newItemJson, InventoryItem.class,
                      () -> javalinJackson.fromJsonString(newItemJson, InventoryItem.class)));
    ValidationException exception = assertThrows(ValidationException.class, () -> {
      inventoryItemController.addNewItem(ctx);
    });
    String exceptionMessage = exception.getErrors().get("REQUEST_BODY").get(0).toString();

    assertTrue(exceptionMessage.contains("This is not a number!"));
  }

  @Test
  void addInvalidTypeItem() throws IOException {
    String newItemJson = """
      {
        "name": "This is a Test",
        "stocked": 10,
        "desc": "This should fail!",
        "location": "Over there",
        "type": ""
      }
      """;

    when(ctx.body()).thenReturn(newItemJson);
    when(ctx.bodyValidator(InventoryItem.class))
      .thenReturn(new BodyValidator<InventoryItem>(newItemJson, InventoryItem.class,
                    () -> javalinJackson.fromJsonString(newItemJson, InventoryItem.class)));

    ValidationException exception = assertThrows(ValidationException.class, () -> {
      inventoryItemController.addNewItem(ctx);
    });
    String exceptionMessage = exception.getErrors().get("REQUEST_BODY").get(0).toString();

    assertTrue(exceptionMessage.contains("non-empty type"));
  }

  @Test
  void deleteFoundItem() throws IOException { //Don't delete found family! That's the best family!
    String testID = testItemId1.toHexString();
    when(ctx.pathParam("id")).thenReturn(testID);

    // User exists before deletion
    assertEquals(1, testDatabase.getCollection("inventory_items").countDocuments(eq("_id", new ObjectId(testID))));

    inventoryItemController.deleteItem(ctx);

    verify(ctx).status(HttpStatus.OK);

    // User is no longer in the database
    assertEquals(0, testDatabase.getCollection("inventory_items").countDocuments(eq("_id", new ObjectId(testID))));
  }

  @Test
  void tryToDeleteNotFoundItem() throws IOException {
    String testID = testItemId1.toHexString();
    when(ctx.pathParam("id")).thenReturn(testID);

    inventoryItemController.deleteItem(ctx);
    // Family is no longer in the database
    assertEquals(0, testDatabase.getCollection("inventory_items").countDocuments(eq("_id", new ObjectId(testID))));

    assertThrows(NotFoundResponse.class, () -> {
      inventoryItemController.deleteItem(ctx);
    });

    verify(ctx).status(HttpStatus.NOT_FOUND);

    // Family is still not in the database (Again, if this fails, something's gone horribly wrong)
    assertEquals(0, testDatabase.getCollection("inventory_items").countDocuments(eq("_id", new ObjectId(testID))));
  }

  @Test
  void updateFoundItem() throws IOException {
    String testID = testItemId1.toHexString();
    when(ctx.pathParam("id")).thenReturn(testID);

    InventoryItem updatedItem = new InventoryItem();
    updatedItem.name = "Updated Marker";
    updatedItem.type = "marker";
    updatedItem.desc = "Updated description";
    updatedItem.location = "Aisle 9, Shelf Z";
    updatedItem.stocked = 77;
    updatedItem.pack = 1;

    String updatedItemJson = javalinJackson.toJsonString(updatedItem, InventoryItem.class);
    when(ctx.body()).thenReturn(updatedItemJson);
    when(ctx.bodyValidator(InventoryItem.class))
      .thenReturn(new BodyValidator<InventoryItem>(updatedItemJson, InventoryItem.class,
                    () -> javalinJackson.fromJsonString(updatedItemJson, InventoryItem.class)));

    inventoryItemController.updateItem(ctx);

    verify(ctx).status(HttpStatus.OK);
    Document savedItem = testDatabase.getCollection("inventory_items")
      .find(eq("_id", new ObjectId(testID))).first();

    assertEquals("Updated Marker", savedItem.get("name"));
    assertEquals(77, savedItem.get("stocked"));
    assertEquals("Aisle 9, Shelf Z", savedItem.get("location"));
  }

  @Test
  void updateItemWithBadId() throws IOException {
    when(ctx.pathParam("id")).thenReturn("bad! bad id!");

    InventoryItem updatedItem = new InventoryItem();
    updatedItem.name = "Updated Marker";
    updatedItem.type = "marker";
    updatedItem.desc = "Updated description";
    updatedItem.location = "Aisle 9, Shelf Z";
    updatedItem.stocked = 77;
    updatedItem.pack = 1;

    String updatedItemJson = javalinJackson.toJsonString(updatedItem, InventoryItem.class);
    when(ctx.body()).thenReturn(updatedItemJson);
    when(ctx.bodyValidator(InventoryItem.class))
      .thenReturn(new BodyValidator<InventoryItem>(updatedItemJson, InventoryItem.class,
                    () -> javalinJackson.fromJsonString(updatedItemJson, InventoryItem.class)));

    Throwable exception = assertThrows(BadRequestResponse.class, () -> {
      inventoryItemController.updateItem(ctx);
    });

    assertEquals("The requested item id wasn't a legal Mongo Object ID.", exception.getMessage());
  }

  @Test
  void updateItemWithNonexistentId() throws IOException {
    String testID = "588935f5c668650dc77df581";
    when(ctx.pathParam("id")).thenReturn(testID);

    InventoryItem updatedItem = new InventoryItem();
    updatedItem.name = "Updated Marker";
    updatedItem.type = "marker";
    updatedItem.desc = "Updated description";
    updatedItem.location = "Aisle 9, Shelf Z";
    updatedItem.stocked = 77;
    updatedItem.pack = 1;

    String updatedItemJson = javalinJackson.toJsonString(updatedItem, InventoryItem.class);
    when(ctx.body()).thenReturn(updatedItemJson);
    when(ctx.bodyValidator(InventoryItem.class))
      .thenReturn(new BodyValidator<InventoryItem>(updatedItemJson, InventoryItem.class,
                    () -> javalinJackson.fromJsonString(updatedItemJson, InventoryItem.class)));

    assertThrows(NotFoundResponse.class, () -> {
      inventoryItemController.updateItem(ctx);
    });

    verify(ctx).status(HttpStatus.NOT_FOUND);
  }
}
