module WebSketch {

    //  9patchボタン
    export class Practice1 extends Phaser.State {
        back: Phaser.Sprite;
        label: Phaser.Text;
        group:Phaser.Group;

        btnOk: Button9P;
        btnCancel: Button9P;

        static loadContents(game: Phaser.Game) {
            game.load.spritesheet("button", "assets/rpanel63_63_3.png", 63, 63);
            game.load.image("sample", "assets/jigsample1_512_512.png");
        }


        create() {
            //  ファイル選択
            this.setDebugFileInput();
            //  背景親パネル
            this.back = this.game.add.sprite(0, 0, "white");
            this.back.tint = 0xffeeb9;

            this.label = this.game.add.text(0, 0, "Simple Jigsaw", {});

            this.game.add.text(0, 30, "Select image file in above button", {});

            this.group = this.game.add.group();
            this.group.position.set(this.game.world.centerX, this.game.world.centerY);

            var img = MfTool.JigMaker.loadImageToBitmapCache(this.game, "sample");

            this.makeJigsaw("sample", img.width, img.height);

            this.resize();
        }

        loadComp(source:string) {
            var img = MfTool.JigMaker.loadHtmlFileToBitmapCache(this.game, source,"sample");

            this.makeJigsaw("sample", img.width, img.height);
        }

        makeJigsaw(imgname: string, imgwidth: number, imgheight: number) {
            //  ジグソーパーツ生成
            this.group.removeAll();

            var partslist = MfTool.JigMaker.makeSplitSplite(this.game, imgname, 5, 5);

            //  ダミーユニット設定
            for (var i = 0; i < partslist.length; i++) {
                var zig = partslist[i];

                zig.position.set(zig.position.x - imgwidth / 2 + this.game.rnd.realInRange(-5, 5),
                    zig.position.y - imgheight / 2 + this.game.rnd.realInRange(-5, 5));

                this.group.add(zig);

                zig.input.enableDrag(false, true, true, 128);
            }
        }

        setDebugFileInput() {
            var p = document.createElement("input");
            p.id = "readdebug";
            p.type = "file";
            p.accept = "image/*";
            p.onchange = ()=>{this.loadPict()};
            document.getElementById("debugbox").appendChild(p);
        }
        loadPict() {
            var p = document.getElementById("readdebug");
            var data = p["files"][0];
            if (data == null)
                return;
            var rd = new FileReader();
            rd.addEventListener("load",() => {
                this.loadComp(rd.result);
            });
            rd.readAsDataURL(data);
        }


        resize() {
            //  背景リサイズ調整
            this.back.width = this.game.world.width;
            this.back.height = this.game.world.height;
            this.group.position.set(this.game.world.centerX, this.game.world.centerY);
        }
    }

}  