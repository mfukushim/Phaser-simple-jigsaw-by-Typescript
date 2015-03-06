module WebSketch {

    /*  Simple 9 patch Button */
    export class Button9P extends Phaser.Group {
        splite: Phaser.Sprite[] = [];
        textLabel: Phaser.Text;
        btn: Phaser.Button;
        lefttopRatio = new Phaser.Point(1 / 3, 1 / 3);
        rightbottomRatio = new Phaser.Point(1 / 3, 1 / 3);
        baseSize: Phaser.Point;
        overFrame: number;
        outFrame: number;
        downFrame: number;
        upFrame: number;

        buttonCallback: (btn: Phaser.Button, pt: Phaser.Pointer) => void;

        constructor(game: Phaser.Game, x: number, y: number, key: string, frame: number= 0,
            callback: (btn: Phaser.Button, pt: Phaser.Pointer) => void= null, overFrame: number= 0, outFrame: number= 0, downFrame: number= 0, upFrame: number= 0) {
            super(game);
            this.overFrame = overFrame;
            this.outFrame = outFrame;
            this.downFrame = downFrame;
            this.upFrame = upFrame;

            this.buttonCallback = callback;
            this.position.set(x, y);

            //  cropしながらの9patchスプライトを割り当てる
            //  透過パネルでボタンを割り当てて、押下時とフロー時のframe切り替えはそのボタンからのイベントでやる形を考えてみる
            //  コンテンツのサイズが確定しないのでまずは割り当ててからサイズと位置とクロップを指定する
            //  単純化のためバウンドのサイズを計算しておく
            for (var j = 0; j < 3; j++) {
                for (var i = 0; i < 3; i++) {
                    var sp = new Phaser.Sprite(game, 0, 0, key);
                    this.splite.push(sp);
                    this.add(sp);
                }
            }
            this.baseSize = new Phaser.Point(this.splite[0].width, this.splite[0].height);

            this.btn = new Phaser.Button(game, 0, 0, null, null, null);

            this.add(this.btn);
            this.btn.onInputDown.add(this.btnDown, this);
            this.btn.onInputUp.add(this.btnUp, this);//  これが通常のボタン押下と同じ呼び出し
            this.btn.onInputOver.add(this.btnOver, this);
            this.btn.onInputOut.add(this.btnOut, this);

            this.textLabel = new Phaser.Text(game, this.btn.width / 2, this.btn.height / 2, "", {});
            this.textLabel.anchor.set(0.5, 0.5);
            this.add(this.textLabel);

            this.resize();
        }
        /*  event */
        btnDown(btn: Phaser.Button, pt: Phaser.Pointer) {
            this.setAllFrameNo(this.downFrame);
        }
        btnUp(btn: Phaser.Button, pt: Phaser.Pointer) {
            this.setAllFrameNo(this.upFrame);
            if (this.buttonCallback != null) {
                this.buttonCallback(btn, pt);
            }
        }
        btnOver(btn: Phaser.Button, pt: Phaser.Pointer) {
            this.setAllFrameNo(this.overFrame);
        }
        btnOut(btn: Phaser.Button, pt: Phaser.Pointer) {
            this.setAllFrameNo(this.outFrame);
        }

        setAllFrameNo(no: number) {
            for (var i = 0; i < this.splite.length; i++) {
                this.splite[i].frame = no;
            }
        }
        /* property */
        get width() {
            return this.btn.width;
        }
        set width(value) {
            this.btn.width = value;
            this.resize();
        }
        get height() {
            return this.btn.height;
        }
        set height(value) {
            this.btn.height = value;
            this.resize();
        }
        get text() {
            return this.textLabel.text;
        }
        set text(value) {
            this.textLabel.text = value;
        }

        /* resize */
        resize() {
            //  単純化のためバウンドのサイズを計算しておく
            var sp: Phaser.Sprite;
            var posy = 0;
            var posbasey = 0;
            var smallx = this.baseSize.x * (this.lefttopRatio.x + this.rightbottomRatio.x) > this.width;
            var smally = this.baseSize.y * (this.lefttopRatio.y + this.rightbottomRatio.y) > this.height;

            for (var j = 0; j < 3; j++) {
                var posx = 0;
                var posbasex = 0;
                for (var i = 0; i < 3; i++) {
                    var w: number;
                    var wb: number;
                    sp = this.splite[i + j * 3]; //  rectのバウンドはあとで調整する　cropで調整する場合、位置は全部同じにできるはず
                    switch (i) {
                        case 0: //  left
                            wb = this.baseSize.x * this.lefttopRatio.x;
                            if (smallx)
                                w = this.width * (this.lefttopRatio.x + (1 - this.lefttopRatio.x - this.rightbottomRatio.x) / 2);
                            else
                                w = wb;
                            break;
                        case 2: //  right
                            wb = this.baseSize.x * this.rightbottomRatio.x;
                            if (smallx)
                                w = this.width * (this.rightbottomRatio.x + (1 - this.lefttopRatio.x - this.rightbottomRatio.x) / 2);
                            else
                                w = wb;
                            break;
                        default:
                            w = this.width - this.baseSize.x * (this.lefttopRatio.x + this.rightbottomRatio.x);
                            if (w <= 0) w = 0;
                            wb = this.baseSize.x * (1 - this.lefttopRatio.x - this.rightbottomRatio.x);
                            break;
                    }
                    var h: number;
                    var hb: number;
                    switch (j) {
                        case 0: //  top
                            hb = this.baseSize.y * this.lefttopRatio.y;
                            if (smally)
                                h = this.height * (this.lefttopRatio.y + (1 - this.lefttopRatio.y - this.rightbottomRatio.y) / 2);
                            else
                                h = hb;
                            break;
                        case 2: //  bottom
                            hb = this.baseSize.y * this.rightbottomRatio.y;
                            if (smally)
                                h = this.height * (this.rightbottomRatio.y + (1 - this.lefttopRatio.y - this.rightbottomRatio.y) / 2);
                            else
                                h = hb;
                            break;
                        default:
                            h = this.height - this.baseSize.y * (this.lefttopRatio.y + this.rightbottomRatio.y);
                            if (h <= 0) h = 0;
                            hb = this.baseSize.y * (1 - this.lefttopRatio.y - this.rightbottomRatio.y);
                            break;
                    }
                    sp.scale.set(w / wb, h / hb);
                    sp.position.set(posx, posy);
                    var r = new Phaser.Rectangle(posbasex, posbasey, wb, hb);
                    sp.crop(r, false);
                    posx += w;
                    posbasex += wb;
                    if (i === 2) {
                        posy += h;
                        posbasey += hb;

                    }
                    /*
                    //  for debug
                    for (var n = 0; n < 3; n++) {
                        for (var m = 0; m < 3; m++) {
                            if (m === 1 && n === 1) {
                                this.splite[m + n * 3].alpha = 0;
                            }
                        }
                    }
*/
                }
            }

            this.textLabel.position.set(this.btn.width / 2, this.btn.height / 2);
        }
    }

}
