// server/api-handler.ts
import "dotenv/config";
import express2 from "express";
import cors from "cors";

// server/routes.ts
import express from "express";
import { createServer } from "http";

// server/storage.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { and, desc, eq, inArray } from "drizzle-orm";

// shared/schema.ts
import {
  pgTable,
  text,
  serial,
  integer,
  boolean,
  timestamp,
  varchar,
  uuid,
  doublePrecision
} from "drizzle-orm/pg-core";
import { z } from "zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  isEmailConfirmed: boolean("is_email_confirmed").default(false).notNull(),
  emailConfirmationToken: varchar("email_confirmation_token", { length: 255 }),
  emailConfirmationTokenExpiry: timestamp("email_confirmation_token_expiry"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  brand: text("brand"),
  netVolume: text("net_volume"),
  vintage: text("vintage"),
  wineType: text("wine_type"),
  sugarContent: text("sugar_content"),
  appellation: text("appellation"),
  alcoholContent: text("alcohol_content"),
  packagingGases: text("packaging_gases"),
  portionSize: text("portion_size"),
  kcal: text("kcal"),
  kj: text("kj"),
  fat: text("fat"),
  carbohydrates: text("carbohydrates"),
  saturates: text("saturates"),
  sugar: text("sugar"),
  protein: text("protein"),
  salt: text("salt"),
  pregnancyWarning: boolean("pregnancy_warning").default(false),
  ageWarning: boolean("age_warning").default(false),
  drivingWarning: boolean("driving_warning").default(false),
  organic: boolean("organic").default(false),
  vegetarian: boolean("vegetarian").default(false),
  vegan: boolean("vegan").default(false),
  operatorType: text("operator_type"),
  operatorName: text("operator_name"),
  operatorAddress: text("operator_address"),
  operatorInfo: text("operator_info"),
  countryOfOrigin: text("country_of_origin"),
  manufacturingLocation: text("manufacturing_location"),
  manufacturingAddress: text("manufacturing_address"),
  manufacturingCity: text("manufacturing_city"),
  manufacturingState: text("manufacturing_state"),
  manufacturingCountry: text("manufacturing_country"),
  manufacturingPostalCode: text("manufacturing_postal_code"),
  manufacturingLatitude: text("manufacturing_latitude"),
  manufacturingLongitude: text("manufacturing_longitude"),
  latitude: text("latitude"),
  longitude: text("longitude"),
  sku: text("sku"),
  ean: text("ean"),
  externalLink: text("external_link"),
  redirectLink: text("redirect_link"),
  imageUrl: text("image_url"),
  qrUrl: text("qr_url"),
  ingredientIds: integer("ingredient_ids").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: integer("created_by"),
  ownerId: uuid("owner_id")
});
var ingredients = pgTable("ingredients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category"),
  eNumber: text("e_number"),
  allergens: text("allergens").array(),
  details: text("details"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: integer("created_by"),
  ownerId: uuid("owner_id")
});
var scans = pgTable("scans", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  lat: doublePrecision("lat").notNull(),
  lng: doublePrecision("lng").notNull(),
  source: text("source"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var insertScanSchema = z.object({
  productId: z.number().int().positive(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  source: z.string().max(50).optional()
});
var insertUserSchema = z.object({
  username: z.string(),
  email: z.string().email(),
  password: z.string()
});
var loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
});
var registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});
var insertProductSchema = z.object({
  name: z.string(),
  brand: z.string().optional(),
  netVolume: z.string().optional(),
  vintage: z.string().optional(),
  wineType: z.string().optional(),
  sugarContent: z.string().optional(),
  appellation: z.string().optional(),
  alcoholContent: z.string().optional(),
  packagingGases: z.string().optional(),
  portionSize: z.string().optional(),
  kcal: z.string().optional(),
  kj: z.string().optional(),
  fat: z.string().optional(),
  carbohydrates: z.string().optional(),
  saturates: z.string().optional(),
  sugar: z.string().optional(),
  protein: z.string().optional(),
  salt: z.string().optional(),
  pregnancyWarning: z.boolean().optional(),
  ageWarning: z.boolean().optional(),
  drivingWarning: z.boolean().optional(),
  organic: z.boolean().optional(),
  vegetarian: z.boolean().optional(),
  vegan: z.boolean().optional(),
  operatorType: z.string().optional(),
  operatorName: z.string().optional(),
  operatorAddress: z.string().optional(),
  operatorInfo: z.string().optional(),
  countryOfOrigin: z.string().optional(),
  manufacturingLocation: z.string().optional(),
  manufacturingAddress: z.string().optional(),
  manufacturingCity: z.string().optional(),
  manufacturingState: z.string().optional(),
  manufacturingCountry: z.string().optional(),
  manufacturingPostalCode: z.string().optional(),
  manufacturingLatitude: z.union([z.string(), z.number()]).transform((val) => String(val)).optional(),
  manufacturingLongitude: z.union([z.string(), z.number()]).transform((val) => String(val)).optional(),
  latitude: z.union([z.string(), z.number()]).transform((val) => String(val)).optional(),
  longitude: z.union([z.string(), z.number()]).transform((val) => String(val)).optional(),
  sku: z.string().optional(),
  ean: z.string().optional(),
  externalLink: z.string().optional(),
  redirectLink: z.string().optional(),
  imageUrl: z.string().optional(),
  qrUrl: z.string().optional().nullable(),
  ingredientIds: z.array(z.number().int()).optional(),
  createdBy: z.number().optional(),
  ownerId: z.string().uuid().optional()
});
var importProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  brand: z.string().optional(),
  netVolume: z.string().optional(),
  vintage: z.union([z.string(), z.number()]).transform((val) => String(val)).optional(),
  wineType: z.string().optional(),
  sugarContent: z.string().optional(),
  appellation: z.string().optional(),
  alcoholContent: z.union([z.string(), z.number()]).transform((val) => String(val)).optional(),
  packagingGases: z.string().optional(),
  portionSize: z.string().optional(),
  kcal: z.union([z.string(), z.number()]).transform((val) => String(val)).optional(),
  kj: z.union([z.string(), z.number()]).transform((val) => String(val)).optional(),
  fat: z.union([z.string(), z.number()]).transform((val) => String(val)).optional(),
  carbohydrates: z.union([z.string(), z.number()]).transform((val) => String(val)).optional(),
  saturates: z.union([z.string(), z.number()]).transform(String).optional(),
  sugar: z.union([z.string(), z.number()]).transform(String).optional(),
  protein: z.union([z.string(), z.number()]).transform(String).optional(),
  salt: z.union([z.string(), z.number()]).transform(String).optional(),
  pregnancyWarning: z.boolean().default(false),
  ageWarning: z.boolean().default(false),
  drivingWarning: z.boolean().default(false),
  organic: z.boolean().default(false),
  vegetarian: z.boolean().default(false),
  vegan: z.boolean().default(false),
  operatorType: z.string().optional(),
  operatorName: z.string().optional(),
  operatorAddress: z.string().optional(),
  operatorInfo: z.string().optional(),
  countryOfOrigin: z.string().optional(),
  manufacturingLocation: z.string().optional(),
  manufacturingAddress: z.string().optional(),
  manufacturingCity: z.string().optional(),
  manufacturingState: z.string().optional(),
  manufacturingCountry: z.string().optional(),
  manufacturingPostalCode: z.string().optional(),
  manufacturingLatitude: z.union([z.string(), z.number()]).transform((val) => String(val)).optional(),
  manufacturingLongitude: z.union([z.string(), z.number()]).transform((val) => String(val)).optional(),
  latitude: z.union([z.string(), z.number()]).transform((val) => String(val)).optional(),
  longitude: z.union([z.string(), z.number()]).transform((val) => String(val)).optional(),
  sku: z.union([z.string(), z.number()]).transform((val) => String(val)).optional(),
  ean: z.string().optional(),
  externalLink: z.string().optional(),
  redirectLink: z.string().optional(),
  imageUrl: z.string().optional(),
  qrUrl: z.string().optional().nullable(),
  createdBy: z.number().optional(),
  ownerId: z.string().uuid().optional()
});
var insertIngredientSchema = z.object({
  name: z.string(),
  category: z.string().optional(),
  eNumber: z.string().optional(),
  allergens: z.array(z.string()).optional(),
  details: z.string().optional(),
  createdBy: z.number().optional(),
  ownerId: z.string().uuid().optional()
});

// server/storage.ts
var connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/postgres";
var client = postgres(connectionString, { max: 1, idle_timeout: 20, connect_timeout: 10, ssl: process.env.DATABASE_URL ? "require" : void 0 });
var db = drizzle(client);
var DatabaseStorage = class {
  // User methods
  async getUser(id) {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }
  async getUserByUsername(username) {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }
  async getUserByEmail(email) {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }
  async createUser(insertUser) {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }
  async updateUser(id, updates) {
    const result = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return result[0];
  }
  // Product methods
  async getProducts() {
    return await db.select().from(products).orderBy(products.name);
  }
  async getProduct(id, ownerId) {
    const result = await db.select().from(products).where(and(eq(products.id, id), eq(products.ownerId, ownerId))).limit(1);
    return result[0];
  }
  async getPublicProduct(id) {
    const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
    return result[0];
  }
  async createProduct(product, baseUrl) {
    const result = await db.insert(products).values(product).returning();
    const created = result[0];
    if (created && !created.qrUrl && baseUrl) {
      const qrUrl = `${baseUrl.replace(/\/$/, "")}/qr/product/${created.id}?src=qr`;
      const [updated] = await db.update(products).set({ qrUrl }).where(eq(products.id, created.id)).returning();
      return updated || { ...created, qrUrl };
    }
    return created;
  }
  async updateProduct(id, ownerId, product) {
    const { qrUrl, ...updates } = product;
    const updateData = qrUrl ? { ...updates, qrUrl } : updates;
    const result = await db.update(products).set(updateData).where(and(eq(products.id, id), eq(products.ownerId, ownerId))).returning();
    return result[0];
  }
  async deleteProduct(id, ownerId) {
    const result = await db.delete(products).where(and(eq(products.id, id), eq(products.ownerId, ownerId))).returning();
    return result.length > 0;
  }
  // Ingredient methods
  async getIngredients(ownerId) {
    return await db.select().from(ingredients).where(eq(ingredients.ownerId, ownerId)).orderBy(ingredients.name);
  }
  async getIngredient(id, ownerId) {
    const result = await db.select().from(ingredients).where(and(eq(ingredients.id, id), eq(ingredients.ownerId, ownerId))).limit(1);
    return result[0];
  }
  async createIngredient(ingredient) {
    const result = await db.insert(ingredients).values(ingredient).returning();
    return result[0];
  }
  async updateIngredient(id, ownerId, ingredient) {
    const result = await db.update(ingredients).set(ingredient).where(and(eq(ingredients.id, id), eq(ingredients.ownerId, ownerId))).returning();
    return result[0];
  }
  // Keeps the order the user picked, which is the order printed on the label
  async getLabelIngredients(ids) {
    if (!ids?.length) return [];
    const rows = await db.select({
      id: ingredients.id,
      name: ingredients.name,
      eNumber: ingredients.eNumber,
      allergens: ingredients.allergens,
      category: ingredients.category
    }).from(ingredients).where(inArray(ingredients.id, ids));
    return ids.flatMap((id) => rows.filter((r) => r.id === id));
  }
  async createScan(scan) {
    const result = await db.insert(scans).values(scan).returning();
    return result[0];
  }
  async getScans() {
    return await db.select({
      id: scans.id,
      productId: scans.productId,
      productName: products.name,
      lat: scans.lat,
      lng: scans.lng,
      source: scans.source,
      createdAt: scans.createdAt
    }).from(scans).leftJoin(products, eq(scans.productId, products.id)).orderBy(desc(scans.createdAt));
  }
  async deleteIngredient(id, ownerId) {
    const result = await db.delete(ingredients).where(and(eq(ingredients.id, id), eq(ingredients.ownerId, ownerId))).returning();
    return result.length > 0;
  }
};
var storage = new DatabaseStorage();

// server/routes.ts
import multer from "multer";
import { put } from "@vercel/blob";
import path from "path";
import fs from "fs";
import * as XLSX from "xlsx";
import { ZodError } from "zod";

// server/supabase-auth.ts
import { createClient } from "@supabase/supabase-js";
var supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
var supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
var supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey, {
  auth: { autoRefreshToken: false, persistSession: false }
}) : null;
async function requireAuth(req, res, next) {
  if (!supabase) {
    return res.status(503).json({ error: "Authentication is not configured on the server" });
  }
  const authorization = req.header("authorization");
  const match = authorization?.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return res.status(401).json({ error: "Authentication required" });
  }
  try {
    const { data, error } = await supabase.auth.getUser(match[1]);
    if (error || !data.user) {
      return res.status(401).json({ error: "Invalid or expired access token" });
    }
    req.authUser = {
      id: data.user.id,
      email: data.user.email
    };
    return next();
  } catch {
    return res.status(503).json({ error: "Authentication service is unavailable" });
  }
}
function getAuthenticatedUserId(req) {
  return req.authUser.id;
}

// server/routes.ts
var uploadsDir = process.env.VERCEL ? path.join("/tmp", "uploads") : path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  try {
    fs.mkdirSync(uploadsDir, { recursive: true });
  } catch (err) {
    console.warn(err);
  }
}
var storage_multer = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  }
});
var upload = multer({
  storage: storage_multer,
  fileFilter: function(req, file, cb) {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Not an image! Please upload only images."));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024
    // 5MB limit
  }
});
var uploadExcel = multer({
  storage: multer.memoryStorage(),
  fileFilter: function(req, file, cb) {
    console.log("Uploaded file mimetype:", file.mimetype);
    console.log("Original filename:", file.originalname);
    const allowedMimes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
      "text/plain",
      "application/csv",
      "application/octet-stream"
      // Allow this and check file extension
    ];
    const allowedExtensions = [".xlsx", ".xls", ".csv"];
    const fileExtension = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf("."));
    if (allowedMimes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Not an Excel/CSV file! Received: ${file.mimetype} with extension ${fileExtension}. Please upload only Excel or CSV files.`
        )
      );
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024
    // 10MB limit
  }
});
var uploadBlob = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Please upload an image file."));
  },
  limits: { fileSize: 5 * 1024 * 1024 }
});
function getRequestBaseUrl(req) {
  const clientBase = req.body?.baseUrl;
  if (typeof clientBase === "string" && clientBase.trim()) {
    return clientBase.trim().replace(/\/$/, "");
  }
  const origin = req.headers.origin || req.headers.referer;
  if (origin && typeof origin === "string") {
    try {
      const u = new URL(origin);
      return `${u.protocol}//${u.host}`;
    } catch {
    }
  }
  if (process.env.BASE_URL) {
    return process.env.BASE_URL.replace(/\/$/, "");
  }
  if (process.env.RENDER_EXTERNAL_URL) {
    return process.env.RENDER_EXTERNAL_URL.replace(/\/$/, "");
  }
  return "https://wine-label-management-system.onrender.com";
}
async function registerRoutes(app2) {
  app2.use("/uploads", express.static(uploadsDir));
  app2.get("/api/config", (req, res) => {
    res.json({
      supabaseUrl: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY,
      // Render sets RENDER_EXTERNAL_URL to the service's public https URL
      publicUrl: process.env.BASE_URL || process.env.RENDER_EXTERNAL_URL
    });
  });
  app2.get("/api/health", (_req, res) => res.json({ status: "ok" }));
  app2.get("/api/geolocation/detect", async (req, res) => {
    try {
      let ip = req.headers["x-forwarded-for"];
      if (Array.isArray(ip)) ip = ip[0];
      if (typeof ip === "string" && ip.includes(",")) ip = ip.split(",")[0].trim();
      const isLocal = !ip || ip === "::1" || ip === "127.0.0.1" || ip.startsWith("192.168.") || ip.startsWith("10.");
      const ipQueryUrl = isLocal ? "https://ipwho.is/" : `https://ipwho.is/${encodeURIComponent(ip)}`;
      try {
        const geoRes = await fetch(ipQueryUrl, { signal: AbortSignal.timeout(6e3) });
        const data = await geoRes.json();
        if (data && data.success !== false && (data.latitude || data.city)) {
          return res.json({
            success: true,
            latitude: data.latitude != null ? String(data.latitude) : "",
            longitude: data.longitude != null ? String(data.longitude) : "",
            city: data.city || "",
            state: data.region || "",
            country: data.country || "",
            postalCode: data.postal || "",
            address: [data.city, data.region, data.country].filter(Boolean).join(", "),
            locationName: data.city ? `${data.city} Facility` : "",
            source: "ip"
          });
        }
      } catch (e) {
        console.warn("ipwho.is failed, trying ipapi.co fallback:", e);
      }
      const fallbackRes = await fetch("https://ipapi.co/json/", {
        signal: AbortSignal.timeout(6e3)
      });
      if (fallbackRes.ok) {
        const fbData = await fallbackRes.json();
        return res.json({
          success: true,
          latitude: fbData.latitude != null ? String(fbData.latitude) : "",
          longitude: fbData.longitude != null ? String(fbData.longitude) : "",
          city: fbData.city || "",
          state: fbData.region || "",
          country: fbData.country_name || fbData.country || "",
          postalCode: fbData.postal || "",
          address: [fbData.city, fbData.region, fbData.country_name].filter(Boolean).join(", "),
          locationName: fbData.city ? `${fbData.city} Facility` : "",
          source: "ip"
        });
      }
      return res.status(404).json({ success: false, error: "Could not determine location from IP" });
    } catch (err) {
      console.error("Geo detect error:", err);
      return res.status(500).json({ success: false, error: err.message || "Geolocation detection failed" });
    }
  });
  app2.get("/api/geolocation/reverse", async (req, res) => {
    try {
      const lat = req.query.lat;
      const lon = req.query.lon;
      if (!lat || !lon) {
        return res.status(400).json({ error: "lat and lon query parameters required" });
      }
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`,
        {
          headers: {
            "User-Agent": "OpenELabel-App/1.0 (contact@openelabel.org)"
          },
          signal: AbortSignal.timeout(8e3)
        }
      );
      if (!response.ok) {
        return res.status(502).json({ error: "Reverse geocode service unavailable" });
      }
      const data = await response.json();
      const addr = data.address || {};
      const city = addr.city || addr.town || addr.village || addr.municipality || addr.county || "";
      const state = addr.state || addr.region || "";
      const country = addr.country || "";
      const postalCode = addr.postcode || "";
      const road = addr.road || addr.street || addr.pedestrian || "";
      const houseNumber = addr.house_number || "";
      const street = [houseNumber, road].filter(Boolean).join(" ");
      const formattedAddress = [street, city, state, postalCode, country].filter(Boolean).join(", ") || data.display_name || "";
      const locationName = addr.winery || addr.amenity || addr.building || (city ? `${city} Winery / Production Site` : "");
      return res.json({
        success: true,
        latitude: lat,
        longitude: lon,
        locationName,
        address: formattedAddress,
        city,
        state,
        country,
        postalCode
      });
    } catch (err) {
      console.error("Reverse geocode error:", err);
      return res.status(500).json({ error: err.message || "Failed to reverse geocode" });
    }
  });
  app2.get("/api/geolocation/search", async (req, res) => {
    try {
      const query = req.query.q;
      if (!query || !query.trim()) {
        return res.status(400).json({ error: "q query parameter required" });
      }
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&limit=1`,
        {
          headers: {
            "User-Agent": "OpenELabel-App/1.0 (contact@openelabel.org)"
          },
          signal: AbortSignal.timeout(8e3)
        }
      );
      if (!response.ok) {
        return res.status(502).json({ error: "Geocoding service unavailable" });
      }
      const results = await response.json();
      if (!Array.isArray(results) || results.length === 0) {
        return res.status(404).json({ error: "Location not found" });
      }
      const item = results[0];
      return res.json({
        success: true,
        latitude: item.lat,
        longitude: item.lon,
        displayName: item.display_name
      });
    } catch (err) {
      console.error("Geocoding search error:", err);
      return res.status(500).json({ error: err.message || "Failed to search location" });
    }
  });
  app2.post("/api/get-url", requireAuth, uploadBlob.single("file"), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No image file uploaded" });
    if (!process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN === "token") {
      const filename = `image-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(req.file.originalname)}`;
      await fs.promises.writeFile(path.join(uploadsDir, filename), req.file.buffer);
      return res.status(200).json({ url: `/uploads/${filename}` });
    }
    try {
      const blob = await put(`products/${Date.now()}-${req.file.originalname}`, req.file.buffer, {
        access: "public",
        token: process.env.BLOB_READ_WRITE_TOKEN
      });
      return res.status(200).json({ url: blob.url });
    } catch (error) {
      console.error("Image upload error:", error);
      return res.status(500).json({ error: "Failed to upload image" });
    }
  });
  app2.get("/api/products", requireAuth, async (req, res) => {
    try {
      const userId = getAuthenticatedUserId(req);
      const products2 = await storage.getProducts();
      res.json(
        products2.map(({ ownerId, createdBy, ...product }) => ({
          ...product,
          canEdit: ownerId === userId
        }))
      );
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });
  app2.get("/api/products/export", requireAuth, async (req, res) => {
    try {
      console.log("Starting products export...");
      const products2 = await storage.getProducts();
      console.log(`Found ${products2.length} products to export`);
      const exportData = products2.map((product) => ({
        Name: product.name,
        "Net Volume": product.netVolume,
        Vintage: product.vintage,
        Type: product.wineType,
        "Sugar Content": product.sugarContent,
        Appellation: product.appellation,
        SKU: product.sku,
        "Manufacturing Location": product.manufacturingLocation,
        "Manufacturing Address": product.manufacturingAddress,
        "Manufacturing City": product.manufacturingCity,
        "Manufacturing Country": product.manufacturingCountry,
        Latitude: product.latitude || product.manufacturingLatitude,
        Longitude: product.longitude || product.manufacturingLongitude
      }));
      console.log("Creating Excel worksheet...");
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
      console.log("Generating Excel buffer...");
      const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
      console.log(`Buffer size: ${buffer.length} bytes`);
      res.setHeader("Content-Disposition", "attachment; filename=products.xlsx");
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.send(buffer);
      console.log("Export completed successfully");
    } catch (error) {
      console.error("Export error details:", error);
      res.status(500).json({ error: "Failed to export products", details: error?.message || String(error) });
    }
  });
  app2.get("/api/public/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getPublicProduct(id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      const { createdBy, ownerId, ...publicProduct } = product;
      const ingredients2 = await storage.getLabelIngredients(product.ingredientIds);
      res.json({ ...publicProduct, ingredients: ingredients2 });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });
  const scanHits = /* @__PURE__ */ new Map();
  app2.post("/api/public/scans", async (req, res) => {
    const ip = req.ip || "unknown";
    const now = Date.now();
    const hit = scanHits.get(ip);
    if (!hit || hit.reset < now) {
      if (scanHits.size > 1e4) scanHits.clear();
      scanHits.set(ip, { count: 1, reset: now + 6e4 });
    } else if (++hit.count > 60) {
      return res.status(429).json({ error: "Too many scans, try again in a minute" });
    }
    const parsed = insertScanSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid scan", details: parsed.error.issues });
    }
    try {
      if (!await storage.getPublicProduct(parsed.data.productId)) {
        return res.status(404).json({ error: "Product not found" });
      }
      const scan = await storage.createScan({ source: null, ...parsed.data });
      return res.status(201).json({ id: scan.id });
    } catch (error) {
      console.error("Scan save failed:", error);
      return res.status(500).json({ error: "Failed to save scan" });
    }
  });
  app2.get("/api/scans.geojson", async (req, res) => {
    const key = process.env.SCANS_EXPORT_KEY;
    if (!key) return res.status(404).json({ error: "Scan export is disabled (set SCANS_EXPORT_KEY)" });
    if (req.query.key !== key) return res.status(401).json({ error: "Invalid export key" });
    try {
      const rows = await storage.getScans();
      return res.json({
        type: "FeatureCollection",
        features: rows.map(({ lat, lng, ...props }) => ({
          type: "Feature",
          geometry: { type: "Point", coordinates: [lng, lat] },
          properties: props
        }))
      });
    } catch (error) {
      console.error("Scan export failed:", error);
      return res.status(500).json({ error: "Failed to export scans" });
    }
  });
  app2.get("/api/products/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = getAuthenticatedUserId(req);
      const product = await storage.getPublicProduct(id);
      if (!product) return res.status(404).json({ error: "Product not found" });
      const { ownerId, createdBy, ...visibleProduct } = product;
      const ingredients2 = await storage.getLabelIngredients(product.ingredientIds);
      return res.json({ ...visibleProduct, ingredients: ingredients2, canEdit: ownerId === userId });
    } catch {
      return res.status(500).json({ error: "Failed to fetch product" });
    }
  });
  app2.post("/api/products", requireAuth, async (req, res) => {
    let validatedData;
    try {
      validatedData = insertProductSchema.omit({ createdBy: true, ownerId: true }).parse(req.body);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Invalid product data", details: error.issues });
      }
      console.error("Unexpected product validation error:", error);
      return res.status(500).json({ error: "Failed to validate product data" });
    }
    if (validatedData.latitude && !validatedData.manufacturingLatitude) {
      validatedData.manufacturingLatitude = validatedData.latitude;
    } else if (validatedData.manufacturingLatitude && !validatedData.latitude) {
      validatedData.latitude = validatedData.manufacturingLatitude;
    }
    if (validatedData.longitude && !validatedData.manufacturingLongitude) {
      validatedData.manufacturingLongitude = validatedData.longitude;
    } else if (validatedData.manufacturingLongitude && !validatedData.longitude) {
      validatedData.longitude = validatedData.manufacturingLongitude;
    }
    try {
      const baseUrl = getRequestBaseUrl(req);
      const product = await storage.createProduct(
        {
          ...validatedData,
          createdBy: void 0,
          ownerId: getAuthenticatedUserId(req)
        },
        baseUrl
      );
      return res.status(201).json(product);
    } catch (error) {
      console.error("Product creation failed:", error);
      return res.status(500).json({ error: "Failed to create product" });
    }
  });
  app2.put("/api/products/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertProductSchema.partial().omit({ createdBy: true, ownerId: true, qrUrl: true }).parse(req.body);
      if (validatedData.latitude && !validatedData.manufacturingLatitude) {
        validatedData.manufacturingLatitude = validatedData.latitude;
      } else if (validatedData.manufacturingLatitude && !validatedData.latitude) {
        validatedData.latitude = validatedData.manufacturingLatitude;
      }
      if (validatedData.longitude && !validatedData.manufacturingLongitude) {
        validatedData.manufacturingLongitude = validatedData.longitude;
      } else if (validatedData.manufacturingLongitude && !validatedData.longitude) {
        validatedData.longitude = validatedData.manufacturingLongitude;
      }
      const product = await storage.updateProduct(id, getAuthenticatedUserId(req), validatedData);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(400).json({ error: "Invalid product data", details: error });
    }
  });
  app2.delete("/api/products/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteProduct(id, getAuthenticatedUserId(req));
      if (!success) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete product" });
    }
  });
  app2.post("/api/products/:id/image", requireAuth, upload.single("image"), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const ownerId = getAuthenticatedUserId(req);
      const product = await storage.getProduct(id, ownerId);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }
      const imageUrl = `/uploads/${req.file.filename}`;
      const updatedProduct = await storage.updateProduct(id, ownerId, { imageUrl });
      if (!updatedProduct) {
        return res.status(500).json({ error: "Failed to update product" });
      }
      res.json({ imageUrl, message: "Image uploaded successfully" });
    } catch (error) {
      console.error("Image upload error:", error);
      res.status(500).json({ error: "Failed to upload image" });
    }
  });
  app2.delete("/api/products/:id/image", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const ownerId = getAuthenticatedUserId(req);
      const product = await storage.getProduct(id, ownerId);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      if (product.imageUrl) {
        const filename = path.basename(product.imageUrl);
        const imagePath = path.join(uploadsDir, filename);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
      const updatedProduct = await storage.updateProduct(id, ownerId, { imageUrl: null });
      if (!updatedProduct) {
        return res.status(500).json({ error: "Failed to update product" });
      }
      res.json({ message: "Image deleted successfully" });
    } catch (error) {
      console.error("Image delete error:", error);
      res.status(500).json({ error: "Failed to delete image" });
    }
  });
  app2.get("/api/ingredients", requireAuth, async (req, res) => {
    try {
      const ingredients2 = await storage.getIngredients(getAuthenticatedUserId(req));
      res.json(ingredients2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch ingredients" });
    }
  });
  app2.get("/api/ingredients/export", requireAuth, async (req, res) => {
    try {
      console.log("Starting ingredients export...");
      const ingredients2 = await storage.getIngredients(getAuthenticatedUserId(req));
      console.log(`Found ${ingredients2.length} ingredients to export`);
      const exportData = ingredients2.map((ingredient) => ({
        Name: ingredient.name,
        Category: ingredient.category,
        "E Number": ingredient.eNumber,
        Allergens: Array.isArray(ingredient.allergens) ? ingredient.allergens.join(", ") : ingredient.allergens,
        Details: ingredient.details
      }));
      console.log("Creating Excel worksheet...");
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Ingredients");
      console.log("Generating Excel buffer...");
      const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
      console.log(`Buffer size: ${buffer.length} bytes`);
      res.setHeader("Content-Disposition", "attachment; filename=ingredients.xlsx");
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.send(buffer);
      console.log("Export completed successfully");
    } catch (error) {
      console.error("Export error details:", error);
      console.error("Error stack:", error?.stack);
      res.status(500).json({ error: "Failed to export ingredients", details: error?.message || String(error) });
    }
  });
  app2.get("/api/ingredients/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const ingredient = await storage.getIngredient(id, getAuthenticatedUserId(req));
      if (!ingredient) {
        return res.status(404).json({ error: "Ingredient not found" });
      }
      res.json(ingredient);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch ingredient" });
    }
  });
  app2.post("/api/ingredients", requireAuth, async (req, res) => {
    try {
      const validatedData = insertIngredientSchema.omit({ createdBy: true, ownerId: true }).parse(req.body);
      const ingredient = await storage.createIngredient({
        ...validatedData,
        createdBy: void 0,
        ownerId: getAuthenticatedUserId(req)
      });
      res.status(201).json(ingredient);
    } catch (error) {
      res.status(400).json({ error: "Invalid ingredient data", details: error });
    }
  });
  app2.put("/api/ingredients/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertIngredientSchema.partial().omit({ createdBy: true, ownerId: true }).parse(req.body);
      const ingredient = await storage.updateIngredient(id, getAuthenticatedUserId(req), validatedData);
      if (!ingredient) {
        return res.status(404).json({ error: "Ingredient not found" });
      }
      res.json(ingredient);
    } catch (error) {
      res.status(400).json({ error: "Invalid ingredient data", details: error });
    }
  });
  app2.delete("/api/ingredients/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteIngredient(id, getAuthenticatedUserId(req));
      if (!success) {
        return res.status(404).json({ error: "Ingredient not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete ingredient" });
    }
  });
  app2.post("/api/products/import", requireAuth, uploadExcel.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      console.log("Processing import file:", req.file.originalname);
      const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);
      console.log(`Found ${data.length} rows to process`);
      console.log("Available sheets:", workbook.SheetNames);
      console.log("Using sheet:", sheetName);
      console.log("Sample row data:", data[0]);
      console.log("All column names from first row:", Object.keys(data[0] || {}));
      const importedProducts = [];
      const errors = [];
      for (let i = 0; i < data.length; i++) {
        try {
          const row = data[i];
          if (!row || Object.keys(row).length === 0 || Object.values(row).every((val) => !val)) {
            console.log(`Skipping empty row ${i + 2}`);
            continue;
          }
          const productData = {
            name: row.name || row.Name || row.NAME || row["Product Name"] || row["product name"],
            netVolume: row.netVolume || row["Net Volume"] || row.NET_VOLUME || row.netvolume || row["Volume"] || row.volume,
            vintage: row.vintage || row.Vintage || row.VINTAGE || row["Year"] || row.year,
            wineType: row.wineType || row["Wine Type"] || row.Type || row.type || row.WINE_TYPE || row.winetype || row["Wine Category"] || row["wine category"],
            sugarContent: row.sugarContent || row["Sugar Content"] || row.SUGAR_CONTENT || row.sugarcontent || row["Sugar"] || row.sugar,
            appellation: row.appellation || row.Appellation || row.APPELLATION || row["Region"] || row.region,
            sku: row.sku || row.SKU || row["Product Code"] || row["product code"]
          };
          console.log(`Processing row ${i + 2}:`, productData);
          console.log(`Raw row data:`, row);
          if (!productData.name) {
            errors.push(`Row ${i + 2}: Name is required`);
            continue;
          }
          const result = importProductSchema.safeParse(productData);
          if (!result.success) {
            console.log(`Validation failed for row ${i + 2}:`, result.error.errors);
            errors.push(`Row ${i + 2}: ${result.error.errors.map((e) => e.message).join(", ")}`);
            continue;
          }
          const baseUrl = getRequestBaseUrl(req);
          const product = await storage.createProduct(
            {
              ...result.data,
              createdBy: void 0,
              ownerId: getAuthenticatedUserId(req)
            },
            baseUrl
          );
          importedProducts.push(product);
          console.log(`Successfully imported product: ${product.name}`);
        } catch (error) {
          console.error(`Error processing row ${i + 2}:`, error);
          errors.push(`Row ${i + 2}: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
      }
      console.log(
        `Import completed. Imported: ${importedProducts.length}, Errors: ${errors.length}`
      );
      res.json({
        success: true,
        imported: importedProducts.length,
        errors,
        products: importedProducts
      });
    } catch (error) {
      console.error("Import error:", error);
      res.status(500).json({ error: "Failed to import products" });
    }
  });
  app2.post("/api/ingredients/import", requireAuth, uploadExcel.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);
      const importedIngredients = [];
      const errors = [];
      for (let i = 0; i < data.length; i++) {
        try {
          const row = data[i];
          if (!row || Object.keys(row).length === 0 || Object.values(row).every((val) => !val)) {
            console.log(`Skipping empty row ${i + 2}`);
            continue;
          }
          const ingredientData = {
            name: row.name || row.Name || row.NAME,
            category: row.category || row.Category || row.CATEGORY,
            eNumber: row.eNumber || row["E Number"] || row.E_NUMBER || row.enumber,
            allergens: typeof (row.allergens || row.Allergens || row.ALLERGENS) === "string" ? (row.allergens || row.Allergens || row.ALLERGENS).split(",").map((a) => a.trim()) : row.allergens || row.Allergens || row.ALLERGENS || [],
            details: row.details || row.Details || row.DETAILS || null
          };
          if (!ingredientData.name) {
            errors.push(`Row ${i + 2}: Name is required`);
            continue;
          }
          const result = insertIngredientSchema.safeParse(ingredientData);
          if (!result.success) {
            errors.push(`Row ${i + 2}: ${result.error.errors.map((e) => e.message).join(", ")}`);
            continue;
          }
          const ingredient = await storage.createIngredient({
            ...result.data,
            createdBy: void 0,
            ownerId: getAuthenticatedUserId(req)
          });
          importedIngredients.push(ingredient);
        } catch (error) {
          errors.push(`Row ${i + 2}: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
      }
      res.json({
        success: true,
        imported: importedIngredients.length,
        errors,
        ingredients: importedIngredients
      });
    } catch (error) {
      console.error("Import error:", error);
      res.status(500).json({ error: "Failed to import ingredients" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/migrate.ts
import fs2 from "node:fs";
import path2 from "node:path";
import postgres2 from "postgres";
var MIGRATIONS = [
  {
    file: "add_owner_id_columns.sql",
    sql: `alter table public.products add column if not exists owner_id uuid;
alter table public.ingredients add column if not exists owner_id uuid;`
  },
  {
    file: "add_manufacturing_columns.sql",
    sql: `alter table public.products
  add column if not exists manufacturing_location text,
  add column if not exists manufacturing_address text,
  add column if not exists manufacturing_city text,
  add column if not exists manufacturing_state text,
  add column if not exists manufacturing_country text,
  add column if not exists manufacturing_postal_code text,
  add column if not exists manufacturing_latitude text,
  add column if not exists manufacturing_longitude text,
  add column if not exists latitude text,
  add column if not exists longitude text;`
  },
  {
    file: "add_ingredients_and_scans.sql",
    sql: `ALTER TABLE products ADD COLUMN IF NOT EXISTS ingredient_ids integer[];
CREATE TABLE IF NOT EXISTS scans (
  id serial PRIMARY KEY,
  product_id integer NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  source text,
  created_at timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS scans_product_id_idx ON scans(product_id);`
  },
  {
    file: "add_qr_url_column.sql",
    sql: `alter table public.products add column if not exists qr_url text;`
  }
];
async function ensureSchema(url = process.env.DATABASE_URL) {
  if (!url) return;
  const sql = postgres2(url, { max: 1, onnotice: () => {
  }, ssl: "require" });
  try {
    for (const migration of MIGRATIONS) {
      let content = migration.sql;
      try {
        const filePath = path2.join(process.cwd(), "server", "db", migration.file);
        if (fs2.existsSync(filePath)) {
          content = fs2.readFileSync(filePath, "utf8");
        }
      } catch {
      }
      await sql.unsafe(content);
    }
    console.log("Database schema is up to date");
  } catch (err) {
    console.warn("Schema migration warning:", err?.message || err);
  } finally {
    await sql.end();
  }
}

// server/api-handler.ts
var app = express2();
app.use(
  cors({
    origin: true,
    credentials: true
  })
);
app.use((req, _res, next) => {
  const matchedPath = req.headers["x-matched-path"];
  const forwardedUri = req.headers["x-forwarded-uri"];
  const original = matchedPath || forwardedUri || req.url;
  if (original && original.startsWith("/api")) {
    req.url = original;
  } else if (original && !original.startsWith("/api")) {
    req.url = "/api" + (original.startsWith("/") ? original : "/" + original);
  }
  next();
});
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
var isReady = false;
var initPromise = null;
async function init() {
  if (isReady) return;
  if (!initPromise) {
    initPromise = (async () => {
      try {
        if (process.env.DATABASE_URL) {
          await ensureSchema().catch(
            (err) => console.warn("Database schema update warning:", err?.message || err)
          );
        }
        await registerRoutes(app);
        isReady = true;
      } catch (err) {
        console.error("Failed to initialize API routes:", err);
        throw err;
      }
    })();
  }
  await initPromise;
}
async function handler(req, res) {
  await init();
  return app(req, res);
}
export {
  handler as default
};
