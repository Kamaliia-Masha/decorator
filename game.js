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

// --- Scene: Design ---
const GRID_CONFIG = {
    tileW: 56,
    tileH: 28,
    rows: 10,
    cols: 10,
    offsetX: 400,
    offsetY: 155,
    angle: 0
};

class DesignScene extends Phaser.Scene {
    constructor() {
        super('DesignScene');
    }

    preload() {
        // Загружаем шаблон комнаты (добавляем версию для сброса кэша)
        const version = Date.now();
        this.load.image('room_bg', 'assets/shablonKomnati.png?v=' + version);
        
        // Загружаем новую мебель
        this.load.image('bed', 'assets/bed.png?v=' + version);
        this.load.image('chair', 'assets/chair.png?v=' + version);
        this.load.image('closet', 'assets/closet.png?v=' + version);
        this.load.image('plant', 'assets/plant.png?v=' + version);
        this.load.image('table', 'assets/table.png?v=' + version);
        this.load.image('lamp', 'assets/lamp.png?v=' + version);
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
            container.style.backgroundImage = `url('assets/shablonKomnati.png?v=${Date.now()}')`;
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

        this.updateUI();

        window.addFurniture = (type) => {
            let color = 0xcccccc;
            if (type === 'Plant') color = 0x228B22;
            if (type === 'Lamp') color = 0xFFFF00;
            if (type === 'Table') color = 0xdeb887;
            if (type === 'Bed') color = 0xadd8e6;
            if (type === 'Chair') color = 0x8b7355;
            if (type === 'Closet') color = 0x6b4226;
            
            const pos = this.findFreeSpace(2, 2);
            if (pos) {
                this.addFurnitureObject(pos.gridX, pos.gridY, type, color);
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

        // Рисуем линии вдоль X
        for (let i = 0; i <= GRID_CONFIG.rows; i++) {
            const p1 = this.isoToScreen(0, i);
            const p2 = this.isoToScreen(GRID_CONFIG.cols, i);
            this.staticGridGraphics.lineBetween(p1.x, p1.y, p2.x, p2.y);
        }

        // Рисуем линии вдоль Y
        for (let i = 0; i <= GRID_CONFIG.cols; i++) {
            const p1 = this.isoToScreen(i, 0);
            const p2 = this.isoToScreen(i, GRID_CONFIG.rows);
            this.staticGridGraphics.lineBetween(p1.x, p1.y, p2.x, p2.y);
        }
    }

    isoToScreen(gridX, gridY) {
        const rad = (GRID_CONFIG.angle || 0) * Math.PI / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);

        let x = (gridX - gridY) * (GRID_CONFIG.tileW / 2);
        let y = (gridX + gridY) * (GRID_CONFIG.tileH / 2);

        // Вращение
        const rx = x * cos - y * sin;
        const ry = x * sin + y * cos;

        return { x: rx + GRID_CONFIG.offsetX, y: ry + GRID_CONFIG.offsetY };
    }

    screenToIso(x, y) {
        const rad = (GRID_CONFIG.angle || 0) * Math.PI / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);

        let dx = x - GRID_CONFIG.offsetX;
        let dy = y - GRID_CONFIG.offsetY;

        // Обратное вращение
        const rx = dx * cos + dy * sin;
        const ry = -dx * sin + dy * cos;

        const gridX = Math.floor((ry / (GRID_CONFIG.tileH / 2) + rx / (GRID_CONFIG.tileW / 2)) / 2);
        const gridY = Math.floor((ry / (GRID_CONFIG.tileH / 2) - rx / (GRID_CONFIG.tileW / 2)) / 2);
        return { gridX, gridY };
    }

    isSpaceFree(gridX, gridY, sizeW, sizeH, ignoreItem = null) {
        if (gridX < 0 || gridY < 0 || gridX + sizeW > GRID_CONFIG.cols || gridY + sizeH > GRID_CONFIG.rows) return false;

        for (let item of furnitureItems) {
            if (item === ignoreItem) continue;
            // Простая проверка пересечения прямоугольников в сетке
            if (gridX < item.gridX + item.gridW &&
                gridX + sizeW > item.gridX &&
                gridY < item.gridY + item.gridH &&
                gridY + sizeH > item.gridY) {
                return false;
            }
        }
        return true;
    }

    findFreeSpace(sizeW, sizeH) {
        for (let y = 0; y <= GRID_CONFIG.rows - sizeH; y++) {
            for (let x = 0; x <= GRID_CONFIG.cols - sizeW; x++) {
                if (this.isSpaceFree(x, y, sizeW, sizeH)) return { gridX: x, gridY: y };
            }
        }
        return null;
    }

    drawGridIndicator(gridX, gridY, sizeW, sizeH, isValid) {
        this.gridGraphics.clear();
        const color = isValid ? 0x00ff00 : 0xff0000;
        this.gridGraphics.lineStyle(2, color, 0.8);
        this.gridGraphics.fillStyle(color, 0.3);

        const points = [];
        // Рисуем ромб для области
        const p1 = this.isoToScreen(gridX, gridY);
        const p2 = this.isoToScreen(gridX + sizeW, gridY);
        const p3 = this.isoToScreen(gridX + sizeW, gridY + sizeH);
        const p4 = this.isoToScreen(gridX, gridY + sizeH);

        this.gridGraphics.beginPath();
        this.gridGraphics.moveTo(p1.x, p1.y);
        this.gridGraphics.lineTo(p2.x, p2.y);
        this.gridGraphics.lineTo(p3.x, p3.y);
        this.gridGraphics.lineTo(p4.x, p4.y);
        this.gridGraphics.closePath();
        this.gridGraphics.fillPath();
        this.gridGraphics.strokePath();
    }

    addFurnitureObject(gridX, gridY, name, color) {
        const screenPos = this.isoToScreen(gridX, gridY);
        const container = this.add.container(screenPos.x, screenPos.y);
        container.gridX = gridX;
        container.gridY = gridY;
        container.gridW = 2; // Предмет занимает 2х2 клетки
        container.gridH = 2;
        container.setDepth(10 + gridX + gridY); // Сортировка по глубине
        
        // Поиск текстуры (сначала точное совпадение, потом по ключевому слову)
        let textureKey = name.toLowerCase().replace(' ', '_');
        if (!this.textures.exists(textureKey)) {
            if (textureKey.includes('chair')) textureKey = 'chair';
            else if (textureKey.includes('bed')) textureKey = 'bed';
            else if (textureKey.includes('table')) textureKey = 'table';
            else if (textureKey.includes('plant')) textureKey = 'plant';
            else if (textureKey.includes('closet')) textureKey = 'closet';
            else if (textureKey.includes('lamp')) textureKey = 'lamp';
        }
        
        let visual;
        if (this.textures.exists(textureKey)) {
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
            
            if (symbol) {
                const icon = this.add.text(0, 0, symbol, { fontSize: '32px' }).setOrigin(0.5);
                container.add(icon);
            }

            const label = this.add.text(0, 55, name, { fontSize: '14px', color: '#5f4b32', fontWeight: 'bold', backgroundColor: '#ffffff88' }).setOrigin(0.5);
            container.add(label);
        }
        
        container.addAt(visual, 0);
        // Центрируем визуальный объект относительно точки привязки (верхнего угла ромба)
        visual.y = -visual.displayHeight / 2 + GRID_CONFIG.tileH; 

        container.setSize(visual.displayWidth, visual.displayHeight);
        container.setInteractive({ draggable: true });
        container.name = name;

        this.input.setDraggable(container);

        container.on('dragstart', () => {
            container.setDepth(1000);
            this.gridGraphics.setVisible(true);
        });

        container.on('drag', (pointer, dragX, dragY) => {
            container.x = dragX;
            container.y = dragY;
            
            const iso = this.screenToIso(dragX, dragY);
            const isValid = this.isSpaceFree(iso.gridX, iso.gridY, container.gridW, container.gridH, container);
            this.drawGridIndicator(iso.gridX, iso.gridY, container.gridW, container.gridH, isValid);
        });

        container.on('dragend', (pointer) => {
            const iso = this.screenToIso(container.x, container.y);
            const isValid = this.isSpaceFree(iso.gridX, iso.gridY, container.gridW, container.gridH, container);
            
            if (isValid) {
                container.gridX = iso.gridX;
                container.gridY = iso.gridY;
            }
            
            const finalPos = this.isoToScreen(container.gridX, container.gridY);
            container.x = finalPos.x;
            container.y = finalPos.y;
            container.setDepth(10 + container.gridX + container.gridY);
            this.gridGraphics.clear();
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