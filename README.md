<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>期中考複習傳送門456</title>
    <style>
        :root {
            --primary: #6366f1;       /* 主色調 (靛藍) */
            --primary-hover: #4f46e5;
            --bg-main: #f8fafc;       /* 背景灰 */
            --text-main: #1e293b;     /* 深色文字 */
            --text-muted: #64748b;    /* 次要文字 */
            --card-bg: #ffffff;       /* 卡片背景 */
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Segoe UI', "Microsoft JhengHei", -apple-system, BlinkMacSystemFont, sans-serif;
            background-color: var(--bg-main);
            color: var(--text-main);
            line-height: 1.6;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        .container {
            width: 90%;
            max-width: 1000px;
            margin: 50px auto;
        }
        header {
            text-align: center;
            margin-bottom: 50px;
        }
        h1 {
            color: var(--primary);
            font-size: 2.5rem;
            margin-bottom: 10px;
        }
        .subtitle {
            color: var(--text-muted);
            font-size: 1.2rem;
        }

        /* Grid Layout for Cards */
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 25px;
            padding: 20px;
        }

        /* Course Card Styles */
        .card {
            background: var(--card-bg);
            border-radius: 16px;
            padding: 30px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
            transition: all 0.3s ease;
            text-decoration: none; /* Remove default link underline */
            color: inherit;
            border: 2px solid transparent;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            position: relative;
            overflow: hidden;
        }
        .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            border-color: var(--primary);
        }
        .card-icon {
            font-size: 3rem;
            margin-bottom: 20px;
            background: var(--bg-main);
            width: 80px;
            height: 80px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: 0.3s;
        }
        .card:hover .card-icon {
            background: var(--primary);
            transform: scale(1.1) rotate(5deg);
        }

        .card h2 {
            font-size: 1.5rem;
            margin-bottom: 10px;
            color: var(--text-main);
        }
        .card p {
            color: var(--text-muted);
            flex-grow: 1; /* Pushes the button to the bottom if text length varies */
        }
        .card-badge {
            position: absolute;
            top: 20px;
            right: 20px;
            background: #dbeafe;
            color: #1e40af;
            font-size: 0.8rem;
            font-weight: bold;
            padding: 5px 10px;
            border-radius: 20px;
        }
        /* 特別為史迪奇卡片設計的標籤顏色 */
        .card-badge.relax {
            background: #dcfce7;
            color: #166534;
        }
        /* 特別為日文卡片設計的標籤顏色 (粉色系) */
        .card-badge.lang {
            background: #fce7f3;
            color: #9d174d;
        }

        .btn-enter {
            margin-top: 25px;
            padding: 10px 20px;
            background-color: var(--primary);
            color: white;
            border-radius: 8px;
            font-weight: bold;
            transition: 0.2s;
            width: 100%;
            text-align: center;
        }
        .card:hover .btn-enter {
            background-color: var(--primary-hover);
        }

        /* Responsive adjustments */
        @media (max-width: 600px) {
            h1 { font-size: 2rem; }
            .grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>

    <div class="container">
        <header>
            <h1>🎓 期中考複習傳送門</h1>
            <p class="subtitle">選擇科目，開始高效複習</p>
        </header>

        <main class="grid">
           
            <a href="Project_Management_MidtermExam.html" class="card">
                <span class="card-badge">Midterm</span>
                <div class="card-icon">📘</div>
                <h2>專案管理</h2>
                <p>PMBOK 核心知識、五大流程、十大知識領域、敏捷管理、關鍵角色職責。</p>
                <div class="btn-enter">進入複習 →</div>
            </a>

            <a href="Sports_Medicine_MidtermExam.html" class="card">
                <span class="card-badge">Midterm</span>
                <div class="card-icon">🏥</div>
                <h2>運動醫學</h2>
                <p>(尚未建立檔案) 點擊此處將連結到您的運動醫學複習筆記頁面。</p>
                <div class="btn-enter">進入複習 →</div>
            </a>

            <a href="Japanese_Vocabulary.html" class="card">
                <span class="card-badge lang">Language</span>
                <div class="card-icon">🇯🇵</div>
                <h2>日文50音單字</h2>
                <p>平假名與片假名對照表、基礎發音規則、初級必背單字總整理。</p>
                <div class="btn-enter">進入複習 →</div>
            </a>

            <a href="Stitch.html" class="card">
                <span class="card-badge relax">Relax Mode</span>
                <div class="card-icon">💙</div>
                <h2>史迪奇日常</h2>
                <p>讀書讀太累了嗎？休息一下，來看看藍色外星人的可愛地球生活日記吧！</p>
                <div class="btn-enter">去被療癒 →</div>
            </a>

        </main>
    </div>

    <footer style="margin-top: auto; padding: 20px; color: var(--text-muted); font-size: 0.9em;">
        祝考試順利 All Pass! 💯
    </footer>

</body>
</html>
