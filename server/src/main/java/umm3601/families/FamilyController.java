package umm3601.families;

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
// import umm3601.families.Student;
// import umm3601.inventory_items.InventoryItem;

/**
 * Controller that manages requests for info about users.
 */
@SuppressWarnings({"MagicNumber"})
public class FamilyController implements Controller {

  private static final String API_FAMILIES = "/api/families";
  private static final String API_FAMILY_BY_ID = "/api/families/{id}";
  // static final String NAME_KEY = "name";
  // static final String TYPE_KEY = "type";
  // static final String DESC_KEY = "desc";
  // static final String LOCATION_KEY = "location";
  // static final String STOCKED_KEY = "stocked";

  private final JacksonMongoCollection<Family> familyCollection;

  /**
   * Construct a controller for users.
   *
   * @param database the database containing user data
   */
  public FamilyController(MongoDatabase database) {
    familyCollection = JacksonMongoCollection.builder().build(
        database,
        "families",
        Family.class,
        UuidRepresentation.STANDARD);
  }

  /**
   * Set the JSON body of the response to be the single user
   * specified by the `id` parameter in the request
   *
   * @param ctx a Javalin HTTP context
   */
  public void getFamily(Context ctx) {
    String id = ctx.pathParam("id");
    Family family;

    try {
      family = familyCollection.find(eq("_id", new ObjectId(id))).first();
    } catch (IllegalArgumentException e) {
      throw new BadRequestResponse("The requested item id wasn't a legal Mongo Object ID.");
    }
    if (family == null) {
      throw new NotFoundResponse("The requested family was not found");
    } else {
      ctx.json(family);
      ctx.status(HttpStatus.OK);
    }
  }

  /**
   * Set the JSON body of the response to be a list of all the users returned from the database
   * that match any requested filters and ordering
   *
   * @param ctx a Javalin HTTP context
   */
  public void getFamilies(Context ctx) {
    Bson combinedFilter = constructFilter(ctx);
    Bson sortingOrder = constructSortingOrder(ctx);

    ArrayList<Family> matchingItems = familyCollection
      .find(combinedFilter)
      .sort(sortingOrder)
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

    // if (ctx.queryParamMap().containsKey(AGE_KEY)) {
    //   int targetAge = ctx.queryParamAsClass(AGE_KEY, Integer.class)
    //     .check(it -> it > 0, "User's age must be greater than zero; you provided " + ctx.queryParam(AGE_KEY))
    //     .check(it -> it < REASONABLE_AGE_LIMIT,
    //       "User's age must be less than " + REASONABLE_AGE_LIMIT + "; you provided " + ctx.queryParam(AGE_KEY))
    //     .get();
    //   filters.add(eq(AGE_KEY, targetAge));
    // }
    // if (ctx.queryParamMap().containsKey(COMPANY_KEY)) {
    //   Pattern pattern = Pattern.compile(Pattern.quote(ctx.queryParam(COMPANY_KEY)), Pattern.CASE_INSENSITIVE);
    //   filters.add(regex(COMPANY_KEY, pattern));
    // }
    // if (ctx.queryParamMap().containsKey(ROLE_KEY)) {
    //   String role = ctx.queryParamAsClass(ROLE_KEY, String.class)
    //     .check(it -> it.matches(ROLE_REGEX), "User must have a legal user role")
    //     .get();
    //   filters.add(eq(ROLE_KEY, role));
    // }

    // Combine the list of filters into a single filtering document.
    Bson combinedFilter = filters.isEmpty() ? new Document() : and(filters);

    return combinedFilter;
  }

  /**
   * Construct a Bson sorting document to use in the `sort` method based on the
   * query parameters from the context.
   *
   * This checks for the presence of the `sortby` and `sortorder` query
   * parameters and constructs a sorting document that will sort users by
   * the specified field in the specified order. If the `sortby` query
   * parameter is not present, it defaults to "name". If the `sortorder`
   * query parameter is not present, it defaults to "asc".
   *
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
   * Set the JSON body of the response to be a list of all the user names and IDs
   * returned from the database, grouped by company
   *
   * This "returns" a list of user names and IDs, grouped by company in the JSON
   * body of the response. The user names and IDs are stored in `UserIdName` objects,
   * and the company name, the number of users in that company, and the list of user
   * names and IDs are stored in `UserByCompany` objects.
   *
   * @param ctx a Javalin HTTP context that provides the query parameters
   *   used to sort the results. We support either sorting by company name
   *   (in either `asc` or `desc` order) or by the number of users in the
   *   company (`count`, also in either `asc` or `desc` order).
   */

  /**
   * Add a new user using information from the context
   * (as long as the information gives "legal" values to User fields)
   *
   * @param ctx a Javalin HTTP context that provides the user info
   *  in the JSON body of the request
   */
  public void addNewFamily(Context ctx) {
    String body = ctx.body();
    Family newFamily = ctx.bodyValidator(Family.class)
      .check(itm -> itm.name != null && itm.name.length() >= 4,
        "Family must have a non-empty name; body was " + body)
      .check(itm -> itm.students.size() >= 0, //TODO, is this the correct way to do this?
        "Family must have at least one student; body was " + body)
      .check(itm -> itm.time != "",
        "Family must have valid appointment time; body was " + body)
      .get();

    // Add the new item to the database
    familyCollection.insertOne(newFamily);

    // Set the JSON response to be the `_id` of the newly created user.
    // This gives the client the opportunity to know the ID of the new user,
    // which it can then use to perform further operations (e.g., a GET request
    // to get and display the details of the new user).
    ctx.json(Map.of("id", newFamily._id));
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
  public void deleteFamily(Context ctx) {
    String id = ctx.pathParam("id");
    DeleteResult deleteResult = familyCollection.deleteOne(eq("_id", new ObjectId(id)));
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
   * ...Wtf is this for? Again? Is this still necessary? It's bringing down our coverage.
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
    server.get(API_FAMILY_BY_ID, this::getFamily);

    // List items, filtered using query parameters
    server.get(API_FAMILIES, this::getFamilies);

    // Get the users, possibly filtered, grouped by company
    // server.get("/api/usersByCompany", this::getUsersGroupedByCompany);

    // Add new item with the user info being in the JSON body
    // of the HTTP request
    server.post(API_FAMILIES, this::addNewFamily);

    // Delete the specified item
     server.delete(API_FAMILY_BY_ID, this::deleteFamily);
  }
}
