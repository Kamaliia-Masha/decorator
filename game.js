let furnitureItems = [];
let currency = 0;

const currentCommission = {
    residentName: "Kamaliia",
    brief: "Привет! Мне нужна уютная студия. Можешь добавить растение и лампу? И, пожалуйста, выкинь этот старый стул, он меня бесит!",
    requiredAdd: ["Plant", "Lamp"],
    requiredRemove: ["Old Chair"],
    reward: 150
};

// --- Scene: Briefing ---
class BriefingScene extends Phaser.Scene {
    constructor() {
        super('BriefingScene');
    }

    init(data) {
        this.result = data.result || null; // 'success', 'failure' or null
    }

    preload() {
        // Загружаем персонажа-кролика и фон агентства
        this.load.image('rabbit', 'assets/rabbit.png');
        this.load.image('agency_bg', 'assets/agency.png');
    }

    create() {
        if (document.getElementById('ui-panel')) {
            document.getElementById('ui-panel').style.display = 'none';
        }

        // Background: Используем добавленный фон агентства
        const bg = this.add.image(400, 250, 'agency_bg');
        bg.setDisplaySize(800, 500);
        bg.setDepth(0);
        
        // Agency Counter
        const counter = this.add.rectangle(400, 420, 600, 100, 0x8b7355);
        counter.setStrokeStyle(4, 0x5f4b32);
        counter.setDepth(10); // Стойка должна быть ВЫШЕ персонажа
        this.add.text(400, 420, 'DECOR AGENCY', { color: '#fff', fontSize: '24px', fontWeight: 'bold' }).setOrigin(0.5).setDepth(11);

        // Tip Jar
        this.tipJar = this.add.container(650, 370);
        const jar = this.add.rectangle(0, 0, 60, 80, 0xadd8e6, 0.5);
        jar.setStrokeStyle(2, 0x5f4b32);
        const jarLabel = this.add.text(0, 20, 'TIPS', { color: '#5f4b32', fontSize: '12px', fontWeight: 'bold' }).setOrigin(0.5);
        this.tipJar.add([jar, jarLabel]);
        this.tipJar.setDepth(15); // Ставим НА стол

        // Cash Register
        this.register = this.add.container(150, 370);
        const reg = this.add.rectangle(0, 0, 70, 50, 0x333);
        const regLabel = this.add.text(0, 0, 'CASH', { color: '#fff', fontSize: '10px' }).setOrigin(0.5);
        this.register.add([reg, regLabel]);
        this.register.setDepth(15); // Ставим НА стол

        // Character (Resident)
        const startX = this.result ? 450 : -100; // Если есть результат, сразу стоит у стола
        const characterContainer = this.add.container(startX, 320);
        
        // Используем спрайт кролика вместо кружков
        const rabbit = this.add.image(0, 50, 'rabbit'); // Опустим кролика чуть ниже в контейнере
        rabbit.setScale(0.5); 
        
        if (this.result === 'failure') {
            rabbit.setTint(0x888888); 
        }
        
        characterContainer.add([rabbit]);
        characterContainer.setDepth(5); // Персонаж НИЖЕ стойки
        
        this.characterSprite = rabbit; // Сохраняем ссылку для анимации

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

        let message = currentCommission.brief;
        if (this.result === 'success') message = "Это просто великолепно! Вот ваши чаевые!";
        else if (this.result === 'failure') message = "Ужасно... Я забираю свои деньги назад!";

        this.speechText = this.add.text(375, 105, message, {
            color: '#5f4b32',
            fontSize: '16px',
            wordWrap: { width: 350 }
        });

        // Buttons (ВНУТРИ ОБЛАКА)
        const btnBg = this.add.rectangle(550, 225, 180, 45, 0x8fb9a8).setInteractive({ useHandCursor: true });
        let btnLabel = this.result ? 'ДАЛЕЕ' : 'ПРИНЯТЬ';
        
        const btnText = this.add.text(550, 225, btnLabel, { color: '#fff', fontSize: '16px', fontWeight: 'bold' }).setOrigin(0.5);
        
        this.bubbleGroup.addMultiple([bubble, this.speechText, btnBg, btnText]);
        this.bubbleGroup.setVisible(false);

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
            this.speechText.setText("Это просто великолепно! Вот ваши чаевые!");
        } else {
            this.speechText.setText("Ужасно... Я забираю свои деньги назад!");
            if (this.characterSprite) this.characterSprite.setTint(0x888888); 
        }

        this.handleEconomyAnimation(this.result, character);
        
        // Show "CONTINUE" button after a short delay inside the bubble
        this.time.delayedCall(500, () => {
            const continueBtnBg = this.add.rectangle(550, 225, 180, 45, 0x8fb9a8).setInteractive({ useHandCursor: true });
            const continueBtnText = this.add.text(550, 225, 'ДАЛЕЕ', { color: '#fff', fontSize: '16px', fontWeight: 'bold' }).setOrigin(0.5);
            this.bubbleGroup.addMultiple([continueBtnBg, continueBtnText]);

            continueBtnBg.on('pointerdown', () => {
                this.scene.start('BriefingScene', { result: null });
            });
        });
    }

    handleEconomyAnimation(result, character) {
        const coin = this.add.circle(character.x, character.y - 20, 10, 0xffd700);
        coin.setStrokeStyle(2, 0x5f4b32);
        coin.setDepth(20); // Монета должна лететь ПОВЕРХ всего
        
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
const ROOM_WIDTH = 1536;
const ROOM_HEIGHT = 1024;
const DISPLAY_WIDTH = 800;
const DISPLAY_HEIGHT = 500;
const SCALE_X = DISPLAY_WIDTH / ROOM_WIDTH;
const SCALE_Y = DISPLAY_HEIGHT / ROOM_HEIGHT;

const P_CEIL = { x: 767.8 * SCALE_X, y: 7.3 * SCALE_Y };
const P_WALL0 = { x: 768.9 * SCALE_X, y: 310.7 * SCALE_Y };
const P_FLOOR0 = { x: 770.1 * SCALE_X, y: 331.4 * SCALE_Y };

const P_L_CEIL = { x: 144.7 * SCALE_X, y: 356.3 * SCALE_Y };
const P_L_WALL = { x: 173.5 * SCALE_X, y: 643.7 * SCALE_Y };
const P_L_FLOOR = { x: 173.5 * SCALE_X, y: 665.0 * SCALE_Y };

const P_R_CEIL = { x: 1389.3 * SCALE_X, y: 338.3 * SCALE_Y };
const P_R_WALL = { x: 1362.2 * SCALE_X, y: 630.0 * SCALE_Y };
const P_R_FLOOR = { x: 1363.9 * SCALE_X, y: 653.0 * SCALE_Y };

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

const SURFACES = {
    floor: new Surface(P_FLOOR0, P_R_FLOOR, P_L_FLOOR, 10, 10),
    left: new Surface(P_WALL0, P_L_WALL, P_CEIL, 10, 10),
    right: new Surface(P_WALL0, P_R_WALL, P_CEIL, 10, 10)
};

// --- Scene: Design ---

class DesignScene extends Phaser.Scene {
    constructor() {
        super('DesignScene');
    }

    preload() {
        // Загружаем шаблон комнаты (добавляем версию для сброса кэша)
        const version = Date.now();
        this.load.image('room_bg', 'assets/emptyRoomTemplate.png?v=' + version);
        
        // Загружаем новую мебель
        this.load.image('bed', 'assets/bed.png?v=' + version);
        this.load.image('chair', 'assets/chair.png?v=' + version);
        this.load.image('closet', 'assets/closet.png?v=' + version);
        this.load.image('plant', 'assets/plant.png?v=' + version);
        this.load.image('table', 'assets/table.png?v=' + version);
        this.load.image('lamp', 'assets/lamp.png?v=' + version);
        this.load.image('window', 'assets/window.png?v=' + version);
        this.load.image('mirror', 'assets/mirror.png?v=' + version);
        
        // Специфические ассеты для стен
        this.load.image('window_left_wall', 'assets/window_left_wall.png?v=' + version);
        this.load.image('window_right_wall', 'assets/window_right_wall.png?v=' + version);
        this.load.image('mirror_left_wall', 'assets/mirror_left_wall.png?v=' + version);
        this.load.image('mirror_right_wall', 'assets/mirror_right_wall.png?v=' + version);
    }

    create() {
        furnitureItems = []; // Reset items
        
        // Grid logic
        this.staticGridGraphics = this.add.graphics().setDepth(0.5);
        this.drawFullGrid();
        
        this.gridGraphics = this.add.graphics().setDepth(1);
        
        if (document.getElementById('ui-panel')) {
            document.getElementById('ui-panel').style.display = 'block';
            // Устанавливаем фон комнаты через CSS для 100% стабильности
            const container = document.getElementById('game-container');
            container.style.backgroundImage = `url('assets/emptyRoomTemplate.png?v=${Date.now()}')`;
        }
        
        // В самом Phaser фон больше не создаем, чтобы он не мог двигаться
        this.bg = null;
        
        // Блокируем любые изменения масштаба или позиции камеры
        this.cameras.main.setZoom(1);
        this.cameras.main.centerOn(400, 250);

        this.add.text(10, 10, 'Комната: Дизайн-проект', { 
            color: '#5f4b32', 
            fontSize: '20px', 
            fontWeight: 'bold',
            backgroundColor: '#ffffff88',
            padding: { x: 10, y: 5 }
        }).setDepth(100);

        // Изначально пустая комната (кроме одного "Старого стула", который просят удалить в текущем задании)
        this.addFurnitureObject(0, 0, 'Old Chair', 0x8b7355);

        // Добавляем окно и зеркало на стены
        const windowPos = this.findFreeWallSpace(2, 2);
        if (windowPos) {
            this.addFurnitureObject(windowPos.gridX, windowPos.gridY, 'Window', 0xadd8e6, windowPos.wallSide);
        }
        const mirrorPos = this.findFreeWallSpace(2, 2);
        if (mirrorPos) {
            this.addFurnitureObject(mirrorPos.gridX, mirrorPos.gridY, 'Mirror', 0xe0e0e0, mirrorPos.wallSide);
        }

        this.updateUI();

        window.addFurniture = (type) => {
            let color = 0xcccccc;
            if (type === 'Plant') color = 0x228B22;
            if (type === 'Lamp') color = 0xFFFF00;
            if (type === 'Table') color = 0xdeb887;
            if (type === 'Bed') color = 0xadd8e6;
            if (type === 'Chair') color = 0x8b7355;
            if (type === 'Closet') color = 0x6b4226;
            if (type === 'Window') color = 0xadd8e6;
            if (type === 'Mirror') color = 0xe0e0e0;
            
            const isWallItem = (type === 'Window' || type === 'Mirror');
            const pos = isWallItem ? this.findFreeWallSpace(2, 2) : this.findFreeSpace(2, 2);
            
            if (pos) {
                this.addFurnitureObject(pos.gridX, pos.gridY, type, color, pos.wallSide);
            } else {
                alert("Нет свободного места!");
            }
        };

        window.submitGame = () => {
            const hasAdditions = currentCommission.requiredAdd.every(req => 
                furnitureItems.some(item => item.name.toLowerCase().includes(req.toLowerCase()))
            );
            const hasRemovals = !furnitureItems.some(item => 
                currentCommission.requiredRemove.some(req => item.name.toLowerCase().includes(req.toLowerCase()))
            );

            const result = (hasAdditions && hasRemovals) ? 'success' : 'failure';
            
            if (result === 'success') {
                currency += currentCommission.reward;
                document.getElementById('currency-display').innerText = `Валюта: ${currency}`;
            }

            // Переход в холл со СРАЗУ видимым результатом
            this.scene.start('BriefingScene', { result: result });
        };
    }

    update() {
        // Фоновая картинка теперь в CSS, здесь ничего не нужно фиксировать
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
        const surface = SURFACES[wallSide || 'floor'];
        if (gridX < 0 || gridY < 0 || gridX + sizeW > surface.cols || gridY + sizeH > surface.rows) return false;

        for (let item of furnitureItems) {
            if (item === ignoreItem) continue;
            if (item.wallSide !== (wallSide || null)) continue;

            if (gridX < item.gridX + item.gridW &&
                gridX + sizeW > item.gridX &&
                gridY < item.gridY + item.gridH &&
                gridY + sizeH > item.gridY) {
                return false;
            }
        }
        return true;
    }

    findFreeWallSpace(sizeW, sizeH) {
        // Пробуем левую стену, потом правую
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

    drawGridIndicator(gridX, gridY, sizeW, sizeH, isValid, wallSide) {
        this.gridGraphics.clear();
        const color = isValid ? 0x00ff00 : 0xff0000;
        this.gridGraphics.lineStyle(2, color, 0.8);
        this.gridGraphics.fillStyle(color, 0.3);

        const p1 = this.isoToScreen(gridX, gridY, wallSide);
        const p2 = this.isoToScreen(gridX + sizeW, gridY, wallSide);
        const p3 = this.isoToScreen(gridX + sizeW, gridY + sizeH, wallSide);
        const p4 = this.isoToScreen(gridX, gridY + sizeH, wallSide);

        this.gridGraphics.beginPath();
        this.gridGraphics.moveTo(p1.x, p1.y);
        this.gridGraphics.lineTo(p2.x, p2.y);
        this.gridGraphics.lineTo(p3.x, p3.y);
        this.gridGraphics.lineTo(p4.x, p4.y);
        this.gridGraphics.closePath();
        this.gridGraphics.fillPath();
        this.gridGraphics.strokePath();
    }

    addFurnitureObject(gridX, gridY, name, color, wallSide = null) {
        const isWallItem = (name === 'Window' || name === 'Mirror');
        const screenPos = this.isoToScreen(gridX, gridY, wallSide);
        const container = this.add.container(screenPos.x, screenPos.y);
        container.gridX = gridX;
        container.gridY = gridY;
        container.gridW = 2; // Предмет занимает 2х2 клетки
        container.gridH = 2;
        container.wallSide = wallSide;
        container.isWallItem = isWallItem;
        
        container.setDepth(isWallItem ? 5 : 10 + gridX + gridY); // Стены глубже, но предметы на них должны быть видны
        if (isWallItem) container.setDepth(container.wallSide === 'left' ? 6 : 7);
        
        // Поиск текстуры (сначала точное совпадение, потом по ключевому слову)
        const getTextureKey = (itemName, side) => {
            let key = itemName.toLowerCase().replace(' ', '_');
            if (side && (key === 'window' || key === 'mirror')) {
                const sideKey = `${key}_${side}_wall`;
                if (this.textures.exists(sideKey)) return sideKey;
            }
            if (this.textures.exists(key)) return key;
            
            // Запасные варианты (generic)
            if (key.includes('chair')) return 'chair';
            if (key.includes('bed')) return 'bed';
            if (key.includes('table')) return 'table';
            if (key.includes('plant')) return 'plant';
            if (key.includes('closet')) return 'closet';
            if (key.includes('lamp')) return 'lamp';
            if (key.includes('window')) return 'window';
            if (key.includes('mirror')) return 'mirror';
            return null;
        };

        let textureKey = getTextureKey(name, wallSide);
        
        let visual;
        if (textureKey && this.textures.exists(textureKey)) {
            visual = this.add.image(0, 0, textureKey);
            // Уменьшаем лимит размера, чтобы мебель была соразмерна комнате
            const maxDim = 220; 
            if (visual.width > maxDim || visual.height > maxDim) {
                const scale = maxDim / Math.max(visual.width, visual.height);
                visual.setScale(scale);
            }
        } else {
            // Заглушка, если картинки нет
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
            
            if (symbol) {
                const icon = this.add.text(0, 0, symbol, { fontSize: '32px' }).setOrigin(0.5);
                container.add(icon);
            }

            const label = this.add.text(0, 55, name, { fontSize: '14px', color: '#5f4b32', fontWeight: 'bold', backgroundColor: '#ffffff88' }).setOrigin(0.5);
            container.add(label);
        }
        
        container.addAt(visual, 0);
        // visual anchor is center-bottom for floor items, or relative to wall
        // We set origin to (0.5, 1) to make it stand on the cell
        visual.setOrigin(0.5, 0.5);
        visual.y = 0; 

        container.setSize(visual.displayWidth, visual.displayHeight);
        container.setInteractive({ draggable: true });
        container.name = name;

        this.input.setDraggable(container);

        container.on('dragstart', () => {
            container.setDepth(1000);
            container.tempWallSide = container.wallSide; // Инициализируем временную сторону
            this.gridGraphics.setVisible(true);
            this.staticGridGraphics.clear();
            if (container.isWallItem) {
                this.drawWallGrid('left');
                this.drawWallGrid('right');
            } else {
                this.drawFullGrid();
            }
        });

        container.on('drag', (pointer, dragX, dragY) => {
            const iso = this.screenToIso(dragX, dragY, container.isWallItem);
            const isValid = this.isSpaceFree(iso.gridX, iso.gridY, container.gridW, container.gridH, container, iso.wallSide);
            
            // Если сменилась стена, меняем текстуру
            if (container.isWallItem && iso.wallSide && iso.wallSide !== container.tempWallSide) {
                container.tempWallSide = iso.wallSide;
                const newTexture = getTextureKey(container.name, iso.wallSide);
                if (newTexture && visual.texture.key !== newTexture) {
                    visual.setTexture(newTexture);
                }
            }

            // Snapping: object follows snapped grid position
            const snappedPos = this.isoToScreen(iso.gridX, iso.gridY, iso.wallSide);
            container.x = snappedPos.x;
            container.y = snappedPos.y;

            this.drawGridIndicator(iso.gridX, iso.gridY, container.gridW, container.gridH, isValid, iso.wallSide);
        });

        container.on('dragend', (pointer) => {
            const iso = this.screenToIso(container.x, container.y, container.isWallItem);
            const isValid = this.isSpaceFree(iso.gridX, iso.gridY, container.gridW, container.gridH, container, iso.wallSide);
            
            if (isValid) {
                container.gridX = iso.gridX;
                container.gridY = iso.gridY;
                container.wallSide = iso.wallSide;
            }
            
            const finalPos = this.isoToScreen(container.gridX, container.gridY, container.wallSide);
            container.x = finalPos.x;
            container.y = finalPos.y;
            
            if (container.isWallItem) {
                container.setDepth(container.wallSide === 'left' ? 6 : 7);
            } else {
                container.setDepth(10 + container.gridX + container.gridY);
            }
            this.gridGraphics.clear();
            this.staticGridGraphics.clear();
            this.drawFullGrid(); 
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
    }

    removeObject(container) {
        const index = furnitureItems.indexOf(container);
        if (index > -1) {
            furnitureItems.splice(index, 1);
        }
        container.destroy();
    }

    updateUI() {
        document.getElementById('resident-name').innerText = currentCommission.residentName;
        document.getElementById('brief-text').innerText = currentCommission.brief;
        document.getElementById('requirements').innerText = 
            `Добавить: ${currentCommission.requiredAdd.join(', ')} | Удалить: ${currentCommission.requiredRemove.join(', ')}`;
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 500,
    parent: 'game-container',
    transparent: true, // Делаем Phaser прозрачным, чтобы видеть CSS-фон
    scene: [BriefingScene, DesignScene]
};

const game = new Phaser.Game(config);

document.addEventListener('contextmenu', e => e.preventDefault());