import crypto from "node:crypto";
import express from "express";
import helmet from "helmet";
import { fileURLToPath } from "node:url";
import path from "node:path";

const app = express();
const port = Number(process.env.PORT || 3002);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../public");
const backendUrl = String(process.env.BACKEND_URL || "").replace(/\/$/, "");
const cookieName = "cgm_cms";

app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: "50kb" }));
app.use(express.urlencoded({ extended: false }));

function signature() {
  return crypto.createHmac("sha256", process.env.COOKIE_SECRET || "").update("colectivo-cms").digest("hex");
}
function authenticated(request) {
  const cookies = Object.fromEntries(String(request.headers.cookie || "").split(";").map(part => part.trim().split("=")).filter(entry => entry.length === 2));
  const supplied = cookies[cookieName] || "";
  const expected = signature();
  return Boolean(process.env.COOKIE_SECRET && supplied.length === expected.length && crypto.timingSafeEqual(Buffer.from(supplied), Buffer.from(expected)));
}
function requireLogin(request, response, next) {
  if (!authenticated(request)) return response.status(401).json({ error: "Unauthorized" });
  next();
}
async function backend(pathname, options = {}) {
  if (!backendUrl || !process.env.CMS_API_TOKEN) throw new Error("CMS backend is not configured");
  return fetch(`${backendUrl}${pathname}`, { ...options, headers: { "content-type": "application/json", authorization: `Bearer ${process.env.CMS_API_TOKEN}`, ...(options.headers || {}) } });
}

app.get("/health", (_request, response) => response.json({ status: "ok" }));
app.post("/login", (request, response) => {
  if (!process.env.CMS_PASSWORD || request.body.password !== process.env.CMS_PASSWORD) return response.redirect("/?error=1");
  response.setHeader("Set-Cookie", `${cookieName}=${signature()}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=43200`);
  response.redirect("/");
});
app.post("/logout", (_request, response) => {
  response.setHeader("Set-Cookie", `${cookieName}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`);
  response.redirect("/");
});
// CGM NEWSLETTER CMS PROXY V1
app.get("/api/newsletter/subscribers", requireLogin, async (_request,response) => {
  const result=await backend("/api/cms/newsletter/subscribers"); response.status(result.status).send(await result.text());
});
app.get("/api/newsletter/campaigns", requireLogin, async (_request,response) => {
  const result=await backend("/api/cms/newsletter/campaigns"); response.status(result.status).send(await result.text());
});
app.post("/api/newsletter/campaigns", requireLogin, async (request,response) => {
  const result=await backend("/api/cms/newsletter/campaigns",{method:"POST",body:JSON.stringify(request.body)}); response.status(result.status).send(await result.text());
});
app.patch("/api/newsletter/campaigns/:id", requireLogin, async (request,response) => {
  const result=await backend(`/api/cms/newsletter/campaigns/${encodeURIComponent(request.params.id)}`,{method:"PATCH",body:JSON.stringify(request.body)}); response.status(result.status).send(await result.text());
});
app.post("/api/newsletter/campaigns/:id/test", requireLogin, async (request,response) => {
  const result=await backend(`/api/cms/newsletter/campaigns/${encodeURIComponent(request.params.id)}/test`,{method:"POST",body:JSON.stringify(request.body)}); response.status(result.status).send(await result.text());
});
app.post("/api/newsletter/campaigns/:id/send", requireLogin, async (request,response) => {
  const result=await backend(`/api/cms/newsletter/campaigns/${encodeURIComponent(request.params.id)}/send`,{method:"POST",body:JSON.stringify(request.body||{})}); response.status(result.status).send(await result.text());
});


app.get("/api/framing-requests", requireLogin, async (_request,response) => {
  const result = await backend("/api/cms/framing-requests");
  response.status(result.status).send(await result.text());
});

app.patch("/api/framing-requests/:id", requireLogin, async (request,response) => {
  const result = await backend(`/api/cms/framing-requests/${encodeURIComponent(request.params.id)}`, {
    method:"PATCH",
    body:JSON.stringify(request.body)
  });
  response.status(result.status).send(await result.text());
});

app.post("/api/framing-requests/:id/forward", requireLogin, async (request,response) => {
  const result = await backend(`/api/cms/framing-requests/${encodeURIComponent(request.params.id)}/forward`, {
    method:"POST",
    body:JSON.stringify({})
  });
  response.status(result.status).send(await result.text());
});

app.get("/api/framing-requests/:requestId/images/:imageId", requireLogin, async (request,response) => {
  const result = await fetch(`${backendUrl}/api/cms/framing-requests/${encodeURIComponent(request.params.requestId)}/images/${encodeURIComponent(request.params.imageId)}`, {
    headers:{authorization:`Bearer ${process.env.CMS_API_TOKEN}`}
  });
  if (!result.ok) return response.sendStatus(result.status);
  response.set("Content-Type", result.headers.get("content-type") || "image/webp");
  response.set("Cache-Control","private, max-age=3600");
  response.send(Buffer.from(await result.arrayBuffer()));
});

app.get("/api/orders", requireLogin, async (request, response) => {
  const status = request.query.status ? `?status=${encodeURIComponent(String(request.query.status))}` : "";
  const result = await backend(`/api/cms/orders${status}`);
  response.status(result.status).send(await result.text());
});
app.patch("/api/orders/:id", requireLogin, async (request, response) => {
  const result = await backend(`/api/cms/orders/${encodeURIComponent(request.params.id)}`, { method: "PATCH", body: JSON.stringify(request.body) });
  response.status(result.status).send(await result.text());
});
app.get("/api/artists", requireLogin, async (_request, response) => {
  const result = await backend("/api/cms/artists");
  response.status(result.status).send(await result.text());
});
app.get("/api/products", requireLogin, async (_request, response) => {
  const result = await backend("/api/cms/products");
  response.status(result.status).send(await result.text());
});
app.get("/api/homepage", requireLogin, async (_request, response) => {
  const result = await backend("/api/cms/homepage");
  response.status(result.status).send(await result.text());
});
app.patch("/api/homepage", requireLogin, async (request, response) => {
  const result = await backend("/api/cms/homepage", { method:"PATCH", body:JSON.stringify(request.body) });
  response.status(result.status).send(await result.text());
});
app.post("/api/products", requireLogin, async (request, response) => {
  const result = await backend("/api/cms/products", { method: "POST", body: JSON.stringify(request.body) });
  response.status(result.status).send(await result.text());
});
app.patch("/api/products/:id", requireLogin, async (request, response) => {
  const result = await backend(`/api/cms/products/${encodeURIComponent(request.params.id)}`, { method: "PATCH", body: JSON.stringify(request.body) });
  response.status(result.status).send(await result.text());
});
app.post("/api/products/:id/images", requireLogin, async (request, response) => {
  const result = await fetch(`${backendUrl}/api/cms/products/${encodeURIComponent(request.params.id)}/images`, {
    method: "POST",
    headers: { authorization: `Bearer ${process.env.CMS_API_TOKEN}`, "content-type": request.headers["content-type"] },
    body: request,
    duplex: "half",
  });
  response.status(result.status).send(await result.text());
});
app.patch("/api/products/:productId/images/:imageId", requireLogin, async (request, response) => {
  const result = await backend(`/api/cms/products/${encodeURIComponent(request.params.productId)}/images/${encodeURIComponent(request.params.imageId)}`, { method: "PATCH", body: JSON.stringify(request.body) });
  response.status(result.status).send(await result.text());
});
app.delete("/api/products/:productId/images/:imageId", requireLogin, async (request, response) => {
  const result = await backend(`/api/cms/products/${encodeURIComponent(request.params.productId)}/images/${encodeURIComponent(request.params.imageId)}`, { method: "DELETE" });
  response.status(result.status).send(await result.text());
});
app.get("/media/:id", requireLogin, async (request, response) => {
  const result = await fetch(`${backendUrl}/api/public/images/${encodeURIComponent(request.params.id)}`);
  if (!result.ok) return response.sendStatus(result.status);
  response.set("Content-Type", result.headers.get("content-type") || "image/webp");
  response.set("Cache-Control", "private, max-age=3600");
  response.send(Buffer.from(await result.arrayBuffer()));
});
app.get("/session", (request, response) => response.json({ authenticated: authenticated(request) }));
app.get("/", (request, response) => response.sendFile(path.join(root, authenticated(request) ? "index.html" : "login.html")));
app.get("/index.html", (request, response) => authenticated(request) ? response.sendFile(path.join(root, "index.html")) : response.redirect("/"));
app.get("/framing", (request, response) => authenticated(request) ? response.sendFile(path.join(root, "framing.html")) : response.redirect("/"));
app.get("/framing.html", (request, response) => authenticated(request) ? response.sendFile(path.join(root, "framing.html")) : response.redirect("/"));
app.get("/products", (request, response) => authenticated(request) ? response.sendFile(path.join(root, "products.html")) : response.redirect("/"));
app.get("/products.html", (request, response) => authenticated(request) ? response.sendFile(path.join(root, "products.html")) : response.redirect("/"));
app.get("/homepage", (request, response) => authenticated(request) ? response.sendFile(path.join(root, "homepage.html")) : response.redirect("/"));
app.get("/newsletter", (request, response) => authenticated(request) ? response.sendFile(path.join(root, "newsletter.html")) : response.redirect("/"));
app.get("/newsletter.html", (request, response) => authenticated(request) ? response.sendFile(path.join(root, "newsletter.html")) : response.redirect("/"));
app.get("/homepage.html", (request, response) => authenticated(request) ? response.sendFile(path.join(root, "homepage.html")) : response.redirect("/"));
app.use(express.static(root, { index: false }));

app.listen(port, () => console.log(`CMS listening on ${port}`));
