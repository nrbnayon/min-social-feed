import request from "supertest";
import { app } from "../../../src/app.js";

describe("Health Route (Integration)", () => {
  it("GET /health should return 200 OK with status ok", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: {
        status: "ok",
      },
    });
  });

  it("GET /non-existent-route should return 404 Not Found", async () => {
    const response = await request(app).get("/non-existent-route");

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });
});
