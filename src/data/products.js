export const productsData = [
  {
    id: 'vitaminwater',
    name: 'Vitaminwater Power-C',
    position: { x: 595, y: 190 },
    color: 0xe17055,
    images: {
      front: 'assets/products/vitaminwater/71EdjN9TJKL._SL1500_.jpg',
      ingredients: 'assets/products/vitaminwater/00786162010001_577.jpeg',
      nutrition: 'assets/products/vitaminwater/00786162010001_874.jpeg'
    },
    ourPicks: [3, 4, 5, 6, 7, 8],
    explanations: {
      3: '"Immune support" is a structure/function claim that doesn\'t require FDA pre-market approval, letting Vitaminwater highlight added vitamins without independent verification, drawing attention to select nutrients rather than the drink\'s overall nutritional content.',
      5: '"Antioxidant vitamin C" is redundant and the use of "antioxidant" here adds perceived value without conveying meaningful extra information.',
      6: 'The smiley face paired with "helps support normal immune function" visually reinforces a vague, unquantifiable claim, showing the product relies on positive connotations rather than scientific validation.',
      7: 'Fancy technical terms like "reverse osmosis water" and "crystalline fructose" for simple ingredients like water and sugar add confusion and imply sophistication, further obscuring the nutritional landscape.'
    },
    ourGroups: [
      {
        ids: [4, 5, 8],
        explanation: 'Prominent micronutrient labeling draws away from primary nutritional content — 27g of carbs, all added sugar (54% DV) — creating a health halo where consumers see the drink as healthy despite high sugar.'
      }
    ],
    citations: {
      3: 'https://www.fda.gov/regulatory-information/search-fda-guidance-documents/small-entity-compliance-guide-structurefunction-claims'
    },
    summary: ''
  },
  {
    id: 'cliff-bar',
    name: 'Cliff Bar',
    position: { x: 300, y: 500 },
    color: 0xfdcb6e,
    images: {
      front: 'assets/products/cliff-bar/image10.png',
      ingredients: 'assets/products/cliff-bar/image4.png',
      nutrition: 'assets/products/cliff-bar/image4.png'
    },
    ourPicks: [1, 2, 6, 7, 9],
    explanations: {
      1: '"Sustained energy" can create the impression that the product provides a specific or prolonged performance benefit, even though the phrase is not a standardized nutrition claim and provides no measurable definition of what "sustained" means.'
    },
    ourGroups: [
      {
        ids: [6, 7],
        explanation: '"Made with organic oats" and the organic seal can make the product seem healthier or more nutritious, even though "organic" refers to how ingredients are grown and processed under USDA standards and does not indicate that the product is lower in sugar, calories, or overall nutritional quality.'
      },
      {
        ids: [2, 9],
        explanation: '"9 g protein per bar" and "energy bars" together highlight protein and energy as selling points that can encourage consumers to view the bar as a strong protein option, even though it also contains 16 g of added sugars and 260 calories, resulting in a relatively poor to moderate protein-to-calorie and protein-to-sugar ratio for a product marketed as an energy or protein-focused snack.'
      }
    ],
    summary: ''
  },
  {
    id: 'activia-yogurt',
    name: 'Activia Yogurt',
    position: { x: 200, y: 500 },
    color: 0xa29bfe,
    images: {
      front: 'assets/products/activia-yogurt/image9.png',
      ingredients: 'assets/products/activia-yogurt/image1.png',
      nutrition: 'assets/products/activia-yogurt/image1.png'
    },
    ourPicks: [3, 5, 7, 11],
    explanations: {
      3: '"Supports gut health" implies a broad digestive health benefit, even though such claims on foods and dietary supplements are not reviewed or approved by the FDA before appearing on labels, meaning companies can use them without submitting evidence of effectiveness to the agency.',
      5: '"Non-GMO" can make the product appear healthier or higher quality to consumers, even though the Non-GMO Project Verified label only indicates that the product meets standards for avoiding genetically modified ingredients and does not reflect its sugar, calorie, or overall nutritional quality.',
      7: '"Backed by science" suggests that the product\'s health benefits are strongly supported by scientific evidence, even though the phrase is a general marketing statement and does not indicate what specific studies were conducted, what outcomes were measured, or whether the research directly applies to the product.',
      11: 'Technical bacterial names such as L. bulgaricus, S. thermophilus, and B. lactis can give the product a scientific or medical impression, even though these are simply the standard cultures used to ferment yogurt.'
    },
    ourGroups: [
      {
        ids: [2, 6],
        explanation: '"3 benefits" groups several health-related claims together to make the product appear broadly beneficial, even though the listed benefits (digestive health, probiotics, nutrients) are general statements rather than quantified health outcomes. "Essential daily nutrients" emphasizes the presence of vitamins or minerals to make the yogurt appear nutritionally significant, even though "essential" simply means the body cannot produce those nutrients and they must be obtained from food.'
      }
    ],
    summary: ''
  },
  {
    id: 'skinny-pop',
    name: 'Skinny Pop',
    position: { x: 400, y: 300 },
    color: 0x00b894,
    images: {
      front: 'assets/products/skinny-pop/front.png',
      ingredients: 'assets/products/skinny-pop/ingred.png',
      nutrition: 'assets/products/skinny-pop/nutrition.png'
    },
    ourPicks: [],
    explanations: {},
    ourGroups: [],
    summary: ''
  },
  {
    id: 'nature-valley-bars',
    name: 'Nature Valley Bars',
    position: { x: 500, y: 400 },
    color: 0xe67e22,
    images: {
      front: 'assets/products/nature-valley-bars/front.png',
      ingredients: 'assets/products/nature-valley-bars/nutrition-and-ingred.png',
      nutrition: 'assets/products/nature-valley-bars/nutrition-and-ingred.png'
    },
    ourPicks: [],
    explanations: {},
    ourGroups: [],
    summary: ''
  }
];
