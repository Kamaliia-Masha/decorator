let furnitureItems = [];
let currency = 0;
let purchasedItems = new Set(); // Names of purchased items (those with suffix 2)
let currentLevel = 0; // Current level (room index)

// Room template dimensions (obtained via `file` or `identify`)
const ROOM_DIMENSIONS = [
    { w: 1506, h: 1022 }, // emptyRoomTemplate.png
    { w: 1536, h: 1024 }, // Shablon1.png
    { w: 1264, h: 842 },  // Shablon2.png
    { w: 1536, h: 1024 }, // Shablon3.png
    { w: 1536, h: 1024 }, // Shablon4.png
    { w: 1248, h: 832 }   // Shablon5.png
];

const ROOM_TEMPLATES = [
    'assets/rooms/emptyRoomTemplate.png',
    'assets/rooms/Shablon1.png',
    'assets/rooms/Shablon2.png',
    'assets/rooms/Shablon3.png',
    'assets/rooms/Shablon4.png',
    'assets/rooms/Shablon5.png'
];

const COMMISSIONS = [
    {
        residentName: "Kamaliia",
        brief: "Hi! I need a cozy studio. Could you add a plant and a lamp? And please, throw away this old chair, it's driving me crazy!",
        requiredAdd: ["Plant", "Lamp"],
        requiredRemove: ["Old Chair"],
        reward: 100
    },
    {
        residentName: "Aleksey",
        brief: "I want a workspace! Place a table and a chair. And remove that plant, I have an allergy.",
        requiredAdd: ["Table", "Chair"],
        requiredRemove: ["Plant"],
        reward: 100
    },
    {
        residentName: "Elena",
        brief: "I need more light! Add a lamp and a window. The old closet is no longer needed.",
        requiredAdd: ["Lamp", "Window"],
        requiredRemove: ["Closet"],
        reward: 100
    },
    {
        residentName: "Dmitry",
        brief: "Make a relaxation room! A bed and a mirror are exactly what I need. And throw out this table.",
        requiredAdd: ["Bed", "Mirror"],
        requiredRemove: ["Table"],
        reward: 100
    },
    {
        residentName: "Sophia",
        brief: "I love plants! Place two plants and a chair. I don't like the old lamp.",
        requiredAdd: ["Plant", "Plant", "Chair"],
        requiredRemove: ["Lamp"],
        reward: 100
    },
    {
        residentName: "Victor",
        brief: "I need an office. A closet and a table are a must. And remove the bed.",
        requiredAdd: ["Closet", "Table"],
        requiredRemove: ["Bed"],
        reward: 100
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

// --- Scene: Shop ---
class ShopScene extends Phaser.Scene {
    constructor() {
        super('ShopScene');
    }

    create() {
        const bg = this.add.image(400, 250, 'agency_bg');
        bg.setDisplaySize(800, 500);
        bg.setAlpha(0.5);

        this.add.text(400, 40, 'SHOP', { 
            color: '#5f4b32', 
            fontSize: '32px', 
            fontWeight: 'bold' 
        }).setOrigin(0.5);

        // Currency display
        this.currencyText = this.add.text(780, 20, `Coins: ${currency}`, { 
            color: '#5f4b32', 
            fontSize: '20px', 
            fontWeight: 'bold' 
        }).setOrigin(1, 0);

        // Product list
        const startX = 100;
        const startY = 120;
        const spacingX = 150;
        const spacingY = 160;

        SHOP_ITEMS.forEach((item, index) => {
            const row = Math.floor(index / 5);
            const col = index % 5;
            const x = startX + col * spacingX;
            const y = startY + row * spacingY;

            const isPurchased = purchasedItems.has(item.name);

            // Item image
            const img = this.add.image(x, y, item.texture);
            const scale = 80 / Math.max(img.width, img.height);
            img.setScale(scale);

            this.add.text(x, y + 50, item.displayName, { color: '#5f4b32', fontSize: '14px' }).setOrigin(0.5);
            
            const priceText = isPurchased ? 'BOUGHT' : `${item.price} coins`;
            const btnColor = isPurchased ? 0xcccccc : 0x8fb9a8;
            
            const buyBtn = this.add.rectangle(x, y + 80, 110, 30, btnColor).setInteractive({ useHandCursor: !isPurchased });
            const buyBtnText = this.add.text(x, y + 80, priceText, { color: '#fff', fontSize: '12px', fontWeight: 'bold' }).setOrigin(0.5);

            if (!isPurchased) {
                buyBtn.on('pointerdown', () => {
                    if (currency >= item.price) {
                        currency -= item.price;
                        purchasedItems.add(item.name);
                        this.currencyText.setText(`Coins: ${currency}`);
                        buyBtn.setFillStyle(0xcccccc);
                        buyBtn.disableInteractive();
                        buyBtnText.setText('BOUGHT');
                        this.cameras.main.shake(100, 0.005);
                    } else {
                        this.add.text(400, 450, 'Not enough coins!', { color: '#ff0000', fontSize: '20px' }).setOrigin(0.5).setAlpha(1);
                        this.cameras.main.shake(200, 0.01);
                    }
                });
            }
        });

        // Кнопка BACK
        const backBtnBg = this.add.rectangle(400, 450, 150, 40, 0x8fb9a8).setInteractive({ useHandCursor: true });
        this.add.text(400, 450, 'BACK', { 
            color: '#fff', 
            fontSize: '18px', 
            fontWeight: 'bold' 
        }).setOrigin(0.5);

        backBtnBg.on('pointerdown', () => {
            this.scene.start('BriefingScene');
        });
    }
}

// --- Scene: Briefing ---
class BriefingScene extends Phaser.Scene {
    constructor() {
        super('BriefingScene');
    }

    init(data) {
        this.result = data.result || null; // 'success', 'failure' or null
    }

    preload() {
        // Load rabbit character and agency background
        this.load.image('rabbit', 'assets/floor_items/rabbit.png');
        this.load.image('agency_bg', 'assets/rooms/agency.png');
        this.load.image('shop_table', 'assets/rooms/shopTable.png');
        
        // Load all shop assets at once (so icons are visible)
        this.load.image('table2', 'assets/floor_items/table2.png');
        this.load.image('chair2', 'assets/floor_items/chair2.png');
        this.load.image('flower2', 'assets/floor_items/flower2.png');
        this.load.image('puffic2', 'assets/floor_items/Puffic2.png');
        this.load.image('stairs2', 'assets/floor_items/stairs2.png');
        this.load.image('mirror2', 'assets/wall_items/Mirror2.png');
        this.load.image('clock2', 'assets/wall_items/clock2.png');
        this.load.image('shell2', 'assets/wall_items/Shell2.png');
    }

    create() {
        if (document.getElementById('ui-panel')) {
            document.getElementById('ui-panel').style.display = 'none';
        }

        // Background: Using the added agency background
        const bg = this.add.image(400, 250, 'agency_bg');
        bg.setDisplaySize(800, 500);
        bg.setDepth(0);
        
        // Agency Counter
        const counter = this.add.rectangle(400, 420, 600, 100, 0x8b7355);
        counter.setStrokeStyle(4, 0x5f4b32);
        counter.setDepth(10); // Counter must be ABOVE the character
        this.add.text(400, 420, 'DECOR AGENCY', { color: '#fff', fontSize: '24px', fontWeight: 'bold' }).setOrigin(0.5).setDepth(11);

        // Tip Jar
        this.tipJar = this.add.container(650, 370);
        const jar = this.add.rectangle(0, 0, 60, 80, 0xadd8e6, 0.5);
        jar.setStrokeStyle(2, 0x5f4b32);
        const jarLabel = this.add.text(0, 20, 'TIPS', { color: '#5f4b32', fontSize: '12px', fontWeight: 'bold' }).setOrigin(0.5);
        this.tipJar.add([jar, jarLabel]);
        this.tipJar.setDepth(15); // Place ON the counter

        // Cash Register
        this.register = this.add.container(150, 370);
        const reg = this.add.rectangle(0, 0, 70, 50, 0x333);
        const regLabel = this.add.text(0, 0, 'CASH', { color: '#fff', fontSize: '10px' }).setOrigin(0.5);
        this.register.add([reg, regLabel]);
        this.register.setDepth(15); // Place ON the counter

        // Character (Resident)
        const startX = this.result ? 450 : -100; // If there is a result, standing by the counter
        const characterContainer = this.add.container(startX, 320);
        
        // Using rabbit sprite instead of circles
        const rabbit = this.add.image(0, 50, 'rabbit'); // Move rabbit lower in container
        rabbit.setScale(0.5); 
        
        if (this.result === 'failure') {
            rabbit.setTint(0x888888); 
        }
        
        characterContainer.add([rabbit]);
        characterContainer.setDepth(5); // Character BELOW the counter
        
        this.characterSprite = rabbit; // Save reference for animation

        // Speech Bubble Group
        this.bubbleGroup = this.add.group();
        const bubble = this.add.graphics();
        bubble.fillStyle(0xffffff, 1);
        bubble.fillRoundedRect(350, 80, 400, 180, 16);
        bubble.lineStyle(2, 0xe6d5c3, 1);
        bubble.strokeRoundedRect(350, 80, 400, 180, 16);
        
        bubble.beginPath();
        bubble.moveTo(450, 260);
        bubble.lineTo(430, 290);
        bubble.lineTo(470, 260);
        bubble.closePath();
        bubble.fillPath();
        bubble.strokePath();

        let message = getCurrentCommission().brief;
        if (this.result === 'success') message = "This is simply magnificent! Here are your tips!";
        else if (this.result === 'failure') message = "Terrible... I'm taking my money back!";

        this.speechText = this.add.text(375, 105, message, {
            color: '#5f4b32',
            fontSize: '16px',
            wordWrap: { width: 350 }
        });

        // Buttons (INSIDE BUBBLE)
        const btnBg = this.add.rectangle(550, 225, 180, 45, 0x8fb9a8).setInteractive({ useHandCursor: true });
        let btnLabel = this.result ? 'NEXT' : 'ACCEPT';
        
        const btnText = this.add.text(550, 225, btnLabel, { color: '#fff', fontSize: '16px', fontWeight: 'bold' }).setOrigin(0.5);
        
        this.bubbleGroup.addMultiple([bubble, this.speechText, btnBg, btnText]);
        this.bubbleGroup.setVisible(false);

        // SHOP Button (Small sticker "SHOP")
        const shopBtn = this.add.image(60, 45, 'shop_table').setInteractive({ useHandCursor: true });
        shopBtn.setScale(0.15); // Making it a small sticker
        shopBtn.setAngle(-5); // Slight tilt for a sticker look
        shopBtn.setDepth(100);
        
        shopBtn.on('pointerdown', () => {
            this.scene.start('ShopScene');
        });

        // Coins counter
        this.currencyText = this.add.text(780, 20, `Coins: ${currency}`, { 
            color: '#5f4b32', 
            fontSize: '20px', 
            fontWeight: 'bold' 
        }).setOrigin(1, 0);

        if (!this.result) {
            // Animation: Character walking in (New Commission)
            this.tweens.add({
                targets: characterContainer,
                x: 450, 
                duration: 2000,
                ease: 'Power2',
                onComplete: () => this.bubbleGroup.setVisible(true)
            });
        } else {
            // Сразу показываем результат (Return from Design)
            this.bubbleGroup.setVisible(true);
            this.handleEconomyAnimation(this.result, characterContainer);
        }

        btnBg.on('pointerdown', () => {
            if (this.result) {
                this.scene.start('BriefingScene', { result: null });
            } else if (this.isAwaitingReview) {
                this.handleReview(characterContainer);
                btnBg.disableInteractive();
                // We hide the button immediately so it can't be clicked twice
                this.tweens.add({
                    targets: [btnBg, btnText],
                    alpha: 0,
                    duration: 200
                });
            } else {
                this.scene.start('DesignScene');
            }
        });
    }

    handleReview(character) {
        // Show reaction directly
        if (this.result === 'success') {
            this.speechText.setText("This is simply magnificent! Here are your tips!");
        } else {
            this.speechText.setText("Terrible... I'm taking my money back!");
            if (this.characterSprite) this.characterSprite.setTint(0x888888); 
        }

        this.handleEconomyAnimation(this.result, character);
        
        // Show "CONTINUE" button after a short delay inside the bubble
        this.time.delayedCall(500, () => {
            const continueBtnBg = this.add.rectangle(550, 225, 180, 45, 0x8fb9a8).setInteractive({ useHandCursor: true });
            const continueBtnText = this.add.text(550, 225, 'NEXT', { color: '#fff', fontSize: '16px', fontWeight: 'bold' }).setOrigin(0.5);
            this.bubbleGroup.addMultiple([continueBtnBg, continueBtnText]);

            continueBtnBg.on('pointerdown', () => {
                this.scene.start('BriefingScene', { result: null });
            });
        });
    }

    handleEconomyAnimation(result, character) {
        const coin = this.add.circle(character.x, character.y - 20, 10, 0xffd700);
        coin.setStrokeStyle(2, 0x5f4b32);
        coin.setDepth(20); // Coin must fly ABOVE everything
        
        if (result === 'success') {
            this.tweens.add({
                targets: coin,
                x: this.tipJar.x,
                y: this.tipJar.y,
                duration: 800,
                ease: 'Back.easeIn',
                onComplete: () => {
                    coin.destroy();
                    this.cameras.main.shake(100, 0.01);
                    // Update counter after animation
                    this.currencyText.setText(`Coins: ${currency}`);
                }
            });
        } else {
            // Move from register to character (taking money)
            coin.setPosition(this.register.x, this.register.y);
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
    'Closet': { w: 2, h: 1 },
    'Window': { w: 2, h: 4 },
    'Mirror': { w: 2, h: 5 },
    'Table2': { w: 2, h: 2 },
    'Chair2': { w: 1, h: 1 },
    'Flower2': { w: 1, h: 1 },
    'Puffic2': { w: 1, h: 1 },
    'Stairs2': { w: 2, h: 3 },
    'Mirror2': { w: 1, h: 3 },
    'Clock2': { w: 1, h: 1 },
    'Shell2': { w: 1, h: 1 }
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
    floor: Array(10).fill().map(() => Array(10).fill(null)),
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
    GRID_OCCUPANCY.floor = Array(10).fill().map(() => Array(10).fill(null));
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
        const roomImg = ROOM_TEMPLATES[currentLevel % ROOM_TEMPLATES.length];
        this.load.image('room_bg', roomImg + '?v=' + version);
        
        // Load new furniture
        this.load.image('bed', 'assets/floor_items/bed.png?v=' + version);
        this.load.image('chair', 'assets/floor_items/chair.png?v=' + version);
        this.load.image('chair2', 'assets/floor_items/chair2.png?v=' + version);
        this.load.image('closet', 'assets/floor_items/closet.png?v=' + version);
        this.load.image('plant', 'assets/floor_items/plant.png?v=' + version);
        this.load.image('table', 'assets/floor_items/table.png?v=' + version);
        this.load.image('table2', 'assets/floor_items/table2.png?v=' + version);
        this.load.image('lamp', 'assets/floor_items/lamp.png?v=' + version);
        this.load.image('flower2', 'assets/floor_items/flower2.png?v=' + version);
        this.load.image('puffic2', 'assets/floor_items/Puffic2.png?v=' + version);
        this.load.image('stairs2', 'assets/floor_items/stairs2.png?v=' + version);
        
        this.load.image('window', 'assets/wall_items/window.png?v=' + version);
        this.load.image('mirror', 'assets/wall_items/mirror.png?v=' + version);
        this.load.image('mirror2', 'assets/wall_items/Mirror2.png?v=' + version);
        this.load.image('clock2', 'assets/wall_items/clock2.png?v=' + version);
        this.load.image('shell2', 'assets/wall_items/Shell2.png?v=' + version);
        
        // Wall-specific assets
        this.load.image('window_left_wall', 'assets/wall_items/window_left_wall.png?v=' + version);
        this.load.image('window_right_wall', 'assets/wall_items/window_right_wall.png?v=' + version);
        this.load.image('mirror_left_wall', 'assets/wall_items/mirror_left_wall.png?v=' + version);
        this.load.image('mirror_right_wall', 'assets/wall_items/mirror_right_wall.png?v=' + version);
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
            
            // Update brief
            const commission = getCurrentCommission();
            document.getElementById('resident-name').innerText = commission.residentName;
            document.getElementById('brief-text').innerText = commission.brief;

            // Add handler for Done button
            const submitBtn = document.getElementById('submit-btn');
    if (submitBtn) {
        // Clear old handlers before setting a new one
        submitBtn.onclick = null;
        submitBtn.onclick = (e) => {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            console.log("Submit button clicked via onclick");
            if (window.submitGame) window.submitGame(e);
        };
    }

            // Set room background via CSS for 100% stability
            const container = document.getElementById('game-container');
            const roomImg = ROOM_TEMPLATES[currentLevel % ROOM_TEMPLATES.length];
            container.style.backgroundImage = `url('${roomImg}?v=${Date.now()}')`;
            
            // Dynamic inventory button list update
            this.updateInventoryUI();
        }
        
        // In Phaser we no longer create background so it can't move
        this.bg = null;
        
        // Block any zoom or camera position changes
        this.cameras.main.setZoom(1);
        this.cameras.main.centerOn(400, 250);


        // Initially empty room
        const chairSize = ITEM_SIZES['Chair'] || { w: 2, h: 2 };
        // Right corner of the room on the floor (high X, low Y)
        const chairX = 8;
        const chairY = 0;
        if (this.isSpaceFree(chairX, chairY, chairSize.w, chairSize.h)) {
            this.addFurnitureObject(chairX, chairY, 'Chair', 0x8b7355);
        }

        // Add window to left wall and mirror to right wall
        const windowSize = ITEM_SIZES['Window'] || { w: 2, h: 2 };
        const windowX = 4;
        const windowY = 4;
        if (this.isSpaceFree(windowX, windowY, windowSize.w, windowSize.h, null, 'left')) {
            this.addFurnitureObject(windowX, windowY, 'Window', 0xadd8e6, 'left');
        }

        const mirrorSize = ITEM_SIZES['Mirror'] || { w: 2, h: 2 };
        const mirrorX = 4;
        const mirrorY = 4;
        if (this.isSpaceFree(mirrorX, mirrorY, mirrorSize.w, mirrorSize.h, null, 'right')) {
            this.addFurnitureObject(mirrorX, mirrorY, 'Mirror', 0xe0e0e0, 'right');
        }

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
            const hasAdditions = commission.requiredAdd.every(req => 
                furnitureItems.some(item => item.name.toLowerCase().includes(req.toLowerCase()))
            );
            const hasRemovals = !furnitureItems.some(item => 
                commission.requiredRemove.some(req => item.name.toLowerCase().includes(req.toLowerCase()))
            );

            const result = (hasAdditions && hasRemovals) ? 'success' : 'failure';
            
            if (result === 'success') {
                currency += commission.reward;
                currentLevel++; // Move to next room
                // document.getElementById('currency-display').innerText = `Currency: ${currency}`;
            }

            // Transition to agency hall with IMMEDIATELY visible result
            const feedbackEl = document.getElementById('feedback');
            if (feedbackEl) {
                feedbackEl.style.display = 'block';
                feedbackEl.innerText = result === 'success' ? "Great! Design accepted." : "Client is not quite happy. Check requirements.";
                setTimeout(() => { feedbackEl.style.display = 'none'; }, 3000);
            }
            this.scene.start('BriefingScene', { result: result });
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
            const res = SURFACES.floor.worldToGrid(x, y);
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
        
        container.setDepth(isWallItem ? 5 : 10 + gridX + gridY); // Walls are deeper, but items on them must be visible
        if (isWallItem) container.setDepth(container.wallSide === 'left' ? 6 : 7);
        
        // Texture search (exact match first, then by keyword)
        const getTextureKey = (itemName, side) => {
            let key = itemName.toLowerCase().replace(' ', '_');
            if (side && (key === 'window' || key === 'mirror' || key === 'mirror2' || key === 'window2')) {
                const sideKey = `${key}_${side}_wall`;
                if (this.textures.exists(sideKey)) return sideKey;
            }
            if (this.textures.exists(key)) return key;
            
            // Generic fallbacks
            if (key.includes('chair')) return 'chair';
            if (key.includes('bed')) return 'bed';
            if (key.includes('table')) return 'table';
            if (key.includes('plant')) return 'plant';
            if (key.includes('closet')) return 'closet';
            if (key.includes('lamp')) return 'lamp';
            if (key.includes('window')) return 'window';
            if (key.includes('mirror')) return 'mirror';
            if (key.includes('clock')) return 'clock2';
            if (key.includes('shell')) return 'shell2';
            if (key.includes('flower')) return 'flower2';
            if (key.includes('puffic')) return 'puffic2';
            if (key.includes('stairs')) return 'stairs2';
            return null;
        };

        let textureKey = getTextureKey(name, wallSide);
        
        let visual;
        if (textureKey && this.textures.exists(textureKey)) {
            visual = this.add.image(0, 0, textureKey);
            // Decrease size limit so furniture is proportional to the room
            let maxDim = 220; 
            
            // If the name contains digit 2, decrease even further as these assets are larger
            if (name.includes('2')) {
                maxDim = 120; // Chosen experimentally for proportionality
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
        
        // visual anchor is center-bottom for floor items, or relative to wall
        // We set origin to (0.5, 0.5) to make it stand on the cell
        visual.setOrigin(0.5, 0.5);
        visual.y = 0; 

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
                const newTexture = getTextureKey(container.name, iso.wallSide);
                if (newTexture && visual.texture.key !== newTexture) {
                    visual.setTexture(newTexture);
                }
            }

            // Items are not allowed to overlap:
            // Sprite moves to cell only if it's free.
            if (isValid) {
                const snappedPos = this.isoToScreen(iso.gridX, iso.gridY, iso.wallSide);
                container.x = snappedPos.x;
                container.y = snappedPos.y;
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
                    const originalTexture = getTextureKey(container.name, container.wallSide);
                    if (originalTexture) visual.setTexture(originalTexture);
                }
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
    scene: [BriefingScene, DesignScene, ShopScene]
};

const game = new Phaser.Game(config);

document.addEventListener('contextmenu', e => e.preventDefault());