package umm3601.settings;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

import org.bson.Document;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;

import com.mongodb.MongoClientSettings;
import com.mongodb.ServerAddress;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoDatabase;

import io.javalin.Javalin;
import io.javalin.http.Context;
import io.javalin.http.HttpStatus;

@SuppressWarnings({"MagicNumber"})
class SettingsControllerSpec {

  private SettingsController settingsController;

  private static MongoClient mongoClient;
  private static MongoDatabase db;

  @Mock
  private Context ctx;

  @BeforeAll
  static void setupAll() {
    String mongoAddr = System.getenv().getOrDefault("MONGO_ADDR", "localhost");
    mongoClient = MongoClients.create(
        MongoClientSettings.builder()
            .applyToClusterSettings(builder -> builder.hosts(Arrays.asList(new ServerAddress(mongoAddr))))
            .build());
    db = mongoClient.getDatabase("test");
  }

  @AfterAll
  static void teardown() {
    db.drop();
    mongoClient.close();
  }

  @BeforeEach
  void setupEach() throws IOException {
    MockitoAnnotations.openMocks(this);
    db.getCollection("settings").drop();
    settingsController = new SettingsController(db);
  }

  @Test
  void getSettingsReturnsDefaultWhenNoneExists() {
    settingsController.getSettings(ctx);

    ArgumentCaptor<Settings> settingsCaptor = ArgumentCaptor.forClass(Settings.class);
    verify(ctx).json(settingsCaptor.capture());
    verify(ctx).status(HttpStatus.OK);

    Settings returned = settingsCaptor.getValue();
    assertEquals(SettingsController.SETTINGS_ID, returned._id);
    assertNotNull(returned.schools);
    assertNotNull(returned.timeAvailability);
    assertNotNull(returned.supplyOrder);
  }

  @Test
  void addsRoutes() {
    Javalin mockServer = mock(Javalin.class);
    settingsController.addRoutes(mockServer);

    verify(mockServer, atLeastOnce()).get(any(), any());
    verify(mockServer, atLeastOnce()).patch(any(), any());
    verify(mockServer, never()).post(any(), any());
  }

  @Test
  void updateSchoolsThrowsOnMissingSchools() {
    Settings body = new Settings();
    body.schools = null;
    when(ctx.bodyAsClass(Settings.class)).thenReturn(body);

    boolean threw = false;
    try {
      settingsController.updateSchools(ctx);
    } catch (io.javalin.http.BadRequestResponse e) {
      threw = true;
      assertEquals("Request body must include a 'schools' array.", e.getMessage());
    }

    assertTrue(threw);
  }

  @Test
  void updateSchoolsPersistsAndIsRetrievable() {
    Settings.SchoolInfo school = new Settings.SchoolInfo();
    school.name = "Morris Area High School";
    school.abbreviation = "MAHS";

    Settings body = new Settings();
    body.schools = List.of(school);
    when(ctx.bodyAsClass(Settings.class)).thenReturn(body);

    settingsController.updateSchools(ctx);
    verify(ctx).status(HttpStatus.OK);

    settingsController.getSettings(ctx);
    ArgumentCaptor<Settings> settingsCaptor = ArgumentCaptor.forClass(Settings.class);
    verify(ctx).json(settingsCaptor.capture());

    Settings saved = settingsCaptor.getValue();
    assertEquals(1, saved.schools.size());
    assertEquals("Morris Area High School", saved.schools.get(0).name);
    assertEquals("MAHS", saved.schools.get(0).abbreviation);
  }

  @Test
  void updateSupplyOrderWithNullSupplyOrderThrowsBadRequest() {
    Settings body = new Settings();
    body.supplyOrder = null;
    when(ctx.bodyAsClass(Settings.class)).thenReturn(body);

    boolean threw = false;
    try {
      settingsController.updateSupplyOrder(ctx);
    } catch (io.javalin.http.BadRequestResponse e) {
      threw = true;
      assertEquals("Request body must include a 'supplyOrder' array.", e.getMessage());
    }

    assertTrue(threw);
  }

  @Test
  void updateSupplyOrderPersistsAndIsRetrievable() {
    Settings.SupplyItemOrder entry = new Settings.SupplyItemOrder();
    entry.itemTerm = "folder";
    entry.status = "unstaged";

    Settings body = new Settings();
    body.supplyOrder = List.of(entry);
    when(ctx.bodyAsClass(Settings.class)).thenReturn(body);

    settingsController.updateSupplyOrder(ctx);
    verify(ctx).status(HttpStatus.OK);

    settingsController.getSettings(ctx);
    ArgumentCaptor<Settings> settingsCaptor = ArgumentCaptor.forClass(Settings.class);
    verify(ctx, Mockito.times(1)).json(settingsCaptor.capture());

    Settings saved = settingsCaptor.getValue();
    assertEquals(1, saved.supplyOrder.size());
    assertEquals("folder", saved.supplyOrder.get(0).itemTerm);
    assertEquals("unstaged", saved.supplyOrder.get(0).status);
  }

  @Test
  void getSettingsBackfillsMissingSupplyOrderFromExistingDocument() {
    db.getCollection("settings").insertOne(new Document("_id", SettingsController.SETTINGS_ID)
        .append("schools", List.of())
        .append("timeAvailability", new Document()));

    settingsController.getSettings(ctx);

    ArgumentCaptor<Settings> settingsCaptor = ArgumentCaptor.forClass(Settings.class);
    verify(ctx).json(settingsCaptor.capture());

    Settings returned = settingsCaptor.getValue();
    assertNotNull(returned.supplyOrder);
    assertEquals(0, returned.supplyOrder.size());
  }
}
