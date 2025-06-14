const assets = {};
let assetsLoadedCount = 0;
let totalAssets = 0;

function loadAsset(name, path, type) {
    totalAssets++;
    return new Promise((resolve) => {
        const asset = type === 'https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.istockphoto.com%2Fphotos%2Fwhite-mutt&psig=AOvVaw3CuTcYBIUO5d0IkwHJpI5F&ust=1749874908410000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCOD7v5jG7Y0DFQAAAAAdAAAAABAE' ? new Image() : new Audio();
        asset.src = path;
        asset.onload = asset.oncanplaythrough = () => {
            assetsLoadedCount++;
            resolve();
        };
        assets[name] = asset;
    });
}

function allAssetsLoaded() {
    return assetsLoadedCount === totalAssets;
}

class Buddy {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = 5;
        this.barkRange = 50;
        this.autoBarkUnlocked = false;
        this.autoBarkActive = false;
        this.autoBarkCooldown = 0;
    }

    draw(ctx) {
        ctx.drawImage(assets.buddy, this.x, this.y, this.width, this.height);
    }

    upgradeSpeed() {
        this.speed += 2;
    }

    upgradeBarkRange() {
        this.barkRange += 20;
    }

    unlockAutoBark() {
        this.autoBarkUnlocked = true;
    }

    activateAutoBark() {
        if (this.autoBarkUnlocked && this.autoBarkCooldown === 0) {
            this.autoBarkActive = true;
            this.autoBarkCooldown = 300; // Cooldown timer
        }
    }

    updateAutoBark() {
        if (this.autoBarkActive) {
            this.autoBarkCooldown--;
            if (this.autoBarkCooldown <= 0) {
                this.autoBarkActive = false;
            }
        }
    }
}
