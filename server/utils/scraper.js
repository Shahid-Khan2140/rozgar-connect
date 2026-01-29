const axios = require("axios");
const cheerio = require("cheerio");
const Scheme = require("../models/Scheme");

const scrapeSchemes = async () => {
  console.log("🔄 Starting Gov Scheme Scraper...");
  
  const newSchemes = [];

  // 1. Scrape GLWB (Gujarat Labour Welfare Board)
  try {
    const glwbUrl = "https://glwb.gujarat.gov.in/welfare-schemes.htm";
    const { data } = await axios.get(glwbUrl);
    const $ = cheerio.load(data);

    // Provide base url for relative links
    const baseUrl = "https://glwb.gujarat.gov.in";

    // Selector based on typical govt site lists (often ul/li or specific tables)
    // Based on previous view, it seemed to be a list of links
    $("a").each((i, el) => {
      const title = $(el).text().trim();
      const href = $(el).attr("href");

      // Filter for keywords to identify scheme links
      if (title && href && (title.includes("Scheme") || title.includes("Sahay") || title.includes("Yojana"))) {
        // Avoid duplicate common links
        if(!['Home', 'Contact', 'Disclaimer'].some(w => title.includes(w))) {
             newSchemes.push({
                title: title,
                description: "Official Welfare Scheme from Gujarat Labour Welfare Board. Click 'View Details' to apply on the official portal.",
                benefits: ["Government Subsidy/Aid", "Direct Bank Transfer"],
                eligibility: "Registered Worker",
                type: "Urban",
                board: "GLWB",
                link: href.startsWith("http") ? href : baseUrl + "/" + href
             });
        }
      }
    });
    console.log(`✅ GLWB: Found ${newSchemes.length} potential schemes.`);

  } catch (err) {
    console.error("❌ GLWB Scrape Failed:", err.message);
  }

  // 2. Scrape GRWWB (Rural Board)
  try {
    const grwwbUrl = "https://grwwb.gujarat.gov.in/";
    const { data } = await axios.get(grwwbUrl);
    const $ = cheerio.load(data);
    const baseUrl = "https://grwwb.gujarat.gov.in";

    // Looking for headers or marquee links usually found on these sites
    $("h3, a").each((i, el) => {
       const text = $(el).text().trim();
       // Basic keyword filter for Gujarati/English scheme terms
       if(text && (text.includes("Yojana") || text.includes("Sahay") || text.includes("Scheme")) && text.length > 10) {
           const parentLink = $(el).closest('a').attr('href') || $(el).attr('href');
           if(parentLink) {
                newSchemes.push({
                    title: text.substring(0, 100) + "...", // Truncate long headers
                    description: "Rural Welfare Scheme. Visit the board website for full eligibility criteria.",
                    benefits: ["Social Security", "Financial Assistance"],
                    eligibility: "Rural/Unorganized Worker",
                    type: "Rural",
                    board: "GRWWB",
                    link: parentLink.startsWith("http") ? parentLink : baseUrl + "/" + parentLink
                });
           }
       }
    });

  } catch(err) {
     console.error("❌ GRWWB Scrape Failed:", err.message);
  }

  // 3. Save to DB (Upsert to avoid duplicates)
  let count = 0;
  for (const s of newSchemes) {
      // Determine Target Group based on keywords
      let target = "Labour";
      if(s.title.toLowerCase().includes("contract") || s.title.toLowerCase().includes("establishment")) target = "Contractor";
      
      // Determine Source Name
      const sourceUrl = new URL(s.link);
      const sourceName = sourceUrl.hostname;

      // Default Documents (Scraping these is hard without specific selectors)
      const defaultDocs = ["Aadhaar Card", "Bank Passbook", "Passport Photo"];
      if(s.board === "GBOCWWB") defaultDocs.push("Worker Registration Card");

      const schemeData = {
          ...s,
          target_group: target,
          source_name: sourceName,
          documents: defaultDocs,
          status: "Active",
          last_checked: new Date()
      };

      // Upsert: Update if title matches
      const existing = await Scheme.findOne({ title: s.title });
      if (!existing) {
          await Scheme.create(schemeData);
          count++;
      } else {
          // Update last checked even if exists
          existing.last_checked = new Date();
          await existing.save();
      }
  }
  
  return { status: "Done", added: count, totalFound: newSchemes.length };
};

module.exports = scrapeSchemes;
