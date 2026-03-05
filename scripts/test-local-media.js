const http = require("http");

function makeRequest(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        resolve({ status: res.statusCode, headers: res.headers, body: data });
      });
    });
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

(async () => {
  try {
    console.log("1️⃣  Logging in...");
    const loginRes = await makeRequest(
      {
        hostname: "localhost",
        port: 3001,
        path: "/api/login",
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
      JSON.stringify({ password: "mariage2026" })
    );

    if (loginRes.status !== 200) {
      console.error("❌ Login failed:", loginRes.status);
      process.exit(1);
    }

    const cookie = loginRes.headers["set-cookie"];
    if (!cookie) {
      console.error("❌ No session cookie");
      process.exit(1);
    }

    console.log("✅ Logged in successfully");

    // Wait a moment for session to settle
    await new Promise((resolve) => setTimeout(resolve, 500));

    console.log("\n2️⃣  Fetching media...");
    const mediaRes = await makeRequest({
      hostname: "localhost",
      port: 3001,
      path: "/api/media",
      method: "GET",
      headers: { Cookie: cookie[0] },
    });

    if (mediaRes.status !== 200) {
      console.error("❌ Media fetch failed:", mediaRes.status);
      console.error("Response:", mediaRes.body.substring(0, 200));
      process.exit(1);
    }

    const data = JSON.parse(mediaRes.body);
    console.log("✅ Media fetched successfully");
    console.log(`   Found ${data.media.length} items`);

    const albums = [...new Set(data.media.map((m) => m.album))];
    console.log(`   Albums: ${albums.join(", ")}`);

    const types = {};
    data.media.forEach((m) => {
      types[m.type] = (types[m.type] || 0) + 1;
    });
    console.log(`   Types: ${Object.entries(types).map(([k, v]) => `${v} ${k}s`).join(", ")}`);

    if (data.media.length > 0) {
      console.log(`\n📸 Sample items:`);
      data.media.slice(0, 3).forEach((item) => {
        console.log(`   - ${item.album}/${item.filename} (${item.type})`);
      });
    }

    console.log("\n✨ Local media system is working!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
})();
