export const productsData = [
  {
    id: 'vitaminwater',
    name: 'Vitaminwater Power-C',
    position: { x: 105, y: 300 },
    color: 0xf23b16,
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
        explanation: 'Prominent micronutrient labeling draws away from primary nutritional content — 27g of carbs, all added sugar (54% DV) — creating a health halo where consumers see the drink as healthy despite high sugar.',
        citation: 'https://doi.org/10.1001/jamanetworkopen.2022.36384',
        citationMla: 'Musicus, Abby A., et al., "Effect of Front-of-Package Information, Fruit Imagery, and High–Added Sugar Warning Labels on Parent Beverage Choices for Children: A Randomized Clinical Trial." <i>JAMA Network Open</i>, vol. 5, no. 10, 2022, e2236384. https://doi.org/10.1001/jamanetworkopen.2022.36384.'
      }
    ],
    citations: {
      3: 'https://www.fda.gov/regulatory-information/search-fda-guidance-documents/small-entity-compliance-guide-structurefunction-claims',
      5: 'https://link.gale.com/apps/doc/A334846302/HRCA?u=anon~27d000aa&sid=googleScholar&xid=8dfd2076',
      7: 'https://www.fda.gov/food/hfp-constituent-updates/fda-releases-final-guidance-regarding-food-labeling-term-evaporated-cane-juice'
    },
    citationMla: {
      3: 'U.S. Food and Drug Administration. "Small Entity Compliance Guide on Structure/Function Claims." U.S. Food and Drug Administration, 10 Nov. 2017, www.fda.gov/regulatory-information/search-fda-guidance-documents/small-entity-compliance-guide-structurefunction-claims.',
      5: 'Palmer, Sharon. "Beyond the antioxidant buzz: antioxidants are all the rage. Yet the health properties of plant foods, such as fruits, vegetables, grains, and legumes, go beyond mere antioxidant status." <i>Environmental Nutrition</i>, vol. 36, no. 7, July 2013, pp. 1+. Gale OneFile: Health and Medicine, https://link.gale.com/apps/doc/A334846302/HRCA?u=anon~27d000aa&sid=googleScholar&xid=8dfd2076.',
      7: 'U.S. Food and Drug Administration, Human Foods Program. "FDA Releases Final Guidance Regarding the Food Labeling Term \'Evaporated Cane Juice.\'" U.S. Food and Drug Administration, 1 Feb. 2018, www.fda.gov/food/hfp-constituent-updates/fda-releases-final-guidance-regarding-food-labeling-term-evaporated-cane-juice.'
    },
    summary: ''
  },
  {
    id: 'cliff-bar',
    name: 'Cliff Bar',
    position: { x: 650, y: 100 },
    color: 0x97dbda,
    images: {
      front: 'assets/products/cliff-bar/image10.png',
      ingredients: 'assets/products/cliff-bar/image4.png',
      nutrition: 'assets/products/cliff-bar/image4.png'
    },
    ourPicks: [1, 2, 6, 7, 9],
    explanations: {
      1: '"Sustained energy" can create the impression that the product provides a specific or prolonged performance benefit, even though the phrase is not a standardized nutrition claim and provides no measurable definition of what "sustained" means.',
      6: '"Non-GMO" can make the product appear healthier or higher quality to consumers, even though the Non-GMO Project Verified label only indicates that the product meets standards for avoiding genetically modified ingredients and does not reflect its sugar, calorie, or overall nutritional quality.'
    },
    citations: {
      1: 'https://www.fda.gov/food/food-labeling-nutrition/label-claims-conventional-foods-and-dietary-supplements',
      6: 'https://www.nap.edu/catalog/23395/genetically-engineered-crops-experiences-and-prospects'
    },
    citationMla: {
      1: 'U.S. Food and Drug Administration. "Label Claims for Conventional Foods and Dietary Supplements." FDA, 2021. https://www.fda.gov/food/food-labeling-nutrition/label-claims-conventional-foods-and-dietary-supplements.',
      6: 'National Academies of Sciences, Engineering, and Medicine. <i>Genetically Engineered Crops: Experiences and Prospects</i>. National Academies Press, 2016.'
    },
    ourGroups: [
      {
        ids: [2, 9],
        explanation: '"9 g protein per bar" highlights protein as a selling point that can encourage consumers to view the bar as a strong protein option, even though it also contains 16 g of added sugars and 260 calories, resulting in a relatively poor to moderate protein-to-calorie and protein-to-sugar ratio for a product marketed as an energy or protein-focused snack.',
        citation: 'https://www.heart.org/en/healthy-living/healthy-eating/eat-smart/nutrition-basics/food-packaging-claims',
        citationMla: 'American Heart Association. "Making Sense of Food Packaging Claims." American Heart Association. https://www.heart.org/en/healthy-living/healthy-eating/eat-smart/nutrition-basics/food-packaging-claims.'
      },
      {
        ids: [6, 7],
        explanation: '"Made with organic oats" and the organic seal can make the product seem healthier or more nutritious, even though "organic" refers to how ingredients are grown and processed under USDA standards and does not indicate that the product is lower in sugar, calories, or overall nutritional quality.',
        citation: 'https://www.ams.usda.gov/rules-regulations/organic/labeling',
        citationMla: 'U.S. Department of Agriculture. "Organic Labeling Standards." USDA Agricultural Marketing Service. https://www.ams.usda.gov/rules-regulations/organic/labeling.'
      }
    ],
    summary: ''
  },
  {
    id: 'activia-yogurt',
    name: 'Activia Yogurt',
    position: { x: 220, y: 80 },
    color: 0x7fba61,
    images: {
      front: 'assets/products/activia-yogurt/image9.png',
      ingredients: 'assets/products/activia-yogurt/image1.png',
      nutrition: 'assets/products/activia-yogurt/image1.png'
    },
    ourPicks: [2, 3, 5, 6, 7, 8, 12, 17],
    explanations: {
      3: '"Supports gut health" implies a broad digestive health benefit, even though such claims on foods and dietary supplements are not reviewed or approved by the FDA before appearing on labels, meaning companies can use them without submitting evidence of effectiveness to the agency.',
      6: '"Non-GMO" can make the product appear healthier or higher quality to consumers, even though the Non-GMO Project Verified label only indicates that the product meets standards for avoiding genetically modified ingredients and does not reflect its sugar, calorie, or overall nutritional quality.',
      8: '"Backed by science" suggests that the product\'s health benefits are strongly supported by scientific evidence, even though the phrase is a general marketing statement and does not indicate what specific studies were conducted, what outcomes were measured, or whether the research directly applies to the product.',
      12: 'In the ingredient list: Technical bacterial names such as L. bulgaricus, S. thermophilus, and B. lactis can give the product a scientific or medical impression, even though these are simply the standard cultures used to ferment yogurt.'
    },
    citations: {
      3: 'https://www.fda.gov/food/nutrition-food-labeling-and-critical-foods/structurefunction-claims',
      6: 'https://academic.oup.com/advances/article/6/6/842/4555115',
      12: 'https://nutritionsource.hsph.harvard.edu/food-features/yogurt/'
    },
    citationMla: {
      3: 'U.S. Food and Drug Administration. "Structure/Function Claims." U.S. Food and Drug Administration, 28 Mar. 2024, https://www.fda.gov/food/nutrition-food-labeling-and-critical-foods/structurefunction-claims.',
      6: 'Wunderlich, Shahla, and Kelsey A. Gatto. "Consumer perception of genetically modified organisms and sources of information." <i>Advances in Nutrition</i> 6.6 (2015): 842-851.',
      12: 'Harvard T.H. Chan School of Public Health. "Yogurt." The Nutrition Source, 2024, https://nutritionsource.hsph.harvard.edu/food-features/yogurt/.'
    },
    ourGroups: [
      {
        ids: [2, 7],
        explanation: '"3 benefits" groups several health-related claims together to make the product appear broadly beneficial, even though the listed benefits (digestive health, probiotics, nutrients) are general statements rather than quantified health outcomes.',
        citation: 'https://doi.org/10.3390/nu8120787',
        citationMla: 'Talati, Zenobia, et al. "Do Health Claims and Front-of-Pack Labels Lead to a Positivity Bias in Unhealthy Foods?" <i>Nutrients</i> 8.12 (2016): 787. https://doi.org/10.3390/nu8120787.'
      },
      {
        ids: [5, 17],
        explanation: '"Essential daily nutrients" emphasizes the presence of vitamins or minerals to make the yogurt appear nutritionally significant, even though "essential" simply means the body cannot produce those nutrients and they must be obtained from food.',
        citation: 'https://ods.od.nih.gov/factsheets/WYNTK-Consumer/',
        citationMla: 'National Institutes of Health, Office of Dietary Supplements. "Dietary Supplements: What You Need to Know." NIH Office of Dietary Supplements, 4 Jan. 2023, https://ods.od.nih.gov/factsheets/WYNTK-Consumer/.'
      }
    ],
    summary: ''
  },
  {
    id: 'skinny-pop',
    name: 'Skinny Pop',
    position: { x: 150, y: 470 },
    color: 0x8be05a,
    images: {
      front: 'assets/products/skinny-pop/front.png',
      ingredients: 'assets/products/skinny-pop/ingred.png',
      nutrition: 'assets/products/skinny-pop/nutrition.png'
    },
    ourPicks: [1, 5, 8, 9],
    explanations: {
      1: 'The brand name "SkinnyPop" frames the product as a food associated with weight control or dieting. This type of labeling can create a health halo effect, where consumers perceive a product as healthier or lower in calories because of branding or implied weight-loss associations, even if the product still contributes meaningful calories and fat per serving. Labels implying health or diet benefits can influence consumers to underestimate calorie content and perceive foods as healthier than they are.'
    },
    citations: {},
    ourGroups: [
      {
        ids: [5, 8, 9],
        explanation: 'The package highlights its short ingredient list to emphasize simplicity and naturalness. While the ingredient list is indeed short, marketing language that highlights simplicity can create the impression that a product is inherently healthier, even though nutritional quality ultimately depends on the overall nutrient profile.',
        citation: 'https://www.fda.gov/food/nutrition-facts-label/how-understand-and-use-nutrition-facts-label',
        citationMla: 'U.S. Food and Drug Administration. "How to Understand and Use the Nutrition Facts Label." U.S. Food and Drug Administration, https://www.fda.gov/food/nutrition-facts-label/how-understand-and-use-nutrition-facts-label.'
      }
    ],
    summary: ''
  },
  {
    id: 'nature-valley-bars',
    name: 'Nature Valley Bars',
    position: { x: 650, y: 330 },
    color: 0xf0dd0e,
    images: {
      front: 'assets/products/nature-valley-bars/front.png',
      ingredients: 'assets/products/nature-valley-bars/nutrition-and-ingred.png',
      nutrition: 'assets/products/nature-valley-bars/nutrition-and-ingred.png'
    },
    ourPicks: [1, 2, 3, 5],
    explanations: {
      1: 'The brand name "Nature Valley" and the green color scheme can evoke associations with natural or minimally processed foods. However, the ingredient list includes added sugars, refined oils, and flavoring agents, indicating that the product is a processed packaged snack. Branding that emphasizes natural imagery can influence consumer perception of healthfulness even when the nutritional profile does not strongly support that impression.',
      3: 'The front of the package advertises the "22g whole grain", which can create the impression that the product is nutritionally balanced or particularly healthy. While whole grains are associated with health benefits, the presence of whole grains does not necessarily make a product healthy. Foods that contain whole grains may still contain substantial amounts of added sugars and refined ingredients, diminishing their nutritional value.'
    },
    citations: {
      1: 'https://www.sciencedirect.com/science/article/pii/S0963996917300668',
      3: 'https://nutritionsource.hsph.harvard.edu/what-should-you-eat/whole-grains/'
    },
    citationMla: {
      1: 'Asioli, Daniele, et al. "Making sense of the \'clean label\' trends: A review of consumer food choice behavior and discussion of industry implications." <i>Food Research International</i> 99 (2017): 58-71.',
      3: 'Harvard T.H. Chan School of Public Health. "Whole Grains." The Nutrition Source, 2025, https://nutritionsource.hsph.harvard.edu/what-should-you-eat/whole-grains/.'
    },
    ourGroups: [
      {
        ids: [2, 5],
        explanation: 'The packaging emphasizes oats and honey imagery, which may suggest that the product is primarily composed of natural ingredients. However, the ingredient list reveals that multiple added sugars are present, including sugar, brown sugar syrup, and honey. Food manufacturers often use multiple types of sugars to enhance sweetness while making each appear lower in the ingredient list.',
        citation: 'https://www.sugarnutritionresource.org/the-basics/sugars-on-food-labels',
        citationMla: 'Dowse, Michelle. "Sugars on Food Labels." Sugar Nutrition Resource Centre. https://www.sugarnutritionresource.org/the-basics/sugars-on-food-labels. Scapin, Tailane, et al. "Influence of sugar label formats on consumer understanding and amount of sugar in food choices: a systematic review and meta-analyses." <i>Nutrition Reviews</i> 79.7 (2021): 788-801.'
      }
    ],
    summary: ''
  },
  {
    id: 'naked-juice',
    name: 'Naked Juice',
    position: { x: 425, y: 150 },
    color: 0xed82d8,
    images: {
      front: 'assets/products/naked-juice/front.png',
      ingredients: 'assets/products/naked-juice/nutrition+ingred.png',
      nutrition: 'assets/products/naked-juice/nutrition+ingred.png'
    },
    ourPicks: [2, 5, 6, 8, 9, 11],
    explanations: {
      2: '"Boosted smoothie" uses wellness-oriented language that suggests added functional benefits such as improved energy, immunity, or nutrition, even though "boosted" is not a regulated nutrition claim under FDA labeling rules and has no standardized definition, making it primarily marketing language rather than a measurable health statement.',
      5: '"Fiber & 6 Essential Vitamins & Minerals" highlights a few beneficial nutrients in a way that can make the drink appear more nutritious overall, even though this type of nutrient spotlighting can draw attention away from other aspects of the nutrition profile such as its high sugar content.',
      6: 'The inclusion of the word "essential" can make the drink appear especially nutritious even though "essential" simply means these vitamins and minerals must be obtained from the diet because the body cannot produce them.',
      8: '"No sugar added" can mislead consumers into thinking the product is healthier or lower in sugar than it actually is, even though the bottle contains 50 g of total sugars; in reality, it is simply a regulated nutrient content claim meaning no sugars were added during processing.'
    },
    citations: {
      2: 'https://www.fda.gov/food/dietary-supplements-guidance-documents-regulatory-information/dietary-supplement-labeling-guide-chapter-vi-claims',
      5: 'https://www.heart.org/en/healthy-living/healthy-eating/eat-smart/nutrition-basics/food-packaging-claims',
      6: 'https://www.ncbi.nlm.nih.gov/books/NBK597352/',
      8: 'https://www.fda.gov/food/nutrition-facts-label/added-sugars-nutrition-facts-label'
    },
    citationMla: {
      2: 'U.S. Food and Drug Administration. "Dietary Supplement Labeling Guide: Claims." U.S. Department of Health and Human Services. https://www.fda.gov/food/dietary-supplements-guidance-documents-regulatory-information/dietary-supplement-labeling-guide-chapter-vi-claims.',
      5: 'American Heart Association. "Making Sense of Food Packaging Claims." American Heart Association. https://www.heart.org/en/healthy-living/healthy-eating/eat-smart/nutrition-basics/food-packaging-claims.',
      6: 'Espinosa-Salas, S. "Micronutrient Intake, Imbalances, and Interventions." <i>Nutrition and Health</i>, National Center for Biotechnology Information, 2023, https://www.ncbi.nlm.nih.gov/books/NBK597352/.',
      8: 'U.S. Food and Drug Administration. "Added Sugars on the Nutrition Facts Label." U.S. Department of Health and Human Services. https://www.fda.gov/food/nutrition-facts-label/added-sugars-nutrition-facts-label.'
    },
    ourGroups: [
      {
        ids: [9, 11],
        explanation: '"100% juice" and "all sugars come from the fruits" can create a natural health halo that makes the drink seem inherently healthy, even though fruit juice sugars are still classified as free sugars that should be limited; despite this framing, one bottle still contains 50 g of sugar.',
        citation: 'https://www.ncbi.nlm.nih.gov/books/NBK285538/',
        citationMla: 'World Health Organization. <i>Guideline: Sugars Intake for Adults and Children</i>. World Health Organization, 2015. NCBI Bookshelf, National Library of Medicine. https://www.ncbi.nlm.nih.gov/books/NBK285538/.'
      }
    ],
    summary: ''
  }
];
