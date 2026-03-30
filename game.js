let furnitureItems = [];
let currency = 0;
let reputation = 1; // Reputation level, starts at 1
let purchasedItems = new Set(); // Names of purchased items (those with suffix 2)
let currentLevel = 0; // Current level (order index)
let selectedRoom = 0; // Currently selected room index
let maxSeenReputation = 1.0; // The highest reputation for which rooms have been seen

// Rooms unlock based on reputation level: Level 2 -> Room 2, Level 3 -> Room 3, etc.
const ROOM_UNLOCKS = [1, 2, 3, 4, 5, 6, 7, 8]; 
const ROOM_NAMES = ['Cozy Studio', 'Modern Apartment', 'Sunlit Loft', 'Garden Suite', 'Minimal Hideaway', 'Creative Space', 'Artist Studio', 'VIP Penthouse'];
let isCharacterAtCounter = false; // Persistent state for character position
let isEconomyAnimationPlayed = false; // Persistent state for reward animation

function updateCurrencyUI(showReputation = true) {
    const display = document.getElementById('currency-display');
    const reputationText = document.getElementById('reputation-text');
    const coinsText = document.getElementById('coins-text');
    
    if (display) {
        display.style.display = 'block';
        if (reputationText) {
            reputationText.innerText = `Reputation: ${reputation.toFixed(1)}`;
            reputationText.style.display = showReputation ? 'inline' : 'none';
        }
        if (coinsText) coinsText.innerText = `Coins: ${currency}`;
    }
}

// Room template dimensions (obtained via `file` or `identify`)
const ROOM_DIMENSIONS = [
    { w: 1506, h: 1022 }, // emptyRoomTemplate.png
    { w: 1536, h: 1024 }, // Shablon1.png
    { w: 1264, h: 842 },  // Shablon2.png
    { w: 1536, h: 1024 }, // Shablon3.png
    { w: 1536, h: 1024 }, // Shablon4.png
    { w: 1248, h: 832 },  // Shablon5.png
    { w: 1536, h: 1024 }, // artistStudio
    { w: 1536, h: 1024 }  // penthouse
];

const ROOM_TEMPLATES = [
    'assets/rooms/emptyRoomTemplate.png',
    'assets/rooms/Shablon1.png',
    'assets/rooms/Shablon2.png',
    'assets/rooms/Shablon3.png',
    'assets/rooms/Shablon4.png',
    'assets/rooms/Shablon5.png',
    'assets/rooms/Shablon3.png', // Reuse for now
    'assets/rooms/Shablon4.png'  // Reuse for now
];

const ITEM_VIBES = {
    'Plant': ['cozy', 'nature', 'fresh'],
    'Lamp': ['cozy', 'light', 'warm'],
    'Chair': ['office', 'basic'],
    'Table': ['office', 'basic'],
    'Bed': ['cozy', 'relax'],
    'Closet': ['storage', 'basic'],
    'Window': ['light', 'fresh'],
    'Mirror': ['fancy', 'light'],
    'Table2': ['office', 'fancy', 'modern'],
    'Chair2': ['office', 'fancy', 'modern'],
    'Flower2': ['cozy', 'nature', 'fancy'],
    'Puffic2': ['cozy', 'relax', 'fancy'],
    'Stairs2': ['vintage', 'fancy'],
    'Mirror2': ['fancy', 'modern'],
    'Clock2': ['vintage', 'fancy'],
    'Shell2': ['storage', 'fancy', 'modern']
};

const COMMISSIONS = [
    {
        residentName: "Kamaliia",
        residentType: "rabbit",
        brief: "Hi! I need a cozy studio. Can you add a plant and a lamp? And please, throw out this old chair, it annoys me!",
        requiredAdd: ["Plant", "Lamp"],
        requiredRemove: ["Chair"],
        requiredVibe: "cozy",
        reward: 80
    },
    {
        residentName: "Mia",
        residentType: "rabbit",
        brief: "Just a small update — add a plant and move things around. Oh, and you can remove the mirror, it's too fancy for me.",
        requiredAdd: ["Plant"],
        requiredRemove: ["Mirror"],
        requiredVibe: "nature",
        reward: 80
    },
    {
        residentName: "Aleksey",
        residentType: "bear",
        brief: "I want a workspace! Put in a table and a chair. And take away that plant, I have an allergy to it.",
        requiredAdd: ["Table", "Chair"],
        requiredRemove: ["Plant"],
        requiredVibe: "office",
        reward: 100
    },
    {
        residentName: "Elena",
        residentType: "cat",
        brief: "I need more light! Add a lamp and a window. I don't need the old closet anymore.",
        requiredAdd: ["Lamp", "Window"],
        requiredRemove: ["Closet"],
        requiredVibe: "light",
        reward: 100
    },
    {
        residentName: "Luka",
        residentType: "dog",
        brief: "I finally got a real bed! Please put it in and add a reading lamp. The old chair takes up too much space.",
        requiredAdd: ["Lamp", "Bed"],
        requiredRemove: ["Chair"],
        requiredVibe: "relax",
        reward: 100
    },
    {
        residentName: "Nina",
        residentType: "cat",
        brief: "I want a strict and practical look. Add a table and a closet. And get rid of that plant — I always forget to water it.",
        requiredAdd: ["Table", "Closet"],
        requiredRemove: ["Plant"],
        requiredVibe: "basic",
        reward: 100
    },
    {
        residentName: "Dmitry",
        residentType: "bear",
        brief: "Make it a room for relaxation! A bed and a mirror are exactly what I need. And throw out this table.",
        requiredAdd: ["Bed", "Mirror"],
        requiredRemove: ["Table"],
        requiredVibe: "relax",
        reward: 120
    },
    {
        residentName: "Sophia",
        residentType: "rabbit",
        brief: "I love plants! Put in two plants and a chair. I don't like the old lamp.",
        requiredAdd: ["Plant", "Plant", "Chair"],
        requiredRemove: ["Lamp"],
        requiredVibe: "nature",
        reward: 120
    },
    {
        residentName: "Artem",
        residentType: "dog",
        brief: "Create a calm, airy atmosphere for me. A mirror and a plant will do wonders. And please, remove the bed, I'm moving into a hammock outside!",
        requiredAdd: ["Mirror", "Plant"],
        requiredRemove: ["Bed"],
        requiredVibe: "fresh",
        reward: 120
    },
    {
        residentName: "Victor",
        residentType: "fox",
        brief: "I need an office. A closet and a table are required. And remove the bed.",
        requiredAdd: ["Closet", "Table"],
        requiredRemove: ["Bed"],
        requiredVibe: "office",
        reward: 150
    },
    {
        residentName: "Zara",
        residentType: "cat",
        brief: "I want it to be cozy and green! Add a bed, a plant, and a lamp. That table has to go — too much clutter.",
        requiredAdd: ["Bed", "Plant", "Lamp"],
        requiredRemove: ["Table"],
        requiredVibe: "cozy",
        reward: 150
    },
    {
        residentName: "Max",
        residentType: "fox",
        brief: "Let's make everything as stylish as possible. A chair, a table AND a mirror. The closet is bulky and ugly — take it away.",
        requiredAdd: ["Chair", "Table", "Mirror"],
        requiredRemove: ["Closet"],
        requiredVibe: "fancy",
        reward: 150
    },
    {
        residentName: "Oink",
        residentType: "pig",
        brief: "I love pink! Could you add a chair and a plant? Also, please remove that boring old table.",
        requiredAdd: ["Chair", "Plant"],
        requiredRemove: ["Table"],
        requiredVibe: "cozy",
        reward: 150
    },
    {
        residentName: "Penny",
        residentType: "pig",
        brief: "I need a place to study. Add a table and a lamp. The old chair is just in the way.",
        requiredAdd: ["Table", "Lamp"],
        requiredRemove: ["Chair"],
        requiredVibe: "office",
        reward: 180
    }
];

function getCurrentCommission() {
    return COMMISSIONS[currentLevel % COMMISSIONS.length];
}

// Shop data
const SHOP_ITEMS = [
    { name: 'Table2', price: 30, type: 'floor', texture: 'table2', displayName: 'Table 2' },
    { name: 'Chair2', price: 30, type: 'floor', texture: 'chair2', displayName: 'Chair 2' },
    { name: 'Flower2', price: 30, type: 'floor', texture: 'flower2', displayName: 'Flower 2' },
    { name: 'Puffic2', price: 30, type: 'floor', texture: 'puffic2', displayName: 'Puff 2' },
    { name: 'Stairs2', price: 30, type: 'floor', texture: 'stairs2', displayName: 'Stairs 2' },
    { name: 'Mirror2', price: 20, type: 'wall', texture: 'mirror2', displayName: 'Mirror 2' },
    { name: 'Clock2', price: 20, type: 'wall', texture: 'clock2', displayName: 'Clock 2' },
    { name: 'Shell2', price: 20, type: 'wall', texture: 'shell2', displayName: 'Shelf 2' }
];

// --- Scene: Room Selection ---
class RoomSelectScene extends Phaser.Scene {
    constructor() {
        super('RoomSelectScene');
    }

    preload() {
        const version = Date.now();
        ROOM_TEMPLATES.forEach((path, i) => {
            this.load.image(`room_thumb_${i}`, path + '?v=' + version);
        });
    }

    create() {
        maxSeenReputation = reputation; // Mark all currently unlocked rooms as seen
        if (document.getElementById('ui-panel')) {
            document.getElementById('ui-panel').style.display = 'none';
        }
        updateCurrencyUI(true);

        // Background
        const bg = this.add.image(400, 250, 'agency_bg');
        bg.setDisplaySize(800, 500);
        bg.setAlpha(0.4);

        // Title
        this.add.text(400, 40, 'Choose a Room', {
            fontSize: '26px',
            fontFamily: 'Arial Black',
            color: '#5f3b2b',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Cards: 2 rows × 3 cols
        const cols = [150, 400, 650, 150, 400, 650, 150, 400];
        const rows = [170, 170, 170, 310, 310, 310, 450, 450];
        const cardW = 210, cardH = 110;

        ROOM_TEMPLATES.forEach((_, i) => {
            const cx = cols[i];
            const cy = rows[i];
            const unlocked = reputation >= ROOM_UNLOCKS[i];

            const card = this.add.graphics();
            if (unlocked) {
                card.fillStyle(0xfff5e6, 1);
                card.lineStyle(3, 0xf18c8e, 1);
            } else {
                card.fillStyle(0xdddddd, 1);
                card.lineStyle(3, 0xaaaaaa, 1);
            }
            card.fillRoundedRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH, 12);
            card.strokeRoundedRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH, 12);

            // Room name
            this.add.text(cx, cy - 22, ROOM_NAMES[i], {
                fontSize: '14px',
                fontFamily: 'Arial Black',
                color: unlocked ? '#5f3b2b' : '#888888',
                fontStyle: 'bold',
                wordWrap: { width: cardW - 20 },
                align: 'center'
            }).setOrigin(0.5);

            if (unlocked) {
                const btn = this.add.text(cx, cy + 28, 'SELECT', {
                    fontSize: '13px',
                    fontFamily: 'Arial Black',
                    color: '#ffffff',
                    backgroundColor: '#f18c8e',
                    padding: { x: 14, y: 7 }
                }).setOrigin(0.5).setInteractive({ useHandCursor: true });

                btn.on('pointerover', () => btn.setStyle({ backgroundColor: '#e07b7d' }));
                btn.on('pointerout', () => btn.setStyle({ backgroundColor: '#f18c8e' }));
                btn.on('pointerdown', () => {
                    selectedRoom = i;
                    this.scene.start('BriefingScene', { result: null });
                });
            } else {
                this.add.text(cx, cy + 28, `Need level ${ROOM_UNLOCKS[i]} reputation`, {
                    fontSize: '12px',
                    fontFamily: 'Arial',
                    color: '#999999'
                }).setOrigin(0.5);
            }
        });
    }
}

// --- Scene: Shop ---
class ShopScene extends Phaser.Scene {
    constructor() {
        super('ShopScene');
    }

    create() {
        updateCurrencyUI(true);
        const bg = this.add.image(400, 250, 'agency_bg');
        bg.setDisplaySize(800, 500);
        bg.setAlpha(0.3);

        // Header panel
        const headerPanel = this.add.graphics();
        headerPanel.fillStyle(0xf18c8e, 1);
        headerPanel.fillRoundedRect(250, 20, 300, 60, 20);
        headerPanel.lineStyle(4, 0xffffff, 1);
        headerPanel.strokeRoundedRect(250, 20, 300, 60, 20);

        this.add.text(400, 50, 'AGENCY SHOP', { 
            color: '#ffffff', 
            fontSize: '28px', 
            fontWeight: 'bold',
            fontFamily: 'Arial Black'
        }).setOrigin(0.5);

        // Product list
        const startX = 100;
        const startY = 150;
        const spacingX = 150;
        const spacingY = 160;

        SHOP_ITEMS.forEach((item, index) => {
            const row = Math.floor(index / 5);
            const col = index % 5;
            const x = startX + col * spacingX;
            const y = startY + row * spacingY;

            const isPurchased = purchasedItems.has(item.name);

            // Item card background
            const cardBg = this.add.graphics();
            cardBg.fillStyle(0xffffff, 0.85);
            cardBg.fillRoundedRect(x - 65, y - 50, 130, 140, 12);
            cardBg.lineStyle(2, 0xe6d5c3, 1);
            cardBg.strokeRoundedRect(x - 65, y - 50, 130, 140, 12);

            // Item image
            const img = this.add.image(x, y, item.texture);
            const scale = 70 / Math.max(img.width, img.height);
            img.setScale(scale);

            this.add.text(x, y + 45, item.displayName, { 
                color: '#5f4b32', 
                fontSize: '14px', 
                fontWeight: 'bold' 
            }).setOrigin(0.5);
            
            const priceText = isPurchased ? 'BOUGHT' : `${item.price}`;
            const btnColor = isPurchased ? 0xcccccc : 0x8fb9a8;
            
            const buyBtn = this.add.container(x, y + 75);
            const buyBtnBg = this.add.graphics();
            buyBtnBg.fillStyle(btnColor, 1);
            buyBtnBg.fillRoundedRect(-50, -15, 100, 30, 8);
            
            const buyBtnText = this.add.text(0, 0, priceText, { 
                color: '#fff', 
                fontSize: '12px', 
                fontWeight: 'bold' 
            }).setOrigin(0.5);

            if (!isPurchased) {
                const coinIcon = this.add.circle(35, 0, 6, 0xffd700).setStrokeStyle(1, 0x5f4b32);
                buyBtn.add([buyBtnBg, buyBtnText, coinIcon]);
                
                buyBtn.setInteractive(new Phaser.Geom.Rectangle(-50, -15, 100, 30), Phaser.Geom.Rectangle.Contains);
                buyBtn.useHandCursor = true;

                buyBtn.on('pointerdown', () => {
                    if (currency >= item.price) {
                        currency -= item.price;
                        purchasedItems.add(item.name);
                        updateCurrencyUI();
                        buyBtnBg.clear();
                        buyBtnBg.fillStyle(0xcccccc, 1);
                        buyBtnBg.fillRoundedRect(-50, -15, 100, 30, 8);
                        buyBtnText.setText('BOUGHT');
                        if (coinIcon) coinIcon.destroy();
                        buyBtn.disableInteractive();
                        this.cameras.main.shake(100, 0.005);
                    } else {
                        const errorMsg = this.add.text(400, 430, 'Not enough coins!', { 
                            color: '#ff0000', 
                            fontSize: '20px',
                            fontWeight: 'bold',
                            backgroundColor: '#ffffffcc',
                            padding: { x: 10, y: 5 }
                        }).setOrigin(0.5).setAlpha(1);
                        this.tweens.add({ targets: errorMsg, alpha: 0, delay: 1000, duration: 500, onComplete: () => errorMsg.destroy() });
                        this.cameras.main.shake(200, 0.01);
                    }
                });

                buyBtn.on('pointerover', () => buyBtn.setScale(1.05));
                buyBtn.on('pointerout', () => buyBtn.setScale(1.0));
            } else {
                buyBtn.add([buyBtnBg, buyBtnText]);
            }
        });

        const backBtn = this.add.container(400, 460);
        const backBtnBg = this.add.graphics();
        backBtnBg.fillStyle(0x8fb9a8, 1);
        backBtnBg.fillRoundedRect(-75, -20, 150, 40, 10);
        backBtnBg.lineStyle(2, 0xffffff, 1);
        backBtnBg.strokeRoundedRect(-75, -20, 150, 40, 10);

        const backBtnText = this.add.text(0, 0, 'BACK TO OFFICE', { 
            color: '#fff', 
            fontSize: '16px', 
            fontWeight: 'bold' 
        }).setOrigin(0.5);

        backBtn.add([backBtnBg, backBtnText]);
        backBtn.setInteractive(new Phaser.Geom.Rectangle(-75, -20, 150, 40), Phaser.Geom.Rectangle.Contains);
        backBtn.useHandCursor = true;

        backBtn.on('pointerdown', () => {
            this.scene.start('BriefingScene');
        });
        
        backBtn.on('pointerover', () => backBtn.setScale(1.05));
        backBtn.on('pointerout', () => backBtn.setScale(1.0));
    }
}

// --- Scene: Briefing ---
class BriefingScene extends Phaser.Scene {
    constructor() {
        super('BriefingScene');
    }

    init(data) {
        this.result = (data && data.result) ? data.result : null; // 'success', 'failure' or null
    }

    preload() {
        const version = Date.now();
        this.load.image('agency_bg', 'assets/rooms/agency.png?v=' + version);
        this.load.image('tablee', 'assets/tablee.png?v=' + version);

        // Load all residents from the new folder
        this.load.image('rabbit', 'assets/custumers/rabbit.png?v=' + version);
        this.load.image('bear', 'assets/custumers/bear.png?v=' + version);
        this.load.image('cat', 'assets/custumers/cat.png?v=' + version);
        this.load.image('dog', 'assets/custumers/dog.png?v=' + version);
        this.load.image('fox', 'assets/custumers/fox.png?v=' + version);
        this.load.image('pig', 'assets/custumers/pig.png?v=' + version);
        
        // Load all shop assets from right_view (per requirements)
        this.load.image('table2', 'assets/floor_items/right_view/table2.png?v=' + version);
        this.load.image('chair2', 'assets/floor_items/right_view/chair2.png?v=' + version);
        this.load.image('flower2', 'assets/floor_items/right_view/flower2.png?v=' + version);
        this.load.image('puffic2', 'assets/floor_items/right_view/puffic2.png?v=' + version);
        this.load.image('stairs2', 'assets/floor_items/right_view/stairs2.png?v=' + version);
        this.load.image('mirror2', 'assets/wall_items/right_view/mirror.png?v=' + version); 
        this.load.image('clock2', 'assets/wall_items/right_view/clock2.png?v=' + version);
        this.load.image('shell2', 'assets/wall_items/right_view/shelf2.png?v=' + version);
    }

    create() {
        if (document.getElementById('ui-panel')) {
            document.getElementById('ui-panel').style.display = 'none';
        }
        updateCurrencyUI(true);

        // Background: Using the added agency background
        const bg = this.add.image(400, 250, 'agency_bg');
        bg.setDisplaySize(800, 500);
        bg.setDepth(0);
        
        // Agency Counter (New combined asset)
        const counter = this.add.image(400, 420, 'tablee');
        counter.setDepth(10); 
        // Scale it to fit within 800px width and avoid being cut off
        if (counter.width > 800) {
            counter.setDisplaySize(800, counter.height * (800 / counter.width));
        }
        // If it's still too tall, further scale it down (Increased height limit from 350 to 450)
        if (counter.displayHeight > 350) {
            counter.setDisplaySize(counter.displayWidth * (350 / counter.displayHeight), 350);
        }
        // Ensure it doesn't go out of the right bound
        if (counter.x + counter.displayWidth / 2 > 800) {
            counter.x = 800 - counter.displayWidth / 2;
        }
        // Ensure it doesn't go out of the left bound
        if (counter.x - counter.displayWidth / 2 < 0) {
            counter.x = counter.displayWidth / 2;
        }
        // Reposition to be at the bottom but fully visible, moving it even lower
        counter.y = 500 - (counter.displayHeight * 0.35);
        
        // We define these as coordinates for animations, matching the tablee layout roughly
        // Tips are usually on the right, Cash on the left in the tablee sprite
        this.tipJar = { x: counter.x + (counter.displayWidth * 0.3), y: counter.y - (counter.displayHeight * 0.2) };
        this.register = { x: counter.x - (counter.displayWidth * 0.3), y: counter.y - (counter.displayHeight * 0.2) };

        // Character (Resident)
        const commission = getCurrentCommission();
        const targetX = counter.x; // Align with the counter's center
        
        // КРИТИЧЕСКИ ВАЖНО: Если мы возвращаемся из магазина или показываем результат, 
        // персонаж должен БЫТЬ у кассы (startX = targetX) и анимация НЕ должна проигрываться.
        const shouldStayAtCounter = this.result || isCharacterAtCounter;
        const startX = shouldStayAtCounter ? targetX : -100;
        
        const characterContainer = this.add.container(startX, 320);
        
        // Using resident-specific sprite
        const residentTexture = commission.residentType || 'rabbit';
        const resident = this.add.image(0, 40, residentTexture); 
        resident.setScale(0.6); 
        
        if (this.result && this.result.score < 50) {
            resident.setTint(0x888888); 
        }
        
        characterContainer.add([resident]);
        characterContainer.setDepth(5); 
        
        this.characterSprite = resident; 

        // Speech Bubble Group
        this.bubbleGroup = this.add.group();
        const bubbleX = 350;
        const bubbleY = 80;
        const bubbleW = 400;
        const bubbleH = 210; // Slightly taller
        
        const bubble = this.add.graphics();
        bubble.fillStyle(0xffffff, 1);
        bubble.fillRoundedRect(bubbleX, bubbleY, bubbleW, bubbleH, 16);
        bubble.lineStyle(2, 0xe6d5c3, 1);
        bubble.strokeRoundedRect(bubbleX, bubbleY, bubbleW, bubbleH, 16);
        
        bubble.beginPath();
        bubble.moveTo(450, bubbleY + bubbleH);
        bubble.lineTo(430, bubbleY + bubbleH + 30);
        bubble.lineTo(470, bubbleY + bubbleH);
        bubble.closePath();
        bubble.fillPath();
        bubble.strokePath();

        let message = commission.brief;
        if (this.result) {
            const score = Math.round(this.result.score);
            const statusText = this.result.score >= 80 ? "EXCELLENT!" : (this.result.score >= 50 ? "GOOD" : "TERRIBLE...");
            
            if (this.result.isBinary) {
                if (this.result.score >= 80) {
                    message = `EXCELLENT!\n\nThis is just great! You did exactly what I asked. Here is your reward!`;
                } else {
                    message = `TERRIBLE...\n\nThis is not what I asked for at all. Your reputation is suffering!`;
                }
            } else {
                message = `${statusText}\nScore: ${score}%\n\n`;
                
                if (this.result.score >= 100) message += "This is just great! You matched the mood perfectly. Here is your tip!";
                else if (this.result.score >= 80) message += "I really like it! Almost everything is as I wanted. Thank you!";
                else if (this.result.score >= 50) message += "Not bad, but something is missing. Try harder next time.";
                else message += "Terrible... This is not what I asked for at all. Your reputation is suffering!";

                // Detailed breakdown
                const hardScore = Math.round(score - (this.result.vibeBonus || 0));
                const vibeBonus = Math.round(this.result.vibeBonus || 0);
                message += `\n(Base: ${hardScore}%`;
                if (vibeBonus > 0) message += `, Style Bonus: +${vibeBonus}%`;
                message += `)`;
            }

            // Progress Bar Background
            if (!this.result.isBinary) {
                const barBg = this.add.graphics();
                barBg.fillStyle(0xeeeeee, 1);
                barBg.fillRoundedRect(bubbleX + 25, bubbleY + bubbleH - 70, 350, 15, 7);
                this.bubbleGroup.add(barBg);

                // Progress Bar Fill
                const barFill = this.add.graphics();
                const barColor = this.result.score >= 80 ? 0x8fb9a8 : (this.result.score >= 50 ? 0xffcc00 : 0xf18c8e);
                barFill.fillStyle(barColor, 1);
                const fillWidth = Math.max(10, (score / 110) * 350);
                barFill.fillRoundedRect(bubbleX + 25, bubbleY + bubbleH - 70, fillWidth, 15, 7);
                this.bubbleGroup.add(barFill);
            }
        }

        // Scrollable Text Container
        const textMaskShape = this.add.graphics();
        textMaskShape.fillStyle(0xffffff, 0);
        textMaskShape.fillRoundedRect(bubbleX + 15, bubbleY + 15, bubbleW - 30, bubbleH - 85, 0);
        const textMask = textMaskShape.createGeometryMask();

        const textY = bubbleY + 25;
        this.speechText = this.add.text(bubbleX + 25, textY, message, {
            color: '#5f4b32',
            fontSize: '16px',
            wordWrap: { width: 350 }
        });
        this.speechText.setMask(textMask);
        
        // Interaction for scrolling
        const scrollArea = new Phaser.Geom.Rectangle(bubbleX, bubbleY, bubbleW, bubbleH - 75);
        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
            if (scrollArea.contains(pointer.x, pointer.y)) {
                this.speechText.y -= deltaY * 0.5;
                this.clampTextScroll(textY, bubbleH - 100);
            }
        });

        // Touch/Mouse drag scroll
        let isDragging = false;
        let startY = 0;
        let startTextY = 0;
        
        this.input.on('pointerdown', (pointer) => {
            if (scrollArea.contains(pointer.x, pointer.y)) {
                isDragging = true;
                startY = pointer.y;
                startTextY = this.speechText.y;
            }
        });
        
        this.input.on('pointermove', (pointer) => {
            if (isDragging) {
                const diff = pointer.y - startY;
                this.speechText.y = startTextY + diff;
                this.clampTextScroll(textY, bubbleH - 100);
            }
        });
        
        this.input.on('pointerup', () => { isDragging = false; });

        // Buttons (FIXED POSITION AT BOTTOM OF BUBBLE)
        const btnContainer = this.add.container(bubbleX + bubbleW/2, bubbleY + bubbleH - 30);
        
        const btnBg = this.add.graphics();
        btnBg.fillStyle(0xf18c8e, 1);
        btnBg.fillRoundedRect(-90, -22, 180, 45, 12);
        btnBg.lineStyle(3, 0xffffff, 1);
        btnBg.strokeRoundedRect(-90, -22, 180, 45, 12);
        
        let btnLabel = this.result ? 'NEXT' : 'ACCEPT';
        const btnText = this.add.text(0, 0, btnLabel, { 
            color: '#ffffff', 
            fontSize: '18px', 
            fontWeight: 'bold',
            fontFamily: 'Arial Black'
        }).setOrigin(0.5);
        
        btnContainer.add([btnBg, btnText]);
        
        const btnHitArea = new Phaser.Geom.Rectangle(-90, -22, 180, 45);
        btnContainer.setInteractive(btnHitArea, Phaser.Geom.Rectangle.Contains);
        btnContainer.useHandCursor = true;

        // Floating animation
        this.tweens.add({
            targets: btnContainer,
            y: bubbleY + bubbleH - 35,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        btnContainer.on('pointerover', () => {
            btnContainer.setScale(1.1);
            btnBg.clear();
            btnBg.fillStyle(0xe07b7d, 1);
            btnBg.fillRoundedRect(-90, -22, 180, 45, 12);
            btnBg.lineStyle(3, 0xffffff, 1);
            btnBg.strokeRoundedRect(-90, -22, 180, 45, 12);
        });
        
        btnContainer.on('pointerout', () => {
            btnContainer.setScale(1.0);
            btnBg.clear();
            btnBg.fillStyle(0xf18c8e, 1);
            btnBg.fillRoundedRect(-90, -22, 180, 45, 12);
            btnBg.lineStyle(3, 0xffffff, 1);
            btnBg.strokeRoundedRect(-90, -22, 180, 45, 12);
        });
        
        this.bubbleGroup.addMultiple([bubble, this.speechText, btnContainer]);
        this.bubbleGroup.setVisible(false);

        // SHOP Button (Styled as Agency Shop Sign)
        const shopContainer = this.add.container(85, 55);
        shopContainer.setDepth(100);
        
        // Background for shop sign: Pink with rounded corners
        const shopSignBg = this.add.graphics();
        shopSignBg.fillStyle(0xf18c8e, 1);
        shopSignBg.fillRoundedRect(-60, -25, 120, 50, 15);
        shopSignBg.lineStyle(3, 0xffffff, 1);
        shopSignBg.strokeRoundedRect(-60, -25, 120, 50, 15);
        
        const shopSignText = this.add.text(0, 0, 'SHOP', { 
            color: '#ffffff', 
            fontSize: '22px', 
            fontWeight: 'bold',
            fontFamily: 'Arial Black'
        }).setOrigin(0.5, 0.5);
        
        shopContainer.add([shopSignBg, shopSignText]);
        
        const shopHitArea = new Phaser.Geom.Rectangle(-60, -25, 120, 50);
        shopContainer.setInteractive(shopHitArea, Phaser.Geom.Rectangle.Contains);
        shopContainer.useHandCursor = true;
        
        // No floating animation for shop button

        shopContainer.on('pointerover', () => {
            shopContainer.setScale(1.1);
            shopSignBg.clear();
            shopSignBg.fillStyle(0xe07b7d, 1);
            shopSignBg.fillRoundedRect(-60, -25, 120, 50, 15);
            shopSignBg.lineStyle(3, 0xffffff, 1);
            shopSignBg.strokeRoundedRect(-60, -25, 120, 50, 15);
        });
        
        shopContainer.on('pointerout', () => {
            shopContainer.setScale(1.0);
            shopSignBg.clear();
            shopSignBg.fillStyle(0xf18c8e, 1);
            shopSignBg.fillRoundedRect(-60, -25, 120, 50, 15);
            shopSignBg.lineStyle(3, 0xffffff, 1);
            shopSignBg.strokeRoundedRect(-60, -25, 120, 50, 15);
        });

        shopContainer.on('pointerdown', () => {
            this.scene.start('ShopScene');
        });

        // PLACES Button (Styled like Shop Button, below it)
        const placesContainer = this.add.container(85, 115);
        placesContainer.setDepth(100);
        
        const placesBg = this.add.graphics();
        placesBg.fillStyle(0xf18c8e, 1);
        placesBg.fillRoundedRect(-60, -25, 120, 50, 15);
        placesBg.lineStyle(3, 0xffffff, 1);
        placesBg.strokeRoundedRect(-60, -25, 120, 50, 15);
        
        const placesText = this.add.text(0, 0, 'PLACES', { 
            color: '#ffffff', 
            fontSize: '22px', 
            fontWeight: 'bold',
            fontFamily: 'Arial Black'
        }).setOrigin(0.5, 0.5);
        
        placesContainer.add([placesBg, placesText]);

        // Exclamation Mark (Notification)
        // Only show if reputation has increased beyond what the player has seen
        let hasNewRooms = false;
        for (let i = 0; i < ROOM_UNLOCKS.length; i++) {
            if (reputation >= ROOM_UNLOCKS[i] && maxSeenReputation < ROOM_UNLOCKS[i]) {
                hasNewRooms = true;
                break;
            }
        }

        if (hasNewRooms) {
            const notifyCircle = this.add.graphics();
            notifyCircle.fillStyle(0xff0000, 1);
            notifyCircle.fillCircle(55, -25, 12);
            notifyCircle.lineStyle(2, 0xffffff, 1);
            notifyCircle.strokeCircle(55, -25, 12);
            
            const notifyText = this.add.text(55, -25, '!', {
                color: '#ffffff',
                fontSize: '18px',
                fontWeight: 'bold',
                fontFamily: 'Arial Black'
            }).setOrigin(0.5);
            
            placesContainer.add([notifyCircle, notifyText]);

            // Simple scale pulse for the whole button if it has a notification
            this.tweens.add({
                targets: placesContainer,
                scale: 1.05,
                duration: 800,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
        
        const placesHitArea = new Phaser.Geom.Rectangle(-60, -25, 120, 50);
        placesContainer.setInteractive(placesHitArea, Phaser.Geom.Rectangle.Contains);
        placesContainer.useHandCursor = true;

        placesContainer.on('pointerover', () => {
            placesContainer.setScale(hasNewRooms ? 1.15 : 1.1);
            placesBg.clear();
            placesBg.fillStyle(0xe07b7d, 1);
            placesBg.fillRoundedRect(-60, -25, 120, 50, 15);
            placesBg.lineStyle(3, 0xffffff, 1);
            placesBg.strokeRoundedRect(-60, -25, 120, 50, 15);
        });
        
        placesContainer.on('pointerout', () => {
            placesContainer.setScale(hasNewRooms ? 1.0 : 1.0);
            placesBg.clear();
            placesBg.fillStyle(0xf18c8e, 1);
            placesBg.fillRoundedRect(-60, -25, 120, 50, 15);
            placesBg.lineStyle(3, 0xffffff, 1);
            placesBg.strokeRoundedRect(-60, -25, 120, 50, 15);
        });

        placesContainer.on('pointerdown', () => {
            this.scene.start('RoomSelectScene');
        });

        // Coins counter
        this.currencyText = this.add.text(780, 20, `Coins: ${currency}`, { 
            color: '#5f4b32', 
            fontSize: '20px', 
            fontWeight: 'bold' 
        }).setOrigin(1, 0);

        if (shouldStayAtCounter) {
            // Сразу показываем результат или возвращаемся из магазина
            this.bubbleGroup.setVisible(true);
            
            // ПРИНУДИТЕЛЬНО останавливаем любые движения и ставим в цель
            this.tweens.killTweensOf(characterContainer);
            characterContainer.x = targetX;

            if (this.result) {
                if (!isEconomyAnimationPlayed) {
                    this.handleEconomyAnimation(this.result, characterContainer);
                }
                isCharacterAtCounter = false; // Сбрасываем для следующего клиента ПОСЛЕ завершения уровня
            } else {
                // Мы просто вернулись из магазина, персонаж уже стоит и ждет
                isCharacterAtCounter = true; 
            }
        } else {
            // Анимация: Персонаж заходит в офис (Новый заказ)
            isCharacterAtCounter = true; // Устанавливаем сразу, чтобы при переходе в магазин он "зафиксировался"
            this.tweens.add({
                targets: characterContainer,
                x: targetX, 
                duration: 2000,
                ease: 'Power2',
                onComplete: () => {
                    this.bubbleGroup.setVisible(true);
                }
            });
        }

        btnContainer.on('pointerdown', () => {
            if (this.result) {
                currentLevel++; // Move to next level only when clicking NEXT
                isEconomyAnimationPlayed = false; // Reset for next customer
                this.scene.start('RoomSelectScene');
            } else {
                this.scene.start('DesignScene');
            }
        });
    }

    clampTextScroll(startY, maxHeight) {
        if (!this.speechText) return;
        const textHeight = this.speechText.height;
        if (textHeight <= maxHeight) {
            this.speechText.y = startY;
            return;
        }
        const minY = startY - (textHeight - maxHeight);
        if (this.speechText.y > startY) this.speechText.y = startY;
        if (this.speechText.y < minY) this.speechText.y = minY;
    }

    handleReview(character) {
        // Show reaction directly
        const score = this.result ? this.result.score : 0;
        let message = "";
        if (score >= 100) {
            message = "It's absolutely magnificent! You perfectly captured the mood. Here's your tip!";
        } else if (score >= 80) {
            message = "I really like it! It's almost everything I wanted. Thank you!";
        } else if (score >= 50) {
            message = "Not bad, but something is missing. Try harder next time.";
        } else {
            message = "Terrible... This is not what I asked for at all. Your reputation is suffering!";
            if (this.characterSprite) this.characterSprite.setTint(0x888888); 
        }

        const scoreVal = Math.round(score);
        const statusText = score >= 80 ? "EXCELLENT!" : (score >= 50 ? "GOOD" : "TERRIBLE...");
        
        let fullMessage = "";
        if (this.result && this.result.isBinary) {
            fullMessage = `${statusText}\n\n${message}`;
        } else {
            fullMessage = `${statusText}\nScore: ${scoreVal}%\n\n${message}`;
            if (this.result) {
                const hardScore = Math.round(scoreVal - (this.result.vibeBonus || 0));
                const vibeBonus = Math.round(this.result.vibeBonus || 0);
                fullMessage += `\n(Base: ${hardScore}%`;
                if (vibeBonus > 0) fullMessage += `, Style Bonus: +${vibeBonus}%`;
                fullMessage += `)`;
            }
        }
        
        if (this.speechText) {
            this.speechText.setText(fullMessage);
            this.speechText.y = 105; // Reset scroll
        }

        this.handleEconomyAnimation(this.result, character);
        
        // Show "CONTINUE" button after a short delay inside the bubble
        this.time.delayedCall(500, () => {
            const bubbleX = 350;
            const bubbleY = 80;
            const bubbleW = 400;
            const bubbleH = 210;
            
            const continueBtnContainer = this.add.container(bubbleX + bubbleW/2, bubbleY + bubbleH - 30);
            
            const continueBtnBg = this.add.graphics();
            continueBtnBg.fillStyle(0xf18c8e, 1);
            continueBtnBg.fillRoundedRect(-90, -22, 180, 45, 12);
            continueBtnBg.lineStyle(3, 0xffffff, 1);
            continueBtnBg.strokeRoundedRect(-90, -22, 180, 45, 12);
            
            const continueBtnText = this.add.text(0, 0, 'NEXT', { 
                color: '#ffffff', 
                fontSize: '18px', 
                fontWeight: 'bold',
                fontFamily: 'Arial Black'
            }).setOrigin(0.5);
            
            continueBtnContainer.add([continueBtnBg, continueBtnText]);
            
            const btnHitArea = new Phaser.Geom.Rectangle(-90, -22, 180, 45);
            continueBtnContainer.setInteractive(btnHitArea, Phaser.Geom.Rectangle.Contains);
            continueBtnContainer.useHandCursor = true;

            // Floating animation
            this.tweens.add({
                targets: continueBtnContainer,
                y: bubbleY + bubbleH - 35,
                duration: 1500,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            continueBtnContainer.on('pointerover', () => {
                continueBtnContainer.setScale(1.1);
                continueBtnBg.clear();
                continueBtnBg.fillStyle(0xe07b7d, 1);
                continueBtnBg.fillRoundedRect(-90, -22, 180, 45, 12);
                continueBtnBg.lineStyle(3, 0xffffff, 1);
                continueBtnBg.strokeRoundedRect(-90, -22, 180, 45, 12);
            });
            
            continueBtnContainer.on('pointerout', () => {
                continueBtnContainer.setScale(1.0);
                continueBtnBg.clear();
                continueBtnBg.fillStyle(0xf18c8e, 1);
                continueBtnBg.fillRoundedRect(-90, -22, 180, 45, 12);
                continueBtnBg.lineStyle(3, 0xffffff, 1);
                continueBtnBg.strokeRoundedRect(-90, -22, 180, 45, 12);
            });

            if (this.bubbleGroup) this.bubbleGroup.add(continueBtnContainer);

            continueBtnContainer.on('pointerdown', () => {
                currentLevel++; // Move to next level here
                isEconomyAnimationPlayed = false; // Reset for next customer
                this.scene.start('RoomSelectScene');
            });
        });
    }

    handleEconomyAnimation(result, character) {
        if (!result) return;
        isEconomyAnimationPlayed = true; 
        
        const score = result.score;
        const reward = result.reward || 0;
        
        if (reward > 0) {
            const coin = this.add.circle(character.x, character.y - 20, 10, 0xffd700);
            coin.setStrokeStyle(2, 0x5f4b32);
            coin.setDepth(20);

            this.tweens.add({
                targets: coin,
                x: this.tipJar.x,
                y: this.tipJar.y,
                duration: 800,
                ease: 'Back.easeIn',
                onComplete: () => {
                    coin.destroy();
                    this.cameras.main.shake(100, 0.01);
                    this.currencyText.setText(`Coins: ${currency}`);
                }
            });
        } else if (reward < 0) {
            const coin = this.add.circle(this.register.x, this.register.y, 10, 0xffd700);
            coin.setStrokeStyle(2, 0x5f4b32);
            coin.setDepth(20);

            this.tweens.add({
                targets: coin,
                x: character.x,
                y: character.y,
                duration: 800,
                ease: 'Power2',
                onComplete: () => coin.destroy()
            });
        }
    }
}

// --- Calibration & Surfaces ---
const ITEM_SIZES = {
    'Plant': { w: 1, h: 1 },
    'Lamp': { w: 1, h: 1 },
    'Chair': { w: 1, h: 1 },
    'Old Chair': { w: 1, h: 1 },
    'Table': { w: 2, h: 2 },
    'Bed': { w: 2, h: 2 },
    'Closet': { w: 2, h: 2 },
    'Window': { w: 2, h: 2 },
    'Mirror': { w: 1, h: 2 },
    'Table2': { w: 2, h: 2 },
    'Chair2': { w: 1, h: 1 },
    'Flower2': { w: 1, h: 1 },
    'Puffic2': { w: 1, h: 1 },
    'Stairs2': { w: 2, h: 2 },
    'Mirror2': { w: 1, h: 2 },
    'Clock2': { w: 1, h: 1 },
    'Shell2': { w: 2, h: 1 }
};

const DISPLAY_WIDTH = 800;
const DISPLAY_HEIGHT = 500;

const SCALE_X = 800 / 1536;
const SCALE_Y = 500 / 1024;

// Base grid coordinates (for 1536x1024 resolution)
const BASE_POINTS = {
    ceil: { x: 767.8 * SCALE_X, y: 40.0 * SCALE_Y },
    wall0: { x: 768.9 * SCALE_X, y: 310.7 * SCALE_Y },
    floor0: { x: 770.1 * SCALE_X, y: 331.4 * SCALE_Y },
    l_ceil: { x: 144.7 * SCALE_X, y: 356.3 * SCALE_Y },
    l_wall: { x: 207.5 * SCALE_X, y: 645.0 * SCALE_Y },
    l_floor: { x: 208.5 * SCALE_X, y: 670.0 * SCALE_Y },
    r_ceil: { x: 1389.3 * SCALE_X, y: 338.3 * SCALE_Y },
    r_wall: { x: 1327.5 * SCALE_X, y: 627.0 * SCALE_Y },
    r_floor: { x: 1335 * SCALE_X, y: 658.0 * SCALE_Y }
};

class Surface {
    constructor(origin, targetX, targetY, cols, rows) {
        this.origin = origin;
        this.basisX = { x: (targetX.x - origin.x) / cols, y: (targetX.y - origin.y) / cols };
        this.basisY = { x: (targetY.x - origin.x) / rows, y: (targetY.y - origin.y) / rows };
        this.cols = cols;
        this.rows = rows;

        // Precompute inverse matrix for screenToLocal
        // det = a*d - b*c
        const a = this.basisX.x;
        const c = this.basisX.y;
        const b = this.basisY.x;
        const d = this.basisY.y;
        const det = a * d - b * c;
        this.invDet = 1 / det;
        this.mInv = {
            a: d * this.invDet,
            b: -b * this.invDet,
            c: -c * this.invDet,
            d: a * this.invDet
        };
    }

    localToScreen(u, v) {
        return {
            x: this.origin.x + u * this.basisX.x + v * this.basisY.x,
            y: this.origin.y + u * this.basisX.y + v * this.basisY.y
        };
    }

    screenToLocal(x, y) {
        const dx = x - this.origin.x;
        const dy = y - this.origin.y;
        return {
            u: dx * this.mInv.a + dy * this.mInv.b,
            v: dx * this.mInv.c + dy * this.mInv.d
        };
    }

    worldToGrid(x, y) {
        const local = this.screenToLocal(x, y);
        return {
            gridX: Math.floor(local.u),
            gridY: Math.floor(local.v)
        };
    }
}

let SURFACES = {};

// --- Grid Occupancy Matrix ---
const GRID_OCCUPANCY = {
    floor: Array(12).fill().map(() => Array(12).fill(null)),
    left: Array(10).fill().map(() => Array(10).fill(null)),
    right: Array(10).fill().map(() => Array(10).fill(null))
};

function updateOccupancy(item, clear = false) {
    const side = item.wallSide || 'floor';
    const matrix = GRID_OCCUPANCY[side];
    if (!matrix) return;

    for (let y = item.gridY; y < item.gridY + item.gridH; y++) {
        for (let x = item.gridX; x < item.gridX + item.gridW; x++) {
            if (y >= 0 && y < 10 && x >= 0 && x < 10) {
                matrix[y][x] = clear ? null : item;
            }
        }
    }
}

// --- Scene: Design ---

function resetOccupancy() {
    GRID_OCCUPANCY.floor = Array(12).fill().map(() => Array(12).fill(null));
    GRID_OCCUPANCY.left = Array(10).fill().map(() => Array(10).fill(null));
    GRID_OCCUPANCY.right = Array(10).fill().map(() => Array(10).fill(null));
}

class DesignScene extends Phaser.Scene {
    constructor() {
        super('DesignScene');
    }

    preload() {
        // Load room template (add version for cache busting)
        const version = Date.now();
        const roomImg = ROOM_TEMPLATES[selectedRoom];
        this.load.image('room_bg', roomImg + '?v=' + version);
        
        // Load new furniture (left and right views)
        const floorItems = ['bed', 'chair', 'chair2', 'closet', 'plant', 'table', 'table2', 'lamp', 'flower2', 'puffic2', 'stairs2'];
        floorItems.forEach(item => {
            const fileName = item === 'puffic2' ? 'puffic2' : item; // normalized name
            this.load.image(`${item}_right`, `assets/floor_items/right_view/${fileName}.png?v=${version}`);
            this.load.image(`${item}_left`, `assets/floor_items/left_view/${fileName}.png?v=${version}`);
        });

        const wallItems = [
            { id: 'window', file: 'window' },
            { id: 'mirror', file: 'mirror' },
            { id: 'mirror2', file: 'mirror' }, // Mirror2 uses mirror.png in right_view/left_view
            { id: 'clock2', file: 'clock2' },
            { id: 'shell2', file: 'shelf2' } // Shell2 uses shelf2.png
        ];
        wallItems.forEach(item => {
            this.load.image(`${item.id}_right`, `assets/wall_items/right_view/${item.file}.png?v=${version}`);
            this.load.image(`${item.id}_left`, `assets/wall_items/left_view/${item.file}.png?v=${version}`);
        });

        // UI assets
        this.load.image('arrow_left', 'https://img.icons8.com/m_sharp/200/FFFFFF/left.png'); 
        this.load.image('arrow_right', 'https://img.icons8.com/m_sharp/200/FFFFFF/right.png'); 
    }

    create() {
        furnitureItems = []; // Reset items
        resetOccupancy(); // Reset occupancy grid when entering a new design project

        const p = BASE_POINTS;
        SURFACES = {
            floor: new Surface(p.floor0, p.r_floor, p.l_floor, 10, 10),
            left: new Surface(p.wall0, p.l_wall, p.ceil, 10, 10),
            right: new Surface(p.wall0, p.r_wall, p.ceil, 10, 10)
        };
        
        // Grid logic
        this.staticGridGraphics = this.add.graphics().setDepth(0.5);
        // Grid is hidden by default
        
        this.gridGraphics = this.add.graphics().setDepth(1);
        
        if (document.getElementById('ui-panel')) {
            document.getElementById('ui-panel').style.display = 'block';
            updateCurrencyUI(false);
            
            // Update brief
            const commission = getCurrentCommission();
            document.getElementById('resident-name').innerText = commission.residentName;
            document.getElementById('brief-text').innerText = commission.brief;


            // Set room background via CSS for 100% stability
            const container = document.getElementById('game-container');
            const roomImg = ROOM_TEMPLATES[selectedRoom];
            container.style.backgroundImage = `url('${roomImg}?v=${Date.now()}')`;
            
            // Dynamic inventory button list update
            this.updateInventoryUI();
        }
        
        // In Phaser we no longer create background so it can't move
        this.bg = null;
        
        // Block any zoom or camera position changes
        this.cameras.main.setZoom(1);
        this.cameras.main.centerOn(400, 250);


        // Initial placement of items (Floor item chair, Wall items window and mirror)
        const chairSize = ITEM_SIZES['Chair'] || { w: 1, h: 1 };
        const chairX = 8;
        const chairY = 0;
        if (this.isSpaceFree(chairX, chairY, chairSize.w, chairSize.h)) {
            this.addFurnitureObject(chairX, chairY, 'Chair', 0x8b7355);
        }

        const windowSize = ITEM_SIZES['Window'] || { w: 2, h: 2 };
        const windowX = 4;
        const windowY = 4;
        if (this.isSpaceFree(windowX, windowY, windowSize.w, windowSize.h, null, 'left')) {
            this.addFurnitureObject(windowX, windowY, 'Window', 0xadd8e6, 'left');
        }

        const mirrorSize = ITEM_SIZES['Mirror'] || { w: 1, h: 2 };
        const mirrorX = 4;
        const mirrorY = 4;
        if (this.isSpaceFree(mirrorX, mirrorY, mirrorSize.w, mirrorSize.h, null, 'right')) {
            this.addFurnitureObject(mirrorX, mirrorY, 'Mirror', 0xe0e0e0, 'right');
        }

        // New Phaser "Done!" button (matches SHOP button style)
        const doneBtnContainer = this.add.container(400, 460).setDepth(1000);
        
        const doneBtnBg = this.add.graphics();
        doneBtnBg.fillStyle(0xf18c8e, 1);
        doneBtnBg.fillRoundedRect(-60, -20, 120, 40, 12);
        doneBtnBg.lineStyle(3, 0xffffff, 1);
        doneBtnBg.strokeRoundedRect(-60, -20, 120, 40, 12);
        
        const doneBtnText = this.add.text(0, 0, 'DONE!', { 
            color: '#ffffff', 
            fontSize: '18px', 
            fontWeight: 'bold',
            fontFamily: 'Arial Black'
        }).setOrigin(0.5);
        
        doneBtnContainer.add([doneBtnBg, doneBtnText]);
        
        doneBtnContainer.setInteractive(new Phaser.Geom.Rectangle(-60, -20, 120, 40), Phaser.Geom.Rectangle.Contains);
        doneBtnContainer.useHandCursor = true;
        
        // No floating animation for done button
        
        doneBtnContainer.on('pointerover', () => {
            doneBtnContainer.setScale(1.1);
            doneBtnBg.clear();
            doneBtnBg.fillStyle(0xe07b7d, 1);
            doneBtnBg.fillRoundedRect(-60, -20, 120, 40, 12);
            doneBtnBg.lineStyle(3, 0xffffff, 1);
            doneBtnBg.strokeRoundedRect(-60, -20, 120, 40, 12);
        });
        
        doneBtnContainer.on('pointerout', () => {
            doneBtnContainer.setScale(1.0);
            doneBtnBg.clear();
            doneBtnBg.fillStyle(0xf18c8e, 1);
            doneBtnBg.fillRoundedRect(-60, -20, 120, 40, 12);
            doneBtnBg.lineStyle(3, 0xffffff, 1);
            doneBtnBg.strokeRoundedRect(-60, -20, 120, 40, 12);
        });
        
        doneBtnContainer.on('pointerdown', () => {
            if (window.submitGame) window.submitGame();
        });

        this.updateUI();

        window.addFurniture = (type) => {
            let color = 0xcccccc;
            if (type === 'Plant') color = 0x228B22;
            if (type === 'Lamp') color = 0xFFFF00;
            if (type === 'Table' || type === 'Table2') color = 0xdeb887;
            if (type === 'Bed') color = 0xadd8e6;
            if (type === 'Chair' || type === 'Chair2') color = 0x8b7355;
            if (type === 'Closet') color = 0x6b4226;
            if (type === 'Window') color = 0xadd8e6;
            if (type === 'Mirror' || type === 'Mirror2') color = 0xe0e0e0;
            if (type === 'Flower2') color = 0xff69b4;
            if (type === 'Puffic2') color = 0x9370db;
            if (type === 'Stairs2') color = 0x8b4513;
            if (type === 'Clock2') color = 0xffd700;
            if (type === 'Shell2') color = 0xffa500;
            
            const isWallItem = (type === 'Window' || type === 'Mirror' || type === 'Mirror2' || type === 'Clock2' || type === 'Shell2');
            const size = ITEM_SIZES[type] || { w: 2, h: 2 };
            const pos = isWallItem ? this.findFreeWallSpace(size.w, size.h) : this.findFreeSpace(size.w, size.h);
            
            if (pos) {
                this.addFurnitureObject(pos.gridX, pos.gridY, type, color, pos.wallSide);
            } else {
                alert("No free space!");
            }
        };

        window.submitGame = (e) => {
            // Remove binding to avoid repeat calls during transition
            window.submitGame = null;
            const submitBtn = document.getElementById('submit-btn');
            if (submitBtn) submitBtn.onclick = null;

            console.log("Submitting game logic execution...");
            const commission = getCurrentCommission();
            
            // 1. Check Hard Requirements (Add/Remove)
            let score = 0;
            const totalHard = commission.requiredAdd.length + commission.requiredRemove.length;
            let metHard = 0;

            // Check Additions (exact match or includes)
            const currentItemNames = furnitureItems.map(it => it.name.toLowerCase());
            commission.requiredAdd.forEach(req => {
                const idx = currentItemNames.findIndex(name => name.includes(req.toLowerCase()));
                if (idx !== -1) {
                    metHard++;
                    currentItemNames.splice(idx, 1); // Use each item only once for requirements
                }
            });

            // Check Removals
            const hasForbidden = furnitureItems.some(item => 
                commission.requiredRemove.some(req => item.name.toLowerCase().includes(req.toLowerCase()))
            );
            if (!hasForbidden) metHard += commission.requiredRemove.length;

            const hardPercent = (metHard / totalHard) * 100;
            
            // 2. Check Vibe (Mood) - Soft Requirement
            let vibeBonus = 0;
            if (commission.requiredVibe) {
                const matchingItems = furnitureItems.filter(item => {
                    const itemVibes = ITEM_VIBES[item.name] || [];
                    return itemVibes.includes(commission.requiredVibe);
                });
                // Bonus based on count of matching vibe items
                vibeBonus = Math.min(20, matchingItems.length * 5); 
            }

            score = hardPercent + vibeBonus;
            score = Math.min(110, score); // Max score with bonus is 110%

            // Apply binary evaluation for commissions without vibe requirements
            const isBinary = !commission.requiredVibe;
            if (isBinary) {
                if (score >= 80) score = 100;
                else score = 0;
            }

            let finalReward = 0;
            let status = 'failure';
            let reputationChange = 0;

            if (score >= 80) {
                finalReward = commission.reward + (score > 100 ? 10 : 0);
                status = 'success';
                currency += finalReward;
                reputationChange = (score > 100) ? 0.3 : 0.2;
            } else if (score >= 50) {
                finalReward = Math.floor(commission.reward * 0.4);
                status = 'partial';
                currency += finalReward;
                reputationChange = 0.05;
            } else {
                finalReward = 0; // No reward, but currency doesn't decrease anymore
                status = 'failure';
                reputationChange = -0.2;
            }

            reputation = Math.max(1, reputation + reputationChange);
            updateCurrencyUI();

            // Transition to agency hall with IMMEDIATELY visible result
            const feedbackEl = document.getElementById('feedback');
            if (feedbackEl) {
                feedbackEl.style.display = 'block';
                if (score >= 80) feedbackEl.innerText = `Excellent! Score: ${Math.round(score)}%`;
                else if (score >= 50) feedbackEl.innerText = `Acceptable. Score: ${Math.round(score)}%`;
                else feedbackEl.innerText = `Poor... Score: ${Math.round(score)}%`;
                
                setTimeout(() => { feedbackEl.style.display = 'none'; }, 3000);
            }
            this.scene.start('BriefingScene', { result: { score: score, reward: finalReward, status: status, vibeBonus: vibeBonus, isBinary: isBinary } });
        };
    }

    update() {
        // Background image is in CSS, nothing to fix here
    }

    drawFullGrid() {
        this.staticGridGraphics.clear();
        this.staticGridGraphics.lineStyle(1, 0x8b7355, 0.4);

        const s = SURFACES.floor;
        for (let i = 0; i <= s.rows; i++) {
            const p1 = s.localToScreen(0, i);
            const p2 = s.localToScreen(s.cols, i);
            this.staticGridGraphics.lineBetween(p1.x, p1.y, p2.x, p2.y);
        }
        for (let i = 0; i <= s.cols; i++) {
            const p1 = s.localToScreen(i, 0);
            const p2 = s.localToScreen(i, s.rows);
            this.staticGridGraphics.lineBetween(p1.x, p1.y, p2.x, p2.y);
        }
    }

    drawWallGrid(side) {
        const s = SURFACES[side];
        if (!s) return;
        
        this.staticGridGraphics.lineStyle(1, 0x8b7355, 0.3);
        for (let i = 0; i <= s.rows; i++) {
            const p1 = s.localToScreen(0, i);
            const p2 = s.localToScreen(s.cols, i);
            this.staticGridGraphics.lineBetween(p1.x, p1.y, p2.x, p2.y);
        }
        for (let i = 0; i <= s.cols; i++) {
            const p1 = s.localToScreen(i, 0);
            const p2 = s.localToScreen(i, s.rows);
            this.staticGridGraphics.lineBetween(p1.x, p1.y, p2.x, p2.y);
        }
    }

    isoToScreen(gridX, gridY, wallSide) {
        const surface = SURFACES[wallSide || 'floor'];
        return surface.localToScreen(gridX, gridY);
    }

    screenToIso(x, y, isWallItem) {
        if (!isWallItem) {
            const s = SURFACES.floor;
            const dx = x - s.origin.x;
            const dy = y - s.origin.y;
            // Cross products against the two floor-wall junction edges.
            // Left junction (floor0→l_floor): cross > 0 means cursor is in left wall area.
            const crossLeft  = (s.basisY.x * s.rows) * dy - (s.basisY.y * s.rows) * dx;
            // Right junction (floor0→r_floor): cross < 0 means cursor is in right wall area.
            const crossRight = (s.basisX.x * s.cols) * dy - (s.basisX.y * s.cols) * dx;
            if (crossLeft > 0 || crossRight < 0) {
                return { gridX: -1, gridY: -1 };
            }
            const res = s.worldToGrid(x, y);
            return { gridX: res.gridX, gridY: res.gridY };
        } else {
            // Determine which wall is closer
            const localL = SURFACES.left.screenToLocal(x, y);
            const localR = SURFACES.right.screenToLocal(x, y);

            // Check if within bounds of the wall plane roughly, or just pick closest
            const distL = Math.max(0, -localL.u, localL.u - 10, -localL.v, localL.v - 10);
            const distR = Math.max(0, -localR.u, localR.u - 10, -localR.v, localR.v - 10);

            if (distL <= distR) {
                return { gridX: Math.floor(localL.u), gridY: Math.floor(localL.v), wallSide: 'left' };
            } else {
                return { gridX: Math.floor(localR.u), gridY: Math.floor(localR.v), wallSide: 'right' };
            }
        }
    }

    isSpaceFree(gridX, gridY, sizeW, sizeH, ignoreItem = null, wallSide = null) {
        const side = wallSide || 'floor';
        const surface = SURFACES[side];
        const matrix = GRID_OCCUPANCY[side];

        // Grid bounds check
        if (gridX < 0 || gridY < 0 || gridX + sizeW > surface.cols || gridY + sizeH > surface.rows) return false;

        // Matrix intersection check
        for (let y = gridY; y < gridY + sizeH; y++) {
            for (let x = gridX; x < gridX + sizeW; x++) {
                const occupant = matrix[y][x];
                if (occupant && occupant !== ignoreItem) {
                    return false;
                }
            }
        }
        return true;
    }

    findFreeWallSpace(sizeW, sizeH) {
        // Try left wall then right wall
        for (let side of ['left', 'right']) {
            const surface = SURFACES[side];
            for (let y = 0; y <= surface.rows - sizeH; y++) {
                for (let x = 0; x <= surface.cols - sizeW; x++) {
                    if (this.isSpaceFree(x, y, sizeW, sizeH, null, side)) return { gridX: x, gridY: y, wallSide: side };
                }
            }
        }
        return null;
    }

    findFreeSpace(sizeW, sizeH) {
        const surface = SURFACES.floor;
        for (let y = 0; y <= surface.rows - sizeH; y++) {
            for (let x = 0; x <= surface.cols - sizeW; x++) {
                if (this.isSpaceFree(x, y, sizeW, sizeH)) return { gridX: x, gridY: y };
            }
        }
        return null;
    }

    drawGridIndicator(gridX, gridY, sizeW, sizeH, isValid, wallSide, name = "") {
        this.gridGraphics.clear();
        const color = isValid ? 0x00ff00 : 0xff0000;
        this.gridGraphics.lineStyle(2, color, 0.8);
        this.gridGraphics.fillStyle(color, 0.3);

        let offsetX = 0;
        let offsetY = 0;
        if (name === 'Window' || name === 'Mirror') {
            offsetX = -1;
            offsetY = 0;
        }
        if (name === 'Table' || name === 'Bed'){
            offsetX = -1;
            offsetY = -1;
        }

        const p1 = this.isoToScreen(gridX + offsetX, gridY + offsetY, wallSide);
        const p2 = this.isoToScreen(gridX + sizeW + offsetX, gridY + offsetY, wallSide);
        const p3 = this.isoToScreen(gridX + sizeW + offsetX, gridY + sizeH + offsetY, wallSide);
        const p4 = this.isoToScreen(gridX + offsetX, gridY + sizeH + offsetY, wallSide);

        this.gridGraphics.beginPath();
        this.gridGraphics.moveTo(p1.x, p1.y);
        this.gridGraphics.lineTo(p2.x, p2.y);
        this.gridGraphics.lineTo(p3.x, p3.y);
        this.gridGraphics.lineTo(p4.x, p4.y);
        this.gridGraphics.closePath();
        this.gridGraphics.fillPath();
        this.gridGraphics.strokePath();
    }

    updateInventoryUI() {
        const invLeft = document.getElementById('inventory-left');
        const invRight = document.getElementById('inventory-right');
        if (!invLeft || !invRight) return;

        console.log("Updating split inventory UI...");
        const baseItems = ['Plant', 'Table', 'Bed', 'Chair', 'Closet', 'Lamp', 'Window', 'Mirror'];
        const allItems = [...baseItems];
        purchasedItems.forEach(item => allItems.push(item));

        invLeft.innerHTML = '<strong>Floor</strong>';
        invRight.innerHTML = '<strong>Walls</strong>';

        allItems.forEach(type => {
            const isWallItem = (type === 'Window' || type === 'Mirror' || type === 'Mirror2' || type === 'Clock2' || type === 'Shell2');
            
            const btn = document.createElement('button');
            btn.className = 'btn';
            btn.innerText = `+ ${type}`;
            btn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                window.addFurniture(type);
            };

            if (isWallItem) {
                invRight.appendChild(btn);
            } else {
                invLeft.appendChild(btn);
            }
        });
    }

    addFurnitureObject(gridX, gridY, name, color, wallSide = null) {
        const isWallItem = (name === 'Window' || name === 'Mirror' || name === 'Mirror2' || name === 'Clock2' || name === 'Shell2');
        const size = ITEM_SIZES[name] || { w: 2, h: 2 };
        const screenPos = this.isoToScreen(gridX, gridY, wallSide);
        const container = this.add.container(screenPos.x, screenPos.y);
        container.gridX = gridX;
        container.gridY = gridY;
        container.gridW = size.w;
        container.gridH = size.h;
        container.wallSide = wallSide;
        container.isWallItem = isWallItem;
        container.viewSide = (isWallItem && wallSide === 'left') ? 'left' : 'right'; // Wall items on left wall start as left_view
        
        container.setDepth(isWallItem ? 5 : 10 + gridX + gridY); 
        if (isWallItem) container.setDepth(container.wallSide === 'left' ? 6 : 7);
        
        const getTextureKey = (itemName, viewSide) => {
            let baseKey = itemName.toLowerCase().replace(' ', '_');
            // Mapping for specific names if needed
            if (baseKey === 'shelf2') baseKey = 'shell2'; // consistent with ITEM_SIZES and other logic
            
            const key = `${baseKey}_${viewSide}`;
            if (this.textures.exists(key)) return key;
            
            // Generic fallback to right view if side view doesn't exist
            const fallbackKey = `${baseKey}_right`;
            if (this.textures.exists(fallbackKey)) return fallbackKey;

            return null;
        };

        const updateVisualTexture = () => {
            const textureKey = getTextureKey(name, container.viewSide);
            if (textureKey && this.textures.exists(textureKey)) {
                visual.setTexture(textureKey);
                
                let maxDim = 150; 
                if (isWallItem) {
                    maxDim = 120;
                    if (name === 'Window' && container.viewSide === 'right') maxDim = 150; // Window on right wall was appearing smaller
                    if (name.includes('Clock') || name.includes('Shell')) maxDim = 80;
                }
                if (name.includes('2') && !isWallItem) {
                    maxDim = 130;
                }
                if (visual.width > maxDim || visual.height > maxDim) {
                    const scale = maxDim / Math.max(visual.width, visual.height);
                    visual.setScale(scale);
                }
            }
        };

        let initialTexture = getTextureKey(name, container.viewSide);
        let visual;
        
        if (initialTexture && this.textures.exists(initialTexture)) {
            visual = this.add.image(0, 0, initialTexture);
            let maxDim = 150; 
            if (isWallItem) {
                maxDim = 120;
                if (name === 'Window' && container.viewSide === 'right') maxDim = 150; // Window on right wall was appearing smaller
                if (name.includes('Clock') || name.includes('Shell')) maxDim = 80;
            }
            if (name.includes('2') && !isWallItem) {
                maxDim = 130;
            }
            if (visual.width > maxDim || visual.height > maxDim) {
                const scale = maxDim / Math.max(visual.width, visual.height);
                visual.setScale(scale);
            }
        } else {
            // Placeholder if image is missing
            visual = this.add.rectangle(0, 0, 80, 80, color);
            visual.setStrokeStyle(3, 0x5f4b32);
            
            let symbol = "";
            if (name.includes("Chair")) symbol = "🪑";
            if (name.includes("Table")) symbol = "Table";
            if (name.includes("Plant")) symbol = "🌿";
            if (name.includes("Lamp")) symbol = "💡";
            if (name.includes("Bed")) symbol = "🛏️";
            if (name.includes("Window")) symbol = "🪟";
            if (name.includes("Mirror")) symbol = "🪞";
            if (name.includes("Clock")) symbol = "⏰";
            if (name.includes("Shell")) symbol = "🐚";
            if (name.includes("Flower")) symbol = "🌸";
            if (name.includes("Puffic")) symbol = "🛋️";
            if (name.includes("Stairs")) symbol = "🪜";
            
            if (symbol) {
                const icon = this.add.text(0, 0, symbol, { fontSize: '32px' }).setOrigin(0.5);
                container.add(icon);
            }

            const label = this.add.text(0, 55, name, { fontSize: '14px', color: '#5f4b32', fontWeight: 'bold', backgroundColor: '#ffffff88' }).setOrigin(0.5);
            container.add(label);
        }
        
        container.addAt(visual, 0);
        visual.setOrigin(0.5, 0.5);
        visual.y = 0;

        // Arrows for floor items
        const isNoRotateItem = (name === 'Lamp' || name === 'Plant' || name === 'Flower2');
        if (!isWallItem && !isNoRotateItem) {
            const updateArrowsPosition = () => {
                const pCenter = this.isoToScreen(container.gridX + container.gridW / 2, container.gridY + container.gridH / 2, container.wallSide);
                const pBase = this.isoToScreen(container.gridX, container.gridY, container.wallSide);
                
                // Relative position within container
                // container.x, container.y is isoToScreen(gridX, gridY)
                // We want to be at center of the grid object, but vertically at the "base" level
                // Actually the indicator is drawn around the object.
                // Let's put them at the bottom corner or similar.
                // The user said "на уровне индикатора места".
                
                // Let's use the offset from container origin (gridX, gridY)
                const centerPos = this.isoToScreen(container.gridX + container.gridW / 2, container.gridY + container.gridH / 2, container.wallSide);
                const originPos = this.isoToScreen(container.gridX, container.gridY, container.wallSide);
                
                const relX = centerPos.x - originPos.x;
                const relY = centerPos.y - originPos.y;
                
                arrowR.setPosition(relX + 40, relY);
                arrowL.setPosition(relX - 40, relY);
            };

            const arrowR = this.add.image(0, 0, 'arrow_right').setScale(0.12).setInteractive({ useHandCursor: true }).setTint(0xf18c8e);
            const arrowL = this.add.image(0, 0, 'arrow_left').setScale(0.12).setInteractive({ useHandCursor: true }).setTint(0xf18c8e);
            
            // Add slight hover effect for "cuteness"
            [arrowR, arrowL].forEach(arrow => {
                arrow.on('pointerover', () => arrow.setScale(0.14));
                arrow.on('pointerout', () => arrow.setScale(0.12));
            });
            
            container.add([arrowR, arrowL]);
            updateArrowsPosition();
            
            const updateArrows = () => {
                if (container.viewSide === 'right') {
                    arrowR.setVisible(true);
                    arrowL.setVisible(false);
                } else {
                    arrowR.setVisible(false);
                    arrowL.setVisible(true);
                }
            };
            
            updateArrows();
            
            arrowR.on('pointerdown', (pointer, x, y, event) => {
                event.stopPropagation();
                container.viewSide = 'left';
                updateVisualTexture();
                updateArrows();
            });
            
            arrowL.on('pointerdown', (pointer, x, y, event) => {
                event.stopPropagation();
                container.viewSide = 'right';
                updateVisualTexture();
                updateArrows();
            });
            
            container.updateArrows = updateArrows;
            container.updateArrowsPosition = updateArrowsPosition;
        }

        if (isNoRotateItem) {
            container.viewSide = 'right';
            updateVisualTexture();
        }

        container.updateVisualTexture = updateVisualTexture;
        container.setSize(visual.displayWidth, visual.displayHeight);
        container.setInteractive({ draggable: true });
        container.name = name;

        this.input.setDraggable(container);

        container.on('dragstart', () => {
            container.setDepth(1000);
            container.tempWallSide = container.wallSide;
            this.gridGraphics.setVisible(true);
            this.staticGridGraphics.clear();
            if (container.isWallItem) {
                this.drawWallGrid('left');
                this.drawWallGrid('right');
            } else {
                this.drawFullGrid();
            }
            // Save initial state for snap back on cancel
            container.originalGridX = container.gridX;
            container.originalGridY = container.gridY;
            container.originalWallSide = container.wallSide;
            
            // Clear old place in matrix before dragging
            updateOccupancy(container, true);

            // Initialize current state as valid
            container.targetIsValid = true;
            container.targetGridX = container.gridX;
            container.targetGridY = container.gridY;
            container.targetWallSide = container.wallSide;
        });

        container.on('drag', (pointer, dragX, dragY) => {
            const iso = this.screenToIso(dragX, dragY, container.isWallItem);
            const isValid = this.isSpaceFree(iso.gridX, iso.gridY, container.gridW, container.gridH, container, iso.wallSide);
            
            // Save "target" state for use in dragend
            container.targetGridX = iso.gridX;
            container.targetGridY = iso.gridY;
            container.targetWallSide = iso.wallSide;
            container.targetIsValid = isValid;

            // If wall changed, change texture
            if (container.isWallItem && iso.wallSide && iso.wallSide !== container.tempWallSide) {
                container.tempWallSide = iso.wallSide;
                container.viewSide = iso.wallSide; // update view side to match wall
                container.updateVisualTexture();
            }

            // Items are not allowed to overlap:
            // Sprite moves to cell only if it's free.
            if (isValid) {
                const snappedPos = this.isoToScreen(iso.gridX, iso.gridY, iso.wallSide);
                container.x = snappedPos.x;
                container.y = snappedPos.y;
                // Update arrows position during drag if they exist
                if (container.updateArrowsPosition) {
                    // Update internal coordinates so updateArrowsPosition uses new ones
                    const oldGridX = container.gridX;
                    const oldGridY = container.gridY;
                    container.gridX = iso.gridX;
                    container.gridY = iso.gridY;
                    container.updateArrowsPosition();
                    // Restore original for standard logic (which updates them in dragend)
                    container.gridX = oldGridX;
                    container.gridY = oldGridY;
                }
            }

            // Display indicator (always follows cursor and glows red if placement is invalid)
            this.drawGridIndicator(iso.gridX, iso.gridY, container.gridW, container.gridH, isValid, iso.wallSide, container.name);
        });

        container.on('dragend', () => {
            // If indicator was red on release, return item to original place
            if (container.targetIsValid) {
                container.gridX = container.targetGridX;
                container.gridY = container.targetGridY;
                container.wallSide = container.targetWallSide;
            } else {
                container.gridX = container.originalGridX;
                container.gridY = container.originalGridY;
                container.wallSide = container.originalWallSide;
                
                // Visual texture update (if wall item)
                if (container.isWallItem) {
                    container.viewSide = container.wallSide;
                    container.updateVisualTexture();
                }
            }
            
            // Ensure arrows are correctly positioned at the final place
            if (container.updateArrowsPosition) {
                container.updateArrowsPosition();
            }

            // Update occupancy matrix in new (or old) place
            updateOccupancy(container);
            
            // Final snapping
            const finalPos = this.isoToScreen(container.gridX, container.gridY, container.wallSide);
            container.x = finalPos.x;
            container.y = finalPos.y;
            
            if (container.isWallItem) {
                container.setDepth(container.wallSide === 'left' ? 6 : 7);
            } else {
                container.setDepth(10 + container.gridX + container.gridY);
            }
            this.gridGraphics.clear();
            this.staticGridGraphics.clear(); // Hide grid after drag ends
        });

        let lastClickTime = 0;
        container.on('pointerdown', (pointer) => {
            const clickTime = Date.now();
            if (clickTime - lastClickTime < 300) {
                this.removeObject(container);
            }
            lastClickTime = clickTime;
        });

        furnitureItems.push(container);
        // Add to matrix upon creation
        updateOccupancy(container);
    }

    removeObject(container) {
        // Clear place in matrix before deletion
        updateOccupancy(container, true);

        // Clear grid and indicator (fix: avoid grid staying visible after deletion)
        if (this.gridGraphics) this.gridGraphics.clear();
        if (this.staticGridGraphics) this.staticGridGraphics.clear();

        const index = furnitureItems.indexOf(container);
        if (index > -1) {
            furnitureItems.splice(index, 1);
        }
        container.destroy();
    }

    updateUI() {
        const commission = getCurrentCommission();
        document.getElementById('resident-name').innerText = commission.residentName;
        document.getElementById('brief-text').innerText = commission.brief;
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 500,
    parent: 'game-container',
    transparent: true, // Make Phaser transparent to see CSS background
    scene: [BriefingScene, DesignScene, ShopScene, RoomSelectScene]
};

const game = new Phaser.Game(config);

document.addEventListener('contextmenu', e => e.preventDefault());