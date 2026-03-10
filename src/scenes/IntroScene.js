export class IntroScene extends Phaser.Scene {
  constructor() {
    super({ key: 'IntroScene' });
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.add.rectangle(400, 300, width, height, 0xf5f0e1);

    this.pages = [
      {
        title: '',
        content: [
          "Hi! My name is Alex, and I'm a freshman at UW. I've recently started grocery shopping on my own, and honestly, I'm a little overwhelmed. I want to eat healthy and choose nutritious snacks and drinks, but when I walk through the grocery store there are so many options that I don't really know what to choose. I've realized that it's not always easy to tell which foods are actually healthy.",
          "That's why I need your help! In this game, you'll help me explore a virtual grocery store and take a closer look at different food products to uncover the marketing tactics behind their packaging.",
          "As we move through the store, you'll analyze items on the shelves and decide which products are truly good choices and which ones rely on misleading claims. The goal is to help both of us learn how to recognize healthwashing so that making informed food choices in real life becomes a little easier."
        ]
      },
      {
        title: 'What is healthwashing?',
        content: [
          "Healthwashing is widely known as the collective use of misleading marketing strategies that present food and beverage products as healthier than their overall nutritional profile would suggest. These strategies often emphasize certain positive features such as \"natural\", \"organic\", or \"high protein\", while drawing attention away from less favorable aspects like added sugars, sodium, or overall calorie content. By emphasizing selective positive information, food marketing can shape how consumers interpret the healthfulness of a product even when those claims do not reflect its overall nutritional value.",
          "Research has shown that nutrition and health claims on food packaging significantly influence consumer perceptions and purchasing behaviour. Products that include health-related claims are more likely to be perceived as healthier by consumers, even when their nutritional quality is similar or worse than comparable products without such claims (Penzavecchia et al.). These claims are also widespread in the food marketplace. An analysis of packaged food products in the United States found that more than half displayed at least one nutrition-related claim on the front of the package, highlighting how frequently these marketing strategies are used in the food marketplace (Taillie et al.).",
          "Because shoppers often rely on quick visual cues when making decisions in the grocery store, front-of-package claims, buzzwords, and health-related imagery can strongly influence how foods are evaluated (Ikonen et al.). As a result, understanding how these marketing tactics operate is an important step in helping consumers critically evaluate food packaging and make more informed purchasing decisions.",
          "Sources: Penzavecchia, Claudia, et al. \"The influence of front-of-pack nutritional labels on eating and purchasing behaviors: a narrative review of the literature.\" Eating and Weight Disorders, vol. 27, no. 8, 2022, pp. 3037–3051. doi:10.1007/s40519-022-01507-2. Taillie, Lindsey Smith, et al. \"No Fat, No Sugar, No Salt . . . No Problem? Prevalence of 'Low-Content' Nutrient Claims and Their Associations with the Nutritional Profile of Food and Beverage Purchases in the United States.\" Journal of the Academy of Nutrition and Dietetics, vol. 117, no. 9, 2017, pp. 1366–1374. doi:10.1016/j.jand.2017.01.011. Ikonen, Iina, et al. \"Consumer Effects of Front-of-Package Nutrition Labeling: An Interdisciplinary Meta-Analysis.\" Journal of the Academy of Marketing Science, vol. 48, 2020, pp. 360–383."
        ]
      },
      {
        title: 'Who is this for?',
        content: [
          "Our target audience is young adults who are shopping on their own for the first time that are trying to be healthy, but do not yet know how to critically examine food packaging to determine if the food they are buying for themselves is truly healthy or not.",
          "Being aware of healthwashing is particularly relevant for this demographic because younger generations especially are increasingly prioritizing wellness with nearly 30 percent of Gen Zers in the US prioritizing wellness \"a lot more\" compared with one year ago, versus up to 23 percent of older generations (Pione et al.). This can also be seen in their spending behaviors, as while Gen Zers and millennials make up just over a third of the adult population in the US, they drive more than 41 percent of the annual wellness spend (Pione et al.). Social media is also thought to have contributed to this as younger generations are more exposed to health-related content on social media, where they are more likely to be influenced to make wellness related purchases than older generations are (Pione et al.).",
          "Specifically pertaining to food, almost half of Gen Z adults follow food trends on social media, versus 31% for all other generations, and 42% use social media to share their opinions regarding food versus 30% (\"A Snapshot of Gen Z: The Key Characteristics\").",
          "Sources: Pione, Anna, et al. \"The $2 Trillion Global Wellness Market Gets a Millennial and Gen Z Glow-Up.\" McKinsey & Company, 29 May 2025, www.mckinsey.com/industries/consumer-packaged-goods/our-insights/future-of-wellness-trends. \"A Snapshot of Gen Z: The Key Characteristics.\" Glanbia Nutritionals, 8 Jan. 2025, www.glanbianutritionals.com/en/nutri-knowledge-center/insights/snapshot-gen-z-key-characteristics."
        ]
      },
      {
        title: 'Why use a game?',
        content: [
          "Using a game to communicate information about healthwashing with young adults is an effective medium to do so as studies have found gamification to be the \"preferred instructional strategy for Gen Z\" (Saxena and Mishra), in part because it caters to this demographic as young adults \"spend more leisure time on games than any other pastime\" with \"81% of Gen Z\" having \"played games in the past six months,\" \"the highest share of any generation\" (Brune).",
          "Also by hijacking the engagement mechanisms that make games so compelling and transforming them into tools for communication, gamification can turn learning into an experience that feels more fun, interactive, and engaging. This is particularly pertinent for our target audience, young adults shopping on their own for the first time, as this often coincides with major life transitions like moving away from home and starting college, a period of life that can be particularly stressful (Pierceall and Keim), so reducing the burden of navigating food choices is especially valuable.",
          "The impact we hope this game will have is that users leave feeling more informed about how to critically examine and interpret food packaging and marketing, enabling them to make more informed decisions about where their money goes and the food they choose to consume, in ways that align with their personal goals.",
          "Sources: Saxena, Manisha, and Dharmesh Mishra. \"Gamification and Gen Z in Higher Education: A Systematic Review of Literature.\" International Journal of Information and Communication Technology Education, vol. 17, no. 1, 2021, pp. 1–22. https://doi.org/10.4018/IJICTE.20211001.oa10. Brune, Mary. \"Gen Z Gamers: Key Insights.\" Newzoo, 31 Aug. 2021, newzoo.com/resources/blog/gen-z-gamers-key-insights. Pierceall, Emily A., and Marybelle C. Keim. \"Stress and Coping Strategies Among Community College Students.\" Community College Journal of Research and Practice, vol. 31, no. 9, Sept. 2007, pp. 703–12. doi:10.1080/10668920600866579."
        ]
      },
      {
        title: 'How to play!',
        content: [
          "• Use your arrow keys to move Alex through the grocery store aisles and navigate towards the items listed on Alex's checklist.",
          "• Your goal is to help Alex figure out which products rely on healthwashing and which ones are genuinely healthy choices. When you approach an item, click on it to inspect the packaging more closely.",
          "• Hover over parts of the package to zoom in and take a closer look. Click on elements that you think may be misleading or related to healthwashing, such as claims, buzzwords, imagery, or highlighted nutrients.",
          "• After selecting something, explain your reasoning to Alex in the pop-up comment box. Once you submit your explanation, you'll be able to compare your annotations with our research-based analysis.",
          "• Then decide whether you want to add the item to Alex's shopping cart or leave it on the shelf. Continue exploring the store and analyzing products until you've reached all of the items on the checklist.",
          "You're ready to start shopping!"
        ]
      }
    ];

    this.currentPage = 0;
    this.contentContainer = this.add.container(width / 2, height / 2);
    this.add.existing(this.contentContainer);

    this.buildNavigation();
    this.showPage(0);
  }

  buildNavigation() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const btnStyle = {
      fontSize: '16px',
      fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    };

    this.prevBtnBg = this.add.graphics();
    this.prevBtn = this.add.text(120, height - 58, 'Back', btnStyle).setOrigin(0.5);
    this.prevHit = this.add.zone(120, height - 58, 100, 44).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.prevHit.on('pointerdown', () => {
      if (this.currentPage > 0) {
        this.showPage(this.currentPage - 1);
      }
    });

    this.nextBtnBg = this.add.graphics();
    this.startBtnBg = this.add.graphics();
    this.nextBtn = this.add.text(width - 120, height - 58, 'Next', btnStyle).setOrigin(0.5);
    this.nextHit = this.add.zone(width - 120, height - 58, 100, 44).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.nextHit.on('pointerdown', () => {
      if (this.currentPage < this.pages.length - 1) {
        this.showPage(this.currentPage + 1);
      } else {
        this.scene.start('StoreScene');
      }
    });

    this.prevHit.on('pointerover', () => this.updateButtonHover(true, true));
    this.prevHit.on('pointerout', () => this.updateButtonHover(false, true));
    this.nextHit.on('pointerover', () => this.updateButtonHover(true, false));
    this.nextHit.on('pointerout', () => this.updateButtonHover(false, false));

    this.updateButtons();
  }

  updateButtons() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const isFirst = this.currentPage === 0;
    const isLast = this.currentPage === this.pages.length - 1;

    this.prevBtn.setVisible(!isFirst);
    this.prevHit.setVisible(!isFirst);

    this.nextBtn.setText(isLast ? 'Start' : 'Next');
    this.nextBtnBg.setVisible(false);
    this.startBtnBg.setVisible(false);
    if (isLast) {
      this.startBtnBg.setVisible(true);
      this.drawButton(this.startBtnBg, width - 120 - 50, height - 80, 100, 44, 0x00b894);
    } else {
      this.nextBtnBg.setVisible(true);
      this.drawButton(this.nextBtnBg, width - 120 - 50, height - 80, 100, 44, 0x636e72);
    }

    if (!isFirst) {
      this.drawButton(this.prevBtnBg, 120 - 50, height - 80, 100, 44, 0x636e72);
    }
  }

  drawButton(graphics, x, y, w, h, color) {
    graphics.clear();
    graphics.fillStyle(color, 1);
    graphics.fillRoundedRect(x, y, w, h, 8);
  }

  updateButtonHover(hover, isPrev) {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const color = hover ? 0x4a5568 : 0x636e72;
    if (isPrev && this.currentPage > 0) {
      this.drawButton(this.prevBtnBg, 120 - 50, height - 80, 100, 44, color);
    } else if (!isPrev && this.currentPage < this.pages.length - 1) {
      this.drawButton(this.nextBtnBg, width - 120 - 50, height - 80, 100, 44, color);
    } else if (!isPrev) {
      this.drawButton(this.startBtnBg, width - 120 - 50, height - 80, 100, 44, hover ? 0x00a381 : 0x00b894);
    }
  }

  showPage(index) {
    this.currentPage = index;
    this.contentContainer.removeAll(true);

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const page = this.pages[index];

    const textStyle = {
      fontSize: '13px',
      fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
      color: '#2d3436',
      align: 'center',
      lineSpacing: 5,
      wordWrap: { width: 700, useAdvancedWrap: true }
    };

    let y = 40;

    if (page.title) {
      const title = this.add.text(0, y, page.title, {
        fontSize: '20px',
        fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
        color: '#2d3436',
        fontStyle: 'bold',
        align: 'center'
      }).setOrigin(0.5, 0);
      this.contentContainer.add(title);
      y += title.height + 20;
    }

    for (const paragraph of page.content) {
      const text = this.add.text(0, y, paragraph, textStyle).setOrigin(0.5, 0);
      this.contentContainer.add(text);
      y += text.height + 18;
    }

    const contentTop = 50;
    this.contentContainer.setPosition(width / 2, contentTop);

    this.updateButtons();
  }
}
