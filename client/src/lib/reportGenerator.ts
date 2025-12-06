export interface AnalysisResult {
  fileName: string;
  duration: number;
  sampleRate: number;
  channels: number;
  pitchData: number[];
  timeLabels: string[];
  timestamp: string;
}

export const generateHTMLReport = (analysisResult: AnalysisResult) => {
  const avgPitch = (analysisResult.pitchData.reduce((a, b) => a + b, 0) / analysisResult.pitchData.length).toFixed(2);
  const maxPitch = Math.max(...analysisResult.pitchData).toFixed(2);
  const minPitch = Math.min(...analysisResult.pitchData).toFixed(2);

  const htmlContent = `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>UMPA 피치 분석 보고서</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 100%);
            color: #e0e0e0;
            padding: 40px 20px;
        }
        .container {
            max-width: 900px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            padding: 40px;
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 2px solid rgba(168, 85, 247, 0.3);
            padding-bottom: 20px;
        }
        .header h1 {
            font-size: 32px;
            color: #a855f7;
            margin-bottom: 10px;
        }
        .header p {
            color: #888;
            font-size: 14px;
        }
        .info-section {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 30px;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .info-row:last-child {
            border-bottom: none;
        }
        .info-label {
            font-weight: 600;
            color: #a855f7;
        }
        .info-value {
            color: #e0e0e0;
        }
        .stats-section {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: rgba(168, 85, 247, 0.1);
            border: 1px solid rgba(168, 85, 247, 0.3);
            border-radius: 12px;
            padding: 20px;
            text-align: center;
        }
        .stat-label {
            font-size: 12px;
            color: #888;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: #a855f7;
        }
        .chart-section {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 30px;
        }
        .chart-title {
            font-size: 18px;
            font-weight: 600;
            color: #a855f7;
            margin-bottom: 20px;
        }
        .footer {
            text-align: center;
            padding-top: 20px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            color: #666;
            font-size: 12px;
        }
        @media print {
            body {
                padding: 0;
            }
            .container {
                box-shadow: none;
                border: none;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎵 UMPA 피치 분석 보고서</h1>
            <p>실시간 피치 측정 및 분석 도구</p>
        </div>

        <div class="info-section">
            <div class="info-row">
                <span class="info-label">파일명</span>
                <span class="info-value">${analysisResult.fileName}</span>
            </div>
            <div class="info-row">
                <span class="info-label">분석 날짜</span>
                <span class="info-value">${new Date(analysisResult.timestamp).toLocaleString('ko-KR')}</span>
            </div>
            <div class="info-row">
                <span class="info-label">파일 길이</span>
                <span class="info-value">${analysisResult.duration.toFixed(2)}초</span>
            </div>
            <div class="info-row">
                <span class="info-label">샘플 레이트</span>
                <span class="info-value">${analysisResult.sampleRate} Hz</span>
            </div>
            <div class="info-row">
                <span class="info-label">채널</span>
                <span class="info-value">${analysisResult.channels}</span>
            </div>
        </div>

        <div class="stats-section">
            <div class="stat-card">
                <div class="stat-label">평균 피치</div>
                <div class="stat-value">${avgPitch} Hz</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">최대 피치</div>
                <div class="stat-value">${maxPitch} Hz</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">최소 피치</div>
                <div class="stat-value">${minPitch} Hz</div>
            </div>
        </div>

        <div class="chart-section">
            <div class="chart-title">피치 분석 그래프</div>
            <canvas id="pitchChart"></canvas>
        </div>

        <div class="footer">
            <p>이 보고서는 UMPA 피치 측정 도구에서 생성되었습니다.</p>
        </div>
    </div>

    <script>
        const ctx = document.getElementById('pitchChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ${JSON.stringify(analysisResult.timeLabels)},
                datasets: [{
                    label: '피치 (Hz)',
                    data: ${JSON.stringify(analysisResult.pitchData)},
                    borderColor: '#a855f7',
                    backgroundColor: 'rgba(168, 85, 247, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 6,
                    pointBackgroundColor: '#a855f7',
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: true,
                        labels: {
                            color: '#a855f7',
                            font: { size: 12 }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#888' },
                        title: { display: true, text: '피치 (Hz)', color: '#a855f7' }
                    },
                    x: {
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#888' }
                    }
                }
            }
        });
    </script>
</body>
</html>`;

  return htmlContent;
};

export const downloadHTMLReport = (analysisResult: AnalysisResult) => {
  const htmlContent = generateHTMLReport(analysisResult);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${analysisResult.fileName.replace(/\.[^/.]+$/, '')}_analysis_${new Date().toISOString().split('T')[0]}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
