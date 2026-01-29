const mongoose = require("mongoose");
const Scheme = require("./models/Scheme");
require("dotenv").config();

const schemes = [
  // GLWB Schemes
  {
    title: "Go Green Scheme (Battery Vehicle Subsidy)",
    description: "Subsidy for construction and industrial workers to purchase battery-operated two-wheelers.",
    benefits: ["Subsidy of 30% of price or ₹30,000, whichever is less", "RTO tax exemption"],
    eligibility: "Registered construction or industrial worker for at least 1 year.",
    type: "Urban",
    board: "GLWB",
    link: "https://glwb.gujarat.gov.in/go-green-scheme.htm"
  },
  {
    title: "Maternity Aid & Beti Bachao",
    description: "Financial assistance for female workers during maternity.",
    benefits: ["₹20,000 for first delivery", "Additional ₹5,000 if daughter is born"],
    eligibility: "Registered female worker (last 1 year).",
    type: "General",
    board: "GLWB",
    link: "https://glwb.gujarat.gov.in/prasurti-shay-ane-bati-protsahan-yojna.htm"
  },
  {
    title: "Educational Award Scheme",
    description: "Merit-based financial awards for children of workers securing high grades.",
    benefits: ["₹5,000 - ₹25,000 based on course/marks", "Covering 10th, 12th, and Degree courses"],
    eligibility: "Son/Daughter of registered worker.",
    type: "General",
    board: "GLWB",
    link: "https://glwb.gujarat.gov.in/educational-award-scheme.htm"
  },
  {
    title: "Shramyogi Cycle Subsidy",
    description: "Subsidy to purchase a bicycle for daily commute.",
    benefits: ["₹1,500 subsidy on cycle purchase"],
    eligibility: "Worker earning less than ₹10,000/month.",
    type: "General",
    board: "GLWB",
    link: "https://glwb.gujarat.gov.in/shramyogi-cycle-subsidy-scheme.htm"
  },
  {
    title: "Accidental Death Scheme",
    description: "Financial support to the family in case of worker's accidental death.",
    benefits: ["₹2,00,000 to the nominee/heir"],
    eligibility: "Registered worker.",
    type: "General",
    board: "GLWB",
    link: "https://glwb.gujarat.gov.in/Accidental-Death-Scheme.htm"
  },

  // GRWWB (Rural) Schemes
  {
    title: "Shramik Suraksha Yojana",
    description: "Accident insurance for unorganized rural landless laborers.",
    benefits: ["Death/Perm Disability: Financial Aid", "Partial Disability: Aid based on %"],
    eligibility: "Unorganized workers aged 14-70 (Rural) / 18-70 (Urban). Landless.",
    type: "Rural",
    board: "GRWWB",
    link: "https://grwwb.gujarat.gov.in/insurance-scheme-guj.htm"
  },
  {
    title: "Antyesthi Sahay (Funeral Aid)",
    description: "Assistance for funeral rites of unorganized workers.",
    benefits: ["₹5,000 to heirs for funeral expenses"],
    eligibility: "Unorganized worker (excluding construction workers).",
    type: "Rural",
    board: "GRWWB",
    link: "https://grwwb.gujarat.gov.in/chronic-serious-diseases-guj.htm"
  },
  {
    title: "Silicosis Relief Scheme",
    description: "Financial aid for families of workers dying from Silicosis (Agate/Stone industry).",
    benefits: ["Financial support to heirs if not covered by ESI/Compensation Act"],
    eligibility: "Workers in Agate/Stone/Construction dealing with silica dust.",
    type: "Rural",
    board: "GRWWB",
    link: "https://grwwb.gujarat.gov.in/professional-yojana-guj.htm"
  },
  {
    title: "Salt Workers Welfare",
    description: "Comprehensive welfare for Agariyas (Salt Pan Workers) covering housing and tools.",
    benefits: ["Safety kit provision", "Cycle subsidy", "Housing aid"],
    eligibility: "Seasonal salt workers.",
    type: "Rural",
    board: "GRWWB",
    link: "https://grwwb.gujarat.gov.in/salt-workers-guj.htm"
  },
  // GBOCWWB (Construction) Schemes
  {
    title: "Construction Worker Housing Assistance",
    description: "Financial aid forregistered construction workers to build or buy a house.",
    benefits: ["Subsidized loans", "Direct financial assistance up to ₹1.5 Lakh"],
    eligibility: "Registered construction worker with valid ID card.",
    type: "Urban",
    board: "GBOCWWB",
    link: "https://enirmanbocw.gujarat.gov.in/"
  },
  {
    title: "Maternity Benefit (Construction)",
    description: "Maternity assistance specifically for construction worker women.",
    benefits: ["₹27,000 per delivery (up to 2 children)"],
    eligibility: "Registered female construction worker.",
    type: "Urban",
    board: "GBOCWWB",
    link: "https://enirmanbocw.gujarat.gov.in/"
  },
  {
    title: "Scholarship for Children",
    description: "Educational scholarship for children of construction workers.",
    benefits: ["₹1,000 to ₹10,000 per year based on class/course"],
    eligibility: "Children of registered construction workers.",
    type: "General",
    board: "GBOCWWB",
    link: "https://enirmanbocw.gujarat.gov.in/"
  },

  // eShram & Govt Aggregators
  {
    title: "eShram Registration",
    description: "National Database of Unorganized Workers. Essential for accident insurance and future social security.",
    benefits: ["PM Suraksha Bima Yojana (Accident cover)", "Universal UAN Identity"],
    eligibility: "Any unorganized worker aged 16-59.",
    type: "General",
    board: "eShram",
    link: "https://eshram.gov.in/"
  },
  {
    title: "Mari Yojana (Gujarat Scheme Search)",
    description: "Official portal to find all government schemes applicable to you.",
    benefits: ["Single window search", "Check eligibility for 500+ schemes"],
    eligibility: "All Citizens of Gujarat",
    type: "General",
    board: "Govt",
    link: "https://mariyojana.gujarat.gov.in/"
  }
];

const seedSchemes = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/rozgar_connect");
    
    await Scheme.deleteMany({});
    console.log("Cleared old schemes...");

    await Scheme.insertMany(schemes);
    console.log(`✅ Seeded ${schemes.length} welfare schemes.`);

    mongoose.disconnect();
  } catch (err) {
    console.error(err);
    mongoose.disconnect();
  }
};

seedSchemes();
