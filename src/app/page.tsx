"use client";

import { useState, useRef, useEffect } from "react";

export default function Home() {
    const [image, setImage] = useState<string | null>(null);
    const [processedImage, setProcessedImage] = useState<string | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [textLine1, setTextLine1] = useState<string>("原 作");
    const [textLine2, setTextLine2] = useState<string>("山下 一郎");
    const [textLine3, setTextLine3] = useState<string>("「名探偵タロウ」（星月出版「週刊少年スター」連載中）");
    const [fontSize1, setFontSize1] = useState<number>(57); // 原作のフォントサイズ
    const [fontSize2, setFontSize2] = useState<number>(70); // 作者名のフォントサイズ
    const [fontSize3, setFontSize3] = useState<number>(12); // 作品名のフォントサイズ
    const [posY1, setPosY1] = useState<number>(0); // 原作の位置調整（相対値）
    const [posY2, setPosY2] = useState<number>(-7); // 作者名の位置調整（相対値）
    const [posY3, setPosY3] = useState<number>(0); // 作品名の位置調整（相対値）
    const [shadowOffset, setShadowOffset] = useState<number>(1); // 影のオフセット
    const [shadowOffset3, setShadowOffset3] = useState<number>(1); // 3行目の影のオフセット
    const [shadowBlur, setShadowBlur] = useState<number>(0); // 影のぼかし
    const [authorColor, setAuthorColor] = useState<string>("#FFA500"); // 原作と作者名の色（デフォルトはオレンジ）
    const [titleColor, setTitleColor] = useState<string>("#FFFFFF"); // 作品名の色（デフォルトは白）

    // コンポーネントのマウント時に白い背景画像を生成
    useEffect(() => {
        createWhiteBackground();
    }, []);

    // 白い背景画像を生成する関数
    const createWhiteBackground = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 400;
        const ctx = canvas.getContext('2d');

        if (ctx) {
            // 白い背景を描画
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // 「画像をアップロード」というテキストを中央に表示
            ctx.fillStyle = '#888888';
            ctx.font = '20px "Noto Sans JP", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('サンプル画像（画像をアップロードしてください）', canvas.width / 2, canvas.height / 2);

            // 生成した画像をセット（この段階ではまだプレビューに表示されない）
            const whiteImage = canvas.toDataURL('image/png');
            setImage(whiteImage);

            // 初回のサンプル画像のみ、少し遅延させて2回描画する
            // これによりフォント読み込みを確実にする
            setTimeout(() => {
                // 同じ画像を再度セットして2回目の描画をトリガー
                const img = new Image();
                img.onload = () => renderImage(img);
                img.src = whiteImage;
            }, 100);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            setImage(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const processImage = () => {
        if (!image || !canvasRef.current) return;

        const img = new Image();
        img.onload = () => {
            // 通常のアップロード画像は1回だけ描画
            renderImage(img);
        };

        img.src = image;
    };

    // 画像描画処理を関数に分離
    const renderImage = (img: HTMLImageElement) => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d")!;

        // 画像のアスペクト比を保持しながらキャンバスサイズを設定
        const maxWidth = 800;
        const maxHeight = 600;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
            height = (maxWidth / width) * height;
            width = maxWidth;
        }

        if (height > maxHeight) {
            width = (maxHeight / height) * width;
            height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;

        // 画像を描画
        ctx.drawImage(img, 0, 0, width, height);

        // 文字の位置を画像の下部に設定
        const textY = height - 30;

        // 文字列を影付きで描画する関数
        const drawTextWithShadow = (text: string, y: number, fontSize: number, color: string, isBold: boolean = false, customShadowOffset: number = shadowOffset) => {
            // Noto Sans JPを使用（原作と作者名はより太く）
            const fontWeight = isBold ? 900 : 700;
            ctx.font = `${fontWeight} ${fontSize}px 'Noto Sans JP', sans-serif`;
            ctx.fillStyle = color;
            ctx.textAlign = "center";
            const x = width / 2;

            // 影の設定
            ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
            ctx.shadowOffsetX = customShadowOffset;
            ctx.shadowOffsetY = customShadowOffset;
            ctx.shadowBlur = shadowBlur;

            // テキストを描画
            ctx.fillText(text, x, y);

            // 影の設定をリセット
            ctx.shadowColor = "transparent";
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            ctx.shadowBlur = 0;
        };

        // 3行のテキストを描画（各行に個別のフォントサイズを適用）
        // フォントサイズに応じて行間を調整（行間を小さくする）
        const line3Y = textY + posY3; // 位置調整を適用
        const line2Y = line3Y - fontSize3 - 3 + posY2; // 位置調整を適用
        const line1Y = line2Y - fontSize2 - 3 + posY1; // 位置調整を適用

        drawTextWithShadow(textLine1, line1Y, fontSize1, authorColor, true); // 原作は太く
        drawTextWithShadow(textLine2, line2Y, fontSize2, authorColor, true); // 作者名も太く
        drawTextWithShadow(textLine3, line3Y, fontSize3, titleColor, false, shadowOffset3); // 3行目は別の影オフセット値を使用

        // 処理後の画像をセット
        setProcessedImage(canvas.toDataURL("image/png"));
    };

    useEffect(() => {
        if (image) {
            processImage();
        }
    }, [image, textLine1, textLine2, textLine3, fontSize1, fontSize2, fontSize3, posY1, posY2, posY3, shadowOffset, shadowOffset3, shadowBlur, authorColor, titleColor]);

    const handleDownload = () => {
        if (!processedImage) return;

        const link = document.createElement("a");
        link.href = processedImage;
        link.download = "original-author-caption.png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="min-h-screen p-8 flex flex-col items-center justify-center bg-gray-100 font-[var(--font-noto-sans-jp)]">
            <h1 className="text-3xl font-bold mb-2 text-gray-800">原作者テロップジェネレーター</h1>

            <button
                onClick={() => {
                    // 現在のURLをエンコード
                    const shareUrl = encodeURIComponent(window.location.href);
                    // テキストをエンコード
                    const shareText = encodeURIComponent("原作者テロップジェネレーターで画像を作成してみよう！");
                    // X(Twitter)共有URL
                    const twitterUrl = `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`;
                    // 新しいウィンドウで開く
                    window.open(twitterUrl, "_blank");
                }}
                className="mb-8 bg-black hover:bg-gray-800 text-white py-1 px-4 rounded-full text-sm font-semibold flex items-center justify-center"
            >
                <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                X(Twitter)でサイトを共有
            </button>

            <div className="w-full max-w-3xl bg-white p-6 rounded-lg shadow-md">
                <div className="mb-6">
                    <label className="block text-gray-800 text-sm font-bold mb-2" htmlFor="image-upload">
                        画像をアップロード
                    </label>
                    <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="w-full p-2 border border-gray-300 rounded text-gray-800"
                    />
                </div>

                {image && (
                    <div className="mb-6 flex flex-col items-center">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">プレビュー</h2>
                        <canvas ref={canvasRef} className="hidden" />
                        {processedImage && (
                            <div className="mt-2">
                                <img
                                    src={processedImage}
                                    alt="Processed"
                                    className="max-w-full rounded border border-gray-300"
                                />
                                <p className="mt-2 text-sm text-gray-600 text-center">
                                    スマホをご利用の場合は、画像を長押しして「画像を保存」を選択して保存してください。（写真フォルダに保存されるのでおすすめです。）
                                </p>
                            </div>
                        )}

                        {processedImage && (
                            <button
                                onClick={handleDownload}
                                className="mt-6 bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-lg font-semibold"
                            >
                                画像をダウンロード
                            </button>
                        )}
                    </div>
                )}

                <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">テキスト設定</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-gray-800 text-sm font-bold mb-2" htmlFor="text-line1">
                                1行目
                            </label>
                            <div className="flex gap-4">
                                <input
                                    id="text-line1"
                                    type="text"
                                    value={textLine1}
                                    onChange={(e) => setTextLine1(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded text-gray-800"
                                />
                                <div className="w-48">
                                    <label className="block text-gray-800 text-xs mb-1" htmlFor="font-size1">
                                        サイズ: {fontSize1}px
                                    </label>
                                    <input
                                        id="font-size1"
                                        type="range"
                                        min="16"
                                        max="80"
                                        value={fontSize1}
                                        onChange={(e) => setFontSize1(parseInt(e.target.value))}
                                        className="w-full"
                                    />
                                </div>
                            </div>
                            <div className="mt-2">
                                <label className="block text-gray-800 text-xs mb-1" htmlFor="pos-y1">
                                    縦位置: {posY1 > 0 ? `下 ${posY1}px` : posY1 < 0 ? `上 ${Math.abs(posY1)}px` : "中央"}
                                </label>
                                <input
                                    id="pos-y1"
                                    type="range"
                                    min="-50"
                                    max="50"
                                    value={posY1}
                                    onChange={(e) => setPosY1(parseInt(e.target.value))}
                                    className="w-full"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-gray-800 text-sm font-bold mb-2" htmlFor="text-line2">
                                2行目
                            </label>
                            <div className="flex gap-4">
                                <input
                                    id="text-line2"
                                    type="text"
                                    value={textLine2}
                                    onChange={(e) => setTextLine2(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded text-gray-800"
                                />
                                <div className="w-48">
                                    <label className="block text-gray-800 text-xs mb-1" htmlFor="font-size2">
                                        サイズ: {fontSize2}px
                                    </label>
                                    <input
                                        id="font-size2"
                                        type="range"
                                        min="16"
                                        max="80"
                                        value={fontSize2}
                                        onChange={(e) => setFontSize2(parseInt(e.target.value))}
                                        className="w-full"
                                    />
                                </div>
                            </div>
                            <div className="mt-2">
                                <label className="block text-gray-800 text-xs mb-1" htmlFor="pos-y2">
                                    縦位置: {posY2 > 0 ? `下 ${posY2}px` : posY2 < 0 ? `上 ${Math.abs(posY2)}px` : "中央"}
                                </label>
                                <input
                                    id="pos-y2"
                                    type="range"
                                    min="-50"
                                    max="50"
                                    value={posY2}
                                    onChange={(e) => setPosY2(parseInt(e.target.value))}
                                    className="w-full"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-gray-800 text-sm font-bold mb-2" htmlFor="text-line3">
                                3行目
                            </label>
                            <div className="flex gap-4">
                                <input
                                    id="text-line3"
                                    type="text"
                                    value={textLine3}
                                    onChange={(e) => setTextLine3(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded text-gray-800"
                                />
                                <div className="w-48">
                                    <label className="block text-gray-800 text-xs mb-1" htmlFor="font-size3">
                                        サイズ: {fontSize3}px
                                    </label>
                                    <input
                                        id="font-size3"
                                        type="range"
                                        min="8"
                                        max="48"
                                        value={fontSize3}
                                        onChange={(e) => setFontSize3(parseInt(e.target.value))}
                                        className="w-full"
                                    />
                                </div>
                            </div>
                            <div className="mt-2">
                                <label className="block text-gray-800 text-xs mb-1" htmlFor="pos-y3">
                                    縦位置: {posY3 > 0 ? `下 ${posY3}px` : posY3 < 0 ? `上 ${Math.abs(posY3)}px` : "中央"}
                                </label>
                                <input
                                    id="pos-y3"
                                    type="range"
                                    min="-50"
                                    max="50"
                                    value={posY3}
                                    onChange={(e) => setPosY3(parseInt(e.target.value))}
                                    className="w-full"
                                />
                            </div>
                        </div>

                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-800 text-sm font-bold mb-2" htmlFor="author-color">
                                    原作・作者名の色
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        id="author-color"
                                        type="color"
                                        value={authorColor}
                                        onChange={(e) => setAuthorColor(e.target.value)}
                                        className="w-10 h-10 cursor-pointer"
                                    />
                                    <span
                                        className="px-2 py-1 rounded"
                                        style={{
                                            backgroundColor: 'black',
                                            color: authorColor,
                                            border: '1px solid gray',
                                            fontWeight: 900,
                                            fontFamily: "'Noto Sans JP', sans-serif",
                                            textShadow: '2px 2px 2px rgba(0,0,0,0.5)'
                                        }}
                                    >
                                        プレビュー: {textLine1}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-gray-800 text-sm font-bold mb-2" htmlFor="title-color">
                                    作品名の色
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        id="title-color"
                                        type="color"
                                        value={titleColor}
                                        onChange={(e) => setTitleColor(e.target.value)}
                                        className="w-10 h-10 cursor-pointer"
                                    />
                                    <span
                                        className="px-2 py-1 rounded"
                                        style={{
                                            backgroundColor: 'black',
                                            color: titleColor,
                                            border: '1px solid gray',
                                            fontWeight: 'bold',
                                            fontFamily: "'Noto Sans JP', sans-serif",
                                            textShadow: '2px 2px 2px rgba(0,0,0,0.5)'
                                        }}
                                    >
                                        プレビュー: 作品名
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-800 text-sm font-bold mb-2" htmlFor="shadow-offset">
                                    影のオフセット (1・2行目): {shadowOffset}px
                                </label>
                                <input
                                    id="shadow-offset"
                                    type="range"
                                    min="0"
                                    max="5"
                                    step="0.5"
                                    value={shadowOffset}
                                    onChange={(e) => setShadowOffset(parseFloat(e.target.value))}
                                    className="w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-800 text-sm font-bold mb-2" htmlFor="shadow-offset3">
                                    影のオフセット (3行目): {shadowOffset3}px
                                </label>
                                <input
                                    id="shadow-offset3"
                                    type="range"
                                    min="0"
                                    max="5"
                                    step="0.5"
                                    value={shadowOffset3}
                                    onChange={(e) => setShadowOffset3(parseFloat(e.target.value))}
                                    className="w-full"
                                />
                            </div>
                        </div>

                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-800 text-sm font-bold mb-2" htmlFor="shadow-blur">
                                    影のぼかし: {shadowBlur}px
                                </label>
                                <input
                                    id="shadow-blur"
                                    type="range"
                                    min="0"
                                    max="10"
                                    step="0.5"
                                    value={shadowBlur}
                                    onChange={(e) => setShadowBlur(parseFloat(e.target.value))}
                                    className="w-full"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <footer className="mt-8 text-center text-gray-600 text-sm">
                <p>このツールは<a href="https://x.com/mujina_kinokuni/status/1911785786040861048" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">こちらのツイート</a>にインスパイアされています。</p>
                <p className="mt-2">制作: <a href="https://x.com/yukyan_p" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">@yukyan_p</a></p>
            </footer>
        </div>
    );
}
