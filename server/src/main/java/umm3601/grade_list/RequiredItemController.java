package umm3601.grade_list;

import static com.mongodb.client.model.Filters.and;
import static com.mongodb.client.model.Filters.eq;
//import static com.mongodb.client.model.Filters.regex;

// import java.nio.charset.StandardCharsets;
// import java.security.MessageDigest;
// import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
//import java.util.regex.Pattern;

import org.bson.Document;
import org.bson.UuidRepresentation;
import org.bson.conversions.Bson;
import org.bson.types.ObjectId;
import org.mongojack.JacksonMongoCollection;

import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.Sorts;
import com.mongodb.client.result.DeleteResult;

import io.javalin.Javalin;
import io.javalin.http.BadRequestResponse;
import io.javalin.http.Context;
import io.javalin.http.HttpStatus;
import io.javalin.http.NotFoundResponse;
import umm3601.Controller;

/**
 * Controller that manages requests for info about required items.
 */
@SuppressWarnings({"MagicNumber"})
public class RequiredItemController implements Controller {

  private static final String API_GRADE_LIST = "/api/grade_list";
  private static final String API_SCHOOL_LIST = "/api/schools";
  private static final String API_GRADE_LIST_BY_ID = "/api/grade_list/{id}";
  static final String NAME_KEY = "name";
  static final String TYPE_KEY = "type";
  static final String DESC_KEY = "desc";
  static final String LOCATION_KEY = "location";
  static final String STOCKED_KEY = "stocked";

  private final JacksonMongoCollection<RequiredItem> listCollection;
  private final JacksonMongoCollection<School> schoolCollection;

  /**
   * Construct a controller for users.
   *
   * @param database the database containing user data
   */
  public RequiredItemController(MongoDatabase database) {
    listCollection = JacksonMongoCollection.builder().build(
        database,
        "required_items",
        RequiredItem.class,
        UuidRepresentation.STANDARD);
    //And another one...
    schoolCollection = JacksonMongoCollection.builder().build(
        database,
        "schools",
        School.class,
        UuidRepresentation.STANDARD);
  }


  /**
   * Set the JSON body of the response to be the single user
   * specified by the `id` parameter in the request
   *
   * @param ctx a Javalin HTTP context
   */
  public void getItem(Context ctx) {
    String id = ctx.pathParam("id");
    RequiredItem item;

    try {
      item = listCollection.find(eq("_id", new ObjectId(id))).first();
    } catch (IllegalArgumentException e) {
      throw new BadRequestResponse("The requested item id wasn't a legal Mongo Object ID.");
    }
    if (item == null) {
      throw new NotFoundResponse("The requested item was not found");
    } else {
      ctx.json(item);
      ctx.status(HttpStatus.OK);
    }
  }

  /**
   * Set the JSON body of the response to be a list of all the items returned from the database
   * that match any requested filters and ordering
   *
   * @param ctx a Javalin HTTP context
   */
  public void getItems(Context ctx) {
    Bson combinedFilter = constructFilter(ctx);
    Bson sortingOrder = constructSortingOrder(ctx);

    ArrayList<RequiredItem> matchingItems = listCollection
      .find(combinedFilter)
      .sort(sortingOrder)
      .into(new ArrayList<>());

    ctx.json(matchingItems);

    // Explicitly set the context status to OK
    ctx.status(HttpStatus.OK);
  }

  /**
   * Set the JSON body of the response to be a list of all the users returned from the database
   * that match any requested filters and ordering
   *
   * @param ctx a Javalin HTTP context
   */
  public void getSchools(Context ctx) {

    ArrayList<School> matchingItems = schoolCollection
      .find() //No sorting required
      .into(new ArrayList<>());

    ctx.json(matchingItems);

    // Explicitly set the context status to OK
    ctx.status(HttpStatus.OK);
  }

  /**
   * Construct a Bson filter document to use in the `find` method based on the
   * query parameters from the context.
   *
   * This checks for the presence of the `age`, `company`, and `role` query
   * parameters and constructs a filter document that will match users with
   * the specified values for those fields.
   *
   * @param ctx a Javalin HTTP context, which contains the query parameters
   *    used to construct the filter
   * @return a Bson filter document that can be used in the `find` method
   *   to filter the database collection of users
   */
  private Bson constructFilter(Context ctx) {
    List<Bson> filters = new ArrayList<>(); // start with an empty list of filters

    Bson combinedFilter = filters.isEmpty() ? new Document() : and(filters);

    return combinedFilter;
  }

  /**
   * @param ctx a Javalin HTTP context, which contains the query parameters
   *   used to construct the sorting order
   * @return a Bson sorting document that can be used in the `sort` method
   *  to sort the database collection of users
   */
  private Bson constructSortingOrder(Context ctx) {
    // Sort the results. Use the `sortby` query param (default "name")
    // as the field to sort by, and the query param `sortorder` (default
    // "asc") to specify the sort order.
    String sortBy = Objects.requireNonNullElse(ctx.queryParam("sortby"), "name");
    String sortOrder = Objects.requireNonNullElse(ctx.queryParam("sortorder"), "asc");
    Bson sortingOrder = sortOrder.equals("desc") ?  Sorts.descending(sortBy) : Sorts.ascending(sortBy);
    return sortingOrder;
  }

  /**
   * @param ctx a Javalin HTTP context that provides the query parameters
   * @param ctx a Javalin HTTP context that provides the user info
   *  in the JSON body of the request
   */
  public void addNewItem(Context ctx) {
    String body = ctx.body();
    RequiredItem newItem = ctx.bodyValidator(RequiredItem.class)
      .check(itm -> itm.name != null && itm.name.length() >= 4,
        "Item must have a non-empty name; body was " + body)
      .check(itm -> itm.required >= 0,
        "Stocked value must be greater than or equal to zero; body was " + body)
      .check(itm -> itm.type != null && itm.type.length() > 0,
        "Item must have a non-empty type; body was " + body)
      .get();

    // Add the new item to the database
    listCollection.insertOne(newItem);

    // Set the JSON response to be the `_id` of the newly created user.
    // This gives the client the opportunity to know the ID of the new user,
    // which it can then use to perform further operations (e.g., a GET request
    // to get and display the details of the new user).
    ctx.json(Map.of("id", newItem._id));
    // 201 (`HttpStatus.CREATED`) is the HTTP code for when we successfully
    // create a new resource (a user in this case).
    // See, e.g., https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
    // for a description of the various response codes.
    ctx.status(HttpStatus.CREATED);
  }

  /**
   * Delete the user specified by the `id` parameter in the request.
   *
   * @param ctx a Javalin HTTP context
   */
  public void deleteItem(Context ctx) {
    String id = ctx.pathParam("id");
    DeleteResult deleteResult = listCollection.deleteOne(eq("_id", new ObjectId(id)));
    // We should have deleted 1 or 0 users, depending on whether `id` is a valid user ID.
    if (deleteResult.getDeletedCount() != 1) {
      ctx.status(HttpStatus.NOT_FOUND);
      throw new NotFoundResponse(
        "Was unable to delete ID "
          + id
          + "; perhaps illegal ID or an ID for an item not in the system?");
    }
    ctx.status(HttpStatus.OK);
  }

  /**
   * Utility function to generate the md5 hash for a given string
   * ...Wtf is this for?
   * @param str the string to generate a md5 for
   */
  // public String md5(String str) throws NoSuchAlgorithmException {
  //   MessageDigest md = MessageDigest.getInstance("MD5");
  //   byte[] hashInBytes = md.digest(str.toLowerCase().getBytes(StandardCharsets.UTF_8));

  //   StringBuilder result = new StringBuilder();
  //   for (byte b : hashInBytes) {
  //     result.append(String.format("%02x", b));
  //   }
  //   return result.toString();
  // }

  /**
   * @param server The Javalin server instance
   */
  @Override
  public void addRoutes(Javalin server) {
    // Get the specified item
    server.get(API_GRADE_LIST_BY_ID, this::getItem);

    // List items, filtered using query parameters
    server.get(API_GRADE_LIST, this::getItems);

    server.get(API_SCHOOL_LIST, this::getSchools);
    // Get the users, possibly filtered, grouped by company
    // server.get("/api/usersByCompany", this::getUsersGroupedByCompany);

    // Add new item with the user info being in the JSON body
    // of the HTTP request
    server.post(API_GRADE_LIST, this::addNewItem);

    // Delete the specified item
     server.delete(API_GRADE_LIST_BY_ID, this::deleteItem);
  }
}
