import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";

//Function to get or create a visitor ID
export default async function getVisitorId() {
  const cookieStore = await cookies();
  let visitorId = cookieStore.get("visitor_id")?.value;

  if (!visitorId) {
    // Generate a UUID
    visitorId = uuidv4();
    // Note: In a real app, we would set this cookie server-side
  } else {
    // Check if existing ID is a valid UUID, if not, generate a new one
    const isValidUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        visitorId
      );
    if (!isValidUUID) {
      console.log(
        `Converting non-UUID visitor ID to UUID format: ${visitorId}`
      );
      visitorId = uuidv4();
    }
  }

  return visitorId;
}
