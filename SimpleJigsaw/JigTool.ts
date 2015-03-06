module MfTool {
    //  ジグソーツール
    export class JigSprite extends Phaser.Sprite {
        maskSize: Phaser.Point;

        constructor(game: Phaser.Game, x: number, y: number, key?: any, frame?: any) {
            super(game, x, y, key, frame);
        }

        //  画像そのもののサイズは波線境界のため大きめにしているので、ここで有効サイズを返させる　よいか？
        get width(): number {
            return this.maskSize.x;
        }
        get height(): number {
            return this.maskSize.y;
        }
    }
    /*
    スプライトからジグソー状に分割した複数スプライトを作るツール
    */
    export class JigMaker {

        static makeSplitSplite(game: Phaser.Game, cachename: string, numX: number, numY: number): Phaser.Sprite[] {
            var posList = Array<Phaser.Point>();    //  揺らさない位置座標配列(n+1,n+1配列)
            var posrndList = Array<Phaser.Point>();    //  揺らした位置座標配列(n+1,n+1配列)
            var lineWindList = Array<Phaser.Rectangle[]>();   //  ベジェの2点を記述した座標配列(2*(n+1),n+1)配列,x,yとw,hを個々に2点とする。0段目xが上辺横棒、1段目xが左辺横棒 

            var spliteList: Phaser.Sprite[] = [];
            var baseSplite = game.cache.getBitmapData(cachename);
            var spliteWidth = baseSplite.width;
            var spliteHeight = baseSplite.height;
            //  まず素直に方形リストを作る(0～numのX,Y範囲。つまり+1サイズの配列)
            for (var py0 = 0; py0 <= numY; py0++) {
                for (var px0 = 0; px0 <= numX; px0++) {
                    var origin0 = new Phaser.Point(spliteWidth / numX * px0, spliteHeight / numY * py0);
                    posList.push(origin0);
                    //  位置座標に若干の乱数要素を入れるのはここのほうがいいな
                    posrndList.push(new Phaser.Point(spliteWidth / numX * px0, spliteHeight / numY * py0));
                }
            }
            //  左上を頂点とした横線と縦線のベジェ点(2点)をリストに作る
            var partsSize = new Phaser.Rectangle(0,0, spliteWidth / numX, spliteHeight / numY);
            var rndsize = 30;   //  乱数振れ幅
            var brate = 0.3;    //  ベジェ線の長さ相当(厳密には接線長さ)の比率
            for (var py1 = 0; py1 <= numY; py1++) {
                for (var px1 = 0; px1 <= numX; px1++) {
                    //var origin1 = posList[px1 + py1 * (numX + 1)];
                    var ran1 = game.rnd.between(-rndsize, rndsize);
                    var ran2 = game.rnd.between(-rndsize, rndsize);
                    if (py1 === 0 || py1 === numY) {
                        ran1 = ran2 = 0;    //  上下の末端は直線
                    }
                    var r1 = new Phaser.Rectangle(partsSize.width * brate, ran1,
                        - partsSize.width * brate, ran2); //  lefttopからの揺らしとrighttopからの揺らし
                    var ran3 = game.rnd.between(-rndsize, rndsize);
                    var ran4 = game.rnd.between(-rndsize, rndsize);
                    if (px1 === 0 || px1 === numX) {
                        ran3 = ran4 = 0;    //  左右の末端は直線
                    }
                    var r2 = new Phaser.Rectangle(
                        ran3, partsSize.height * brate,
                        ran4, - partsSize.height * brate);    //  lefttopからの揺らしとleftdownからの揺らし
                    lineWindList.push([r1, r2]);
                }
            }
            //  方形リストから四角頂点を取り出し、それを使ってPIXIマスクを作る→スプライト画像をHTML5のクリップ領域にオフスクリーン描画し、それからスプライトを起こし直す
            for (var py = 0; py < numY; py++) {
                for (var px = 0; px < numX; px++) {
                    var origin = posList[px + py * (numX + 1)];   //  揺らさない左上座標
                    //  左上 
                    var lefttop = posrndList[px + py * (numX + 1)];
                    var righttop = posrndList[px + 1 + py * (numX + 1)];
                    var leftbottom = posrndList[px + (py + 1) * (numX + 1)];
                    var rightbottom = posrndList[px + 1 + (py + 1) * (numX + 1)];
                    lefttop = new Phaser.Point(lefttop.x - origin.x, lefttop.y - origin.y);
                    righttop = new Phaser.Point(righttop.x - origin.x, righttop.y - origin.y);
                    leftbottom = new Phaser.Point(leftbottom.x - origin.x, leftbottom.y - origin.y);
                    rightbottom = new Phaser.Point(rightbottom.x - origin.x, rightbottom.y - origin.y);
                    var ro = lineWindList[px + py * (numX + 1)];  //  原点からの2線
                    var rr = lineWindList[px + 1 + py * (numX + 1)];  //  右端からの2線
                    var rd = lineWindList[px + (py + 1) * (numX + 1)];  //  下端からの2線

                    //  HTML5でクリップとビットマップレンダリングで部品を作る方法
                    var maxwidth = partsSize.width + 2 * rndsize;  // Math.max(righttop.x, rightbottom.x);
                    var maxheight = partsSize.height + 2 * rndsize;    //Math.max(leftbottom.y, rightbottom.y);
                    var offsetx = rndsize;
                    var offsety = rndsize;

                    var bmd = game.add.bitmapData(maxwidth, maxheight); //  境界の波打ちの形があるのでビットマップとしては広めに取らないといけない

                    bmd.ctx.beginPath();
                    bmd.ctx.moveTo(offsetx + lefttop.x, offsety + lefttop.y);
                    bmd.ctx.bezierCurveTo(offsetx + lefttop.x + ro[0].x, offsety + lefttop.y + ro[0].y,
                        offsetx + righttop.x + ro[0].width, offsety + righttop.y + ro[0].height,
                        offsetx + righttop.x, offsety + righttop.y);
                    bmd.ctx.bezierCurveTo(offsetx + righttop.x + rr[1].x, offsety + righttop.y + rr[1].y,
                        offsetx + rightbottom.x + rr[1].width, offsety + rightbottom.y + rr[1].height,
                        offsetx + rightbottom.x, offsety + rightbottom.y);
                    bmd.ctx.bezierCurveTo(offsetx + rightbottom.x + rd[0].width, offsety + rightbottom.y + rd[0].height,
                        offsetx + leftbottom.x + rd[0].x, offsety + leftbottom.y + rd[0].y,
                        offsetx + leftbottom.x, offsety + leftbottom.y);
                    bmd.ctx.bezierCurveTo(offsetx + leftbottom.x + ro[1].width, offsety + leftbottom.y + ro[1].height,
                        offsetx + lefttop.x + ro[1].x, offsety + lefttop.y + ro[1].y,
                        offsetx + lefttop.x, offsety + lefttop.y);
                    bmd.ctx.clip();
                    bmd.ctx.drawImage(baseSplite.texture.baseTexture.source, offsetx - origin.x, offsety - origin.y);
                    var sparts = new JigSprite(game, partsSize.x + origin.x + partsSize.width / 2, partsSize.y + origin.y + partsSize.height / 2, bmd);
                    sparts.maskSize = new Phaser.Point(partsSize.width, partsSize.height);
                    sparts.anchor.set(0.5, 0.5);
                    sparts.inputEnabled = true;

                    //sparts.input.enableDrag(false, true, true, 128);

                    spliteList.push(sparts);
                }
            }
            return spliteList;
        }

        /*
        Phaser ImageからBitmap Cacheへ取込
        */
        static loadImageToBitmapCache(game: Phaser.Game, imageName: string): Phaser.Image {
            var img = game.cache.getImage(imageName);
            var bm = game.add.bitmapData(img.width, img.height);
            bm.draw(img);
            game.cache.addBitmapData(imageName, bm);
            return img;
        }

        /*
        Html fileからBitmap Cacheへ取込
        */
        static loadHtmlFileToBitmapCache(game: Phaser.Game, sourceUrl: string,cacheName:string): HTMLImageElement {
            var img = document.createElement("img");
            img.src = sourceUrl;
            var bm = game.add.bitmapData(img.width, img.height);
            //var bm = game.add.bitmapData(game.width, game.height);
            //bm.ctx.scale(game.width / img.width, game.height / img.height);
            bm.ctx.drawImage(img, 0, 0);
            game.cache.addBitmapData(cacheName, bm);
            return img;
        }

    }

}
