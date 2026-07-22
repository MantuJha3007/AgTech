/**
 * src/controllers/aiController.js — AI crop suggestions (Gemini API)
 * Currently uses smart rule-based suggestions as a placeholder.
 * Replace the suggestCrops function body with actual Gemini API call when key is available.
 */

/**
 * @route   POST /api/ai/suggest
 * @access  Private
 */
const suggestCrops = async (req, res) => {
  const { location, season, soilType, area } = req.body;

  if (!location || !season) {
    return res.status(400).json({ success: false, message: 'Location and season are required.' });
  }

  // ── Placeholder: Rule-based suggestions ──────────────────────────────────────
  // In production, replace this block with a Gemini API call:
  //
  // const { GoogleGenerativeAI } = require('@google/generative-ai');
  // const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  // const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  // const prompt = `Suggest top 5 crops for location: ${location}, season: ${season}, soil type: ${soilType}. 
  //                 Return as JSON array with: name, variety, estimatedYield, growthDays, marketPrice, tips.`;
  // const result = await model.generateContent(prompt);
  // const suggestions = JSON.parse(result.response.text());

  const suggestionMap = {
    kharif: [
      { name: 'Rice',        variety: 'Basmati 370',   growthDays: 135, estimatedYield: '40-50 quintals/acre', marketPrice: '₹3,200/quintal', tips: 'Requires standing water. Ideal for clay soils.' },
      { name: 'Cotton',      variety: 'Bt Cotton',      growthDays: 160, estimatedYield: '10-15 quintals/acre', marketPrice: '₹6,500/quintal', tips: 'High market value. Needs warm temperatures.' },
      { name: 'Soybean',     variety: 'JS-335',         growthDays: 100, estimatedYield: '12-18 quintals/acre', marketPrice: '₹4,200/quintal', tips: 'Nitrogen-fixing crop. Great for soil health.' },
      { name: 'Corn',        variety: 'PEHM-2',         growthDays: 110, estimatedYield: '25-35 quintals/acre', marketPrice: '₹2,100/quintal', tips: 'High demand for animal feed. Quick growing.' },
      { name: 'Groundnut',   variety: 'GG-20',          growthDays: 120, estimatedYield: '12-15 quintals/acre', marketPrice: '₹5,500/quintal', tips: 'Drought tolerant. Good for sandy soils.' },
    ],
    rabi: [
      { name: 'Wheat',       variety: 'HD-2967',        growthDays: 120, estimatedYield: '20-25 quintals/acre', marketPrice: '₹2,275/quintal', tips: 'Most popular rabi crop. Needs cool winters.' },
      { name: 'Mustard',     variety: 'Pusa Bold',      growthDays: 110, estimatedYield: '8-10 quintals/acre',  marketPrice: '₹5,450/quintal', tips: 'Low water requirement. High oil content.' },
      { name: 'Potato',      variety: 'Kufri Jyoti',    growthDays: 100, estimatedYield: '80-120 qtl/acre',    marketPrice: '₹800/quintal',   tips: 'High yield crop. Cold storage extends value.' },
      { name: 'Chickpea',    variety: 'JG-11',          growthDays: 100, estimatedYield: '10-12 quintals/acre', marketPrice: '₹4,500/quintal', tips: 'Protein-rich legume. Good for dry regions.' },
      { name: 'Barley',      variety: 'K-572',          growthDays: 90,  estimatedYield: '18-22 quintals/acre', marketPrice: '₹1,750/quintal', tips: 'Hardy crop. Used for malt and animal feed.' },
    ],
    zaid: [
      { name: 'Watermelon',  variety: 'Sugar Baby',     growthDays: 80,  estimatedYield: '150-200 qtl/acre',   marketPrice: '₹500/quintal',   tips: 'High water demand. Summer cash crop.' },
      { name: 'Cucumber',    variety: 'Poinsett',       growthDays: 55,  estimatedYield: '50-80 qtl/acre',     marketPrice: '₹600/quintal',   tips: 'Fast growing. Good for small farms.' },
      { name: 'Moong',       variety: 'Pusa Baishakhi', growthDays: 65,  estimatedYield: '6-8 quintals/acre',  marketPrice: '₹7,200/quintal', tips: 'Short duration. High protein value.' },
    ],
    summer: [
      { name: 'Tomato',      variety: 'Pusa Ruby',      growthDays: 90,  estimatedYield: '150-200 qtl/acre',   marketPrice: '₹1,200/quintal', tips: 'Needs irrigation. High-value vegetable.' },
      { name: 'Sunflower',   variety: 'KBSH-44',        growthDays: 95,  estimatedYield: '8-12 quintals/acre', marketPrice: '₹5,000/quintal', tips: 'Drought tolerant. Good oil crop.' },
      { name: 'Okra',        variety: 'Pusa A4',        growthDays: 50,  estimatedYield: '40-60 qtl/acre',     marketPrice: '₹1,500/quintal', tips: 'Fast growing vegetable. Continuous harvest.' },
    ],
    winter: [
      { name: 'Pea',         variety: 'Arkel',          growthDays: 70,  estimatedYield: '30-50 qtl/acre',     marketPrice: '₹2,000/quintal', tips: 'Cool weather crop. High market demand.' },
      { name: 'Spinach',     variety: 'All Green',      growthDays: 40,  estimatedYield: '60-80 qtl/acre',     marketPrice: '₹800/quintal',   tips: 'Quick crop. Multiple harvests possible.' },
      { name: 'Carrot',      variety: 'Pusa Kesar',     growthDays: 100, estimatedYield: '100-150 qtl/acre',   marketPrice: '₹900/quintal',   tips: 'Sandy loam soil preferred.' },
    ],
    'year-round': [
      { name: 'Sugarcane',   variety: 'Co-238',         growthDays: 365, estimatedYield: '300-400 qtl/acre',   marketPrice: '₹3,400/quintal', tips: 'High water need. Excellent long-term return.' },
      { name: 'Banana',      variety: 'Grand Naine',    growthDays: 330, estimatedYield: '250-300 qtl/acre',   marketPrice: '₹1,500/quintal', tips: 'Year round production after first harvest.' },
      { name: 'Papaya',      variety: 'Red Lady',       growthDays: 270, estimatedYield: '200-300 qtl/acre',   marketPrice: '₹800/quintal',   tips: 'Fast fruiting. Excellent returns.' },
    ],
  };

  const suggestions = suggestionMap[season.toLowerCase()] || suggestionMap['kharif'];

  res.json({
    success: true,
    message: `AI crop suggestions for ${season} season in ${location}`,
    data: {
      location,
      season,
      soilType: soilType || 'loamy',
      area: area || 'N/A',
      suggestions,
      disclaimer: 'Suggestions are AI-generated. Consult a local agronomist for personalized advice.',
    },
  });
};

module.exports = { suggestCrops };
