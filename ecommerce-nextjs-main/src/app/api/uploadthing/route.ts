import { createRouteHandler } from "uploadthing/next";

import { ourFileRouter } from "./core";
import { UTApi } from "uploadthing/server";

// Export routes for Next App Router
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,

  // Apply an (optional) custom config:
  // config: { ... },
});

export async function DELETE(request: Request) {
  try {
    const { fileKey } = await request.json();
    if (!fileKey) {
      return Response.json({ message: "fileKey is required" }, { status: 400 });
    }
    const utApi = new UTApi();
    await utApi.deleteFiles(fileKey);
    return Response.json({ message: "Image deleted" });
  } catch (error) {
    return Response.json(
      { message: "Image delete failed", error: String(error) },
      { status: 500 }
    );
  }
}
