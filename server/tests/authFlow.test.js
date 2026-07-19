import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../app.js";
import Business from "../models/Business.js";
import User from "../models/User.js";

const buildRegistrationPayload = (overrides = {}) => ({
  fullName: "Rahul Sharma",
  businessName: "Acme Dental",
  email: "rahul@example.com",
  mobile: "+919876543210",
  password: "Password123",
  ...overrides,
});

const expectNoPasswordFields = (body) => {
  expect(body.user).not.toHaveProperty("password");
  expect(body.business).not.toHaveProperty("password");
};

describe("Authentication flow", () => {
  it("registers a business user and creates linked user and business records", async () => {
    const payload = buildRegistrationPayload();

    const response = await request(app)
      .post("/api/auth/register")
      .send(payload);

    expect(response.status).toBe(201);
    expect(response.body).toEqual(
      expect.objectContaining({
        token: expect.any(String),
        user: expect.objectContaining({
          name: payload.fullName,
          email: payload.email.toLowerCase(),
          mobile: payload.mobile,
          role: "business",
        }),
        business: expect.objectContaining({
          businessName: payload.businessName,
          accountStatus: "active",
        }),
      }),
    );
    expectNoPasswordFields(response.body);

    const users = await User.find().lean();
    const businesses = await Business.find().lean();

    expect(users).toHaveLength(1);
    expect(businesses).toHaveLength(1);

    const [user] = users;
    const [business] = businesses;

    expect(String(user.businessId)).toBe(String(business._id));
    expect(String(business.userId)).toBe(String(user._id));
    expect(user.role).toBe("business");
    expect(business.accountStatus).toBe("active");
  });

  it("stores a hashed password that matches the original password", async () => {
    const payload = buildRegistrationPayload();

    const response = await request(app)
      .post("/api/auth/register")
      .send(payload);

    expect(response.status).toBe(201);

    const storedUser = await User.findOne({
      email: payload.email.toLowerCase(),
    });

    expect(storedUser).not.toBeNull();
    expect(storedUser.password).not.toBe(payload.password);
    await expect(
      bcrypt.compare(payload.password, storedUser.password),
    ).resolves.toBe(true);
  });

  it("rejects duplicate email registration even with different capitalization", async () => {
    const payload = buildRegistrationPayload();

    const firstResponse = await request(app)
      .post("/api/auth/register")
      .send(payload);

    expect(firstResponse.status).toBe(201);

    const duplicateResponse = await request(app)
      .post("/api/auth/register")
      .send(
        buildRegistrationPayload({
          email: "RAHUL@EXAMPLE.COM",
          mobile: "+919876543211",
        }),
      );

    expect(duplicateResponse.status).toBe(409);
    expect(duplicateResponse.body).toEqual({
      message: "User with this email or mobile already exists",
    });

    expect(await User.countDocuments()).toBe(1);
    expect(await Business.countDocuments()).toBe(1);
  });

  it("rejects duplicate mobile registration without creating partial records", async () => {
    const payload = buildRegistrationPayload();

    const firstResponse = await request(app)
      .post("/api/auth/register")
      .send(payload);

    expect(firstResponse.status).toBe(201);

    const duplicateResponse = await request(app)
      .post("/api/auth/register")
      .send(
        buildRegistrationPayload({
          email: "second@example.com",
        }),
      );

    expect(duplicateResponse.status).toBe(409);
    expect(duplicateResponse.body).toEqual({
      message: "User with this email or mobile already exists",
    });

    const users = await User.find().lean();
    const businesses = await Business.find().lean();

    expect(users).toHaveLength(1);
    expect(businesses).toHaveLength(1);
    expect(String(users[0].businessId)).toBe(
      String(businesses[0]._id),
    );
    expect(String(businesses[0].userId)).toBe(
      String(users[0]._id),
    );
  });

  it("logs in a business user and returns a verifiable JWT", async () => {
    const password = "Password123";
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: "Login User",
      email: "login@example.com",
      mobile: "+919876543212",
      password: hashedPassword,
      role: "business",
    });
    const business = await Business.create({
      userId: user._id,
      businessName: "Login Business",
      slug: "login-business",
    });

    user.businessId = business._id;
    await user.save();

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        emailOrMobile: "login@example.com",
        password,
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        token: expect.any(String),
        user: expect.objectContaining({
          _id: String(user._id),
          email: "login@example.com",
          mobile: "+919876543212",
          businessId: String(business._id),
          role: "business",
        }),
        business: expect.objectContaining({
          _id: String(business._id),
          businessName: "Login Business",
        }),
      }),
    );
    expectNoPasswordFields(response.body);

    const decoded = jwt.verify(
      response.body.token,
      process.env.JWT_SECRET,
    );

    expect(String(decoded.userId)).toBe(String(user._id));
  });

  it("rejects login with an incorrect password", async () => {
    const user = await User.create({
      name: "Wrong Password User",
      email: "wrongpass@example.com",
      mobile: "+919876543213",
      password: await bcrypt.hash("Password123", 10),
      role: "business",
    });
    const business = await Business.create({
      userId: user._id,
      businessName: "Wrong Password Business",
      slug: "wrong-password-business",
    });

    user.businessId = business._id;
    await user.save();

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        emailOrMobile: "wrongpass@example.com",
        password: "WrongPassword123",
      });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      message: "Invalid credentials",
    });
    expect(response.body).not.toHaveProperty("token");
  });

  it("rejects login for an unknown email without returning a token", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        emailOrMobile: "unknown@example.com",
        password: "Password123",
      });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      message: "Invalid credentials",
    });
    expect(response.body).not.toHaveProperty("token");
  });



// This test is checking for a rollback/integrity problem during registration.

// It means:

// 1. A user registers successfully once.
// 2. A second registration is attempted with a duplicate mobile number, so it should fail with `409`.
// 3. After that failure, the database is inspected to make sure the failed request did not partially create anything.

// What the assertions verify:

// - `users` has length `1`
//   Only the first successful user exists.
// - `businesses` has length `1`
//   Only the first successful business exists.
// - Every user points to a real business through `user.businessId`
//   No user is left referencing a missing business.
// - Every business points to a real user through `business.userId`
//   No business is left referencing a missing user.

// So “does not leave orphan records” means:

// - no extra `Business` document was created when the second registration failed
// - no extra `User` document was created when the second registration failed
// - no broken relationship exists where one side was created but the other side was not

// In short: if registration fails midway, the DB should stay clean and consistent.

  it("does not leave orphan records when registration fails on a duplicate mobile", async () => {
    const payload = buildRegistrationPayload();

    const firstResponse = await request(app)
      .post("/api/auth/register")
      .send(payload);

    expect(firstResponse.status).toBe(201);

    const failedResponse = await request(app)
      .post("/api/auth/register")
      .send(
        buildRegistrationPayload({
          email: "orphan-check@example.com",
          businessName: "Second Business",
        }),
      );

    expect(failedResponse.status).toBe(409);
    expect(failedResponse.body).toEqual({
      message: "User with this email or mobile already exists",
    });

    const users = await User.find().lean();
    const businesses = await Business.find().lean();

    expect(users).toHaveLength(1);
    expect(businesses).toHaveLength(1);
    expect(
      users.every((storedUser) =>
        businesses.some(
          (business) =>
            String(business._id) === String(storedUser.businessId),
        ),
      ),
    ).toBe(true);
    expect(
      businesses.every((storedBusiness) =>
        users.some(
          (storedUser) =>
            String(storedUser._id) === String(storedBusiness.userId),
        ),
      ),
    ).toBe(true);
  });
});
