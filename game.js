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
class DesignScene extends Phaser.Scene {
    constructor() {
        super('DesignScene');
    }

    preload() {
        // Загружаем шаблон комнаты
        this.load.image('room_bg', 'assets/shablonKomnati.png');
        
        // Здесь можно загрузить свои красивые ассеты мебели
        // this.load.image('old_chair', 'assets/old_chair.png');
        // this.load.image('dusty_table', 'assets/dusty_table.png');
        // this.load.image('plant', 'assets/plant.png');
        // this.load.image('lamp', 'assets/lamp.png');
        // this.load.image('single_bed', 'assets/single_bed.png');
    }

    create() {
        furnitureItems = []; // Reset items
        if (document.getElementById('ui-panel')) {
            document.getElementById('ui-panel').style.display = 'block';
        }
        
        // Background: Используем добавленный шаблон комнаты
        const bg = this.add.image(400, 250, 'room_bg');
        bg.setDisplaySize(800, 500); // Растягиваем на всё игровое поле

        this.add.text(10, 10, 'Комната: Дизайн-проект', { 
            color: '#5f4b32', 
            fontSize: '20px', 
            fontWeight: 'bold',
            backgroundColor: '#ffffff88',
            padding: { x: 10, y: 5 }
        });

        // Initial furniture
        this.addFurnitureObject(150, 200, 'Old Chair', 0x8b7355);
        this.addFurnitureObject(300, 300, 'Dusty Table', 0xdeb887);
        this.addFurnitureObject(600, 150, 'Single Bed', 0xadd8e6);

        this.updateUI();

        window.addFurniture = (type) => {
            let color = 0xcccccc;
            if (type === 'Plant') color = 0x228B22;
            if (type === 'Lamp') color = 0xFFFF00;
            if (type === 'Table') color = 0xdeb887;
            this.addFurnitureObject(400, 250, type, color);
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

    addFurnitureObject(x, y, name, color) {
        const container = this.add.container(x, y);
        
        // Выбор визуала: Спрайт (если загружен) или Фигура (заглушка)
        let visual;
        const textureKey = name.toLowerCase().replace(' ', '_');
        
        if (this.textures.exists(textureKey)) {
            visual = this.add.image(0, 0, textureKey);
            // Масштабируем до разумных пределов, если нужно
            visual.setDisplaySize(100, 100);
        } else {
            // Заглушка, если картинки нет
            visual = this.add.rectangle(0, 0, 80, 80, color);
            visual.setStrokeStyle(3, 0x5f4b32);
            
            // Добавляем иконку-символ для красоты
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
        }
        
        const label = this.add.text(0, 55, name, { fontSize: '14px', color: '#5f4b32', fontWeight: 'bold', backgroundColor: '#ffffff88' }).setOrigin(0.5);
        
        container.addAt(visual, 0);
        container.add(label);
        
        container.setSize(80, 80);
        container.setInteractive({ draggable: true });
        container.name = name;

        this.input.setDraggable(container);

        container.on('drag', (pointer, dragX, dragY) => {
            container.x = dragX;
            container.y = dragY;
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
    backgroundColor: '#fdf6e3',
    scene: [BriefingScene, DesignScene]
};

const game = new Phaser.Game(config);

document.addEventListener('contextmenu', e => e.preventDefault());