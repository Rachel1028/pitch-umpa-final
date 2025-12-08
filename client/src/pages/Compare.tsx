import { useEffect, useRef, useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Music,
  Upload as UploadIcon,
} from "lucide-react";
import WaveSurfer from "wavesurfer.js";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useFiles } from "@/contexts/FileContext";
import { cn } from "@/lib/utils";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

/* ===============================
      Pitch Estimation (ACF)
=============================== */
function estimatePitch(frame: Float32Array, sampleRate: number): number {
  const minPitch = 50;
  const maxPitch = 400;
  const minLag = Math.floor(sampleRate / maxPitch);
  const maxLag = Math.floor(sampleRate / minPitch);

  let bestLag = minLag;
  let maxCorr = 0;

  for (let lag = minLag; lag < maxLag; lag++) {
    let corr = 0;
    for (let i = 0; i < frame.length - lag; i++) {
      corr += frame[i] * frame[i + lag];
    }
    if (corr > maxCorr) {
      maxCorr = corr;
      bestLag = lag;
    }
  }

  const pitch = sampleRate / bestLag;
  return pitch >= 50 && pitch <= 400 ? pitch : 0;
}

/* ===============================
      Analyze Audio File
=============================== */
async function analyzeAudio(file: File) {
  const audioContext = new (window.AudioContext ||
    (window as any).webkitAudioContext)();
  const arrayBuffer = await file.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

  const duration = audioBuffer.duration;
  const sampleRate = audioBuffer.sampleRate;
  const channelData = audioBuffer.getChannelData(0);

  const hopSize = Math.floor(sampleRate * 0.02); // 20ms hop
  const numFrames = Math.floor(channelData.length / hopSize);

  const pitchData: number[] = [];
  const timeLabels: string[] = [];

  for (let i = 0; i < numFrames; i++) {
    const start = i * hopSize;
    const end = Math.min(start + hopSize, channelData.length);
    const frame = channelData.slice(start, end);

    const pitch = estimatePitch(frame, sampleRate);
    pitchData.push(pitch);

    timeLabels.push(`${(start / sampleRate).toFixed(1)}s`);
  }

  return { pitchData, timeLabels, duration };
}

/* ===============================
      HTML Export
=============================== */
function downloadComparisonHTML(result1: any, result2: any) {
  const html = `
    <html>
    <head>
      <meta charset="UTF-8" />
      <title>Pitch Comparison Report</title>
      <style>
        body { font-family: Arial; padding: 20px; }
        h1 { color: #6b21a8; }
        h2 { margin-top: 25px; }
        pre { background: #f5f5f5; padding: 10px; border-radius: 6px; }
      </style>
    </head>
    <body>
      <h1>Pitch Comparison Report</h1>

      <h2>File 1: ${result1.fileName}</h2>
      <pre>${JSON.stringify(result1, null, 2)}</pre>

      <h2>File 2: ${result2.fileName}</h2>
      <pre>${JSON.stringify(result2, null, 2)}</pre>
    </body>
    </html>
  `;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "pitch_comparison_report.html";
  a.click();
  URL.revokeObjectURL(url);
}

export default function Compare() {
  const waveformRef1 = useRef<HTMLDivElement>(null);
  const waveformRef2 = useRef<HTMLDivElement>(null);

  const wavesurfer1 = useRef<WaveSurfer | null>(null);
  const wavesurfer2 = useRef<WaveSurfer | null>(null);

  const [isPlaying1, setIsPlaying1] = useState(false);
  const [isPlaying2, setIsPlaying2] = useState(false);

  const { uploadedFiles } = useFiles();

  const [selectedFile1, setSelectedFile1] = useState<any>(null);
  const [selectedFile2, setSelectedFile2] = useState<any>(null);

  const [analysis1, setAnalysis1] = useState<any>(null);
  const [analysis2, setAnalysis2] = useState<any>(null);

  const inputRef1 = useRef<HTMLInputElement>(null);
  const inputRef2 = useRef<HTMLInputElement>(null);

  /* --------------------------------------
        Wavesurfer Init
  -------------------------------------- */
  useEffect(() => {
    if (waveformRef1.current) {
      wavesurfer1.current = WaveSurfer.create({
        container: waveformRef1.current,
        waveColor: "rgba(168, 85, 247, 0.4)",
        progressColor: "#a855f7",
        cursorColor: "#ffffff",
        barWidth: 2,
        barGap: 3,
        height: 100,
        normalize: true,
      });
    }

    if (waveformRef2.current) {
      wavesurfer2.current = WaveSurfer.create({
        container: waveformRef2.current,
        waveColor: "rgba(56, 189, 248, 0.4)",
        progressColor: "#38bdf8",
        cursorColor: "#ffffff",
        barWidth: 2,
        barGap: 3,
        height: 100,
        normalize: true,
      });
    }

    return () => {
      wavesurfer1.current?.destroy();
      wavesurfer2.current?.destroy();
    };
  }, []);

  /* --------------------------------------
        Load audio into wavesurfer
  -------------------------------------- */
  useEffect(() => {
    if (selectedFile1 && wavesurfer1.current) {
      wavesurfer1.current.load(URL.createObjectURL(selectedFile1.file));
      setIsPlaying1(false);
    }
  }, [selectedFile1]);

  useEffect(() => {
    if (selectedFile2 && wavesurfer2.current) {
      wavesurfer2.current.load(URL.createObjectURL(selectedFile2.file));
      setIsPlaying2(false);
    }
  }, [selectedFile2]);

  /* --------------------------------------
        Playback Controls
  -------------------------------------- */
  const togglePlay1 = () => {
    wavesurfer1.current?.playPause();
    setIsPlaying1((p) => !p);
  };

  const togglePlay2 = () => {
    wavesurfer2.current?.playPause();
    setIsPlaying2((p) => !p);
  };

  const skipBack1 = () => {
    if (!wavesurfer1.current) return;
    const t = wavesurfer1.current.getCurrentTime();
    wavesurfer1.current.setTime(Math.max(0, t - 3));
  };

  const skipForward1 = () => {
    if (!wavesurfer1.current) return;
    const t = wavesurfer1.current.getCurrentTime();
    const d = wavesurfer1.current.getDuration();
    wavesurfer1.current.setTime(Math.min(d, t + 3));
  };

  const skipBack2 = () => {
    if (!wavesurfer2.current) return;
    const t = wavesurfer2.current.getCurrentTime();
    wavesurfer2.current.setTime(Math.max(0, t - 3));
  };

  const skipForward2 = () => {
    if (!wavesurfer2.current) return;
    const t = wavesurfer2.current.getCurrentTime();
    const d = wavesurfer2.current.getDuration();
    wavesurfer2.current.setTime(Math.min(d, t + 3));
  };

  /* --------------------------------------
        FILE UPLOAD HANDLERS
  -------------------------------------- */
  const handleFileUpload1 = (e: any) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    if (!file.type.startsWith("audio")) return;

    setSelectedFile1({
      id: Math.random(),
      file,
      name: file.name,
      size: file.size,
    });
  };

  const handleFileUpload2 = (e: any) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    if (!file.type.startsWith("audio")) return;

    setSelectedFile2({
      id: Math.random(),
      file,
      name: file.name,
      size: file.size,
    });
  };

  /* --------------------------------------
          Run Comparison (Analysis)
  -------------------------------------- */
  const runComparisonAnalysis = async () => {
    if (!selectedFile1 || !selectedFile2) {
      alert("두 파일을 모두 선택해주세요.");
      return;
    }

    const r1 = await analyzeAudio(selectedFile1.file);
    const r2 = await analyzeAudio(selectedFile2.file);

    setAnalysis1({ ...r1, fileName: selectedFile1.name });
    setAnalysis2({ ...r2, fileName: selectedFile2.name });
  };

  /* --------------------------------------
          GRAPH DATA (Dynamic Length)
  -------------------------------------- */
  const chartData =
    analysis1 && analysis2
      ? {
          labels:
            analysis1.timeLabels.length > analysis2.timeLabels.length
              ? analysis1.timeLabels
              : analysis2.timeLabels,

          datasets: [
            {
              label: "파일 1 피치 (Hz)",
              data: analysis1.pitchData,
              borderColor: "#a855f7",
              backgroundColor: "rgba(168, 85, 247, 0.1)",
              tension: 0.4,
            },
            {
              label: "파일 2 피치 (Hz)",
              data: analysis2.pitchData,
              borderColor: "#38bdf8",
              backgroundColor: "rgba(56, 189, 248, 0.1)",
              tension: 0.4,
            },
          ],
        }
      : null;

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { labels: { color: "#fff" } },
    },
    scales: {
      x: { ticks: { color: "#aaa" }, grid: { color: "rgba(255,255,255,0.1)" } },
      y: { ticks: { color: "#aaa" }, grid: { color: "rgba(255,255,255,0.1)" } },
    },
  };

  /* --------------------------------------
                UI
  -------------------------------------- */

  const formatFileSize = (bytes: number) =>
    (bytes / 1024).toFixed(1) + " KB";

  return (
    <Layout>
      <div className="space-y-8">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">비교 분석</h1>
            <p className="text-muted-foreground">두 오디오 파일의 파형과 피치를 비교 분석합니다.</p>
          </div>

          <Button
            className="bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]"
            onClick={runComparisonAnalysis}
          >
            분석 시작
          </Button>
        </div>

        {/* TWO TRACK PANELS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* TRACK 1 */}
          <Card className="glass-panel border-primary/30 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-primary text-lg">Audio Track 01</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedFile1 ? (
                <>
                  <div className="p-3 bg-black/20 border border-white/10 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Music className="w-4 h-4 text-primary" />
                      <p className="text-white text-sm truncate">{selectedFile1.name}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile1.size)}</p>
                  </div>

                  <div ref={waveformRef1} className="w-full h-[100px] bg-black/20 rounded-lg" />

                  <div className="flex items-center justify-center gap-4">
                    <button onClick={skipBack1} className="hover:text-primary text-white/70">
                      <SkipBack className="w-5 h-5" />
                    </button>

                    <button
                      onClick={togglePlay1}
                      className="w-12 h-12 rounded-full bg-primary hover:bg-primary/90 flex items-center justify-center text-white shadow"
                    >
                      {isPlaying1 ? <Pause /> : <Play className="ml-1" />}
                    </button>

                    <button onClick={skipForward1} className="hover:text-primary text-white/70">
                      <SkipForward className="w-5 h-5" />
                    </button>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full border-white/10 bg-white/5 hover:bg-white/10"
                    onClick={() => inputRef1.current?.click()}
                  >
                    <UploadIcon className="w-4 h-4 mr-2" />
                    파일 변경
                  </Button>

                  <input
                    ref={inputRef1}
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={handleFileUpload1}
                  />
                </>
              ) : (
                <div
                  className="border-2 border-dashed border-primary/30 p-8 rounded-lg text-center cursor-pointer"
                  onClick={() => inputRef1.current?.click()}
                >
                  <UploadIcon className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="text-muted-foreground">파일을 드래그하거나 클릭</p>
                  <input
                    ref={inputRef1}
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={handleFileUpload1}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* TRACK 2 */}
          <Card className="glass-panel border-sky-500/30 bg-sky-500/5">
            <CardHeader>
              <CardTitle className="text-sky-400 text-lg">Audio Track 02</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              {selectedFile2 ? (
                <>
                  <div className="p-3 bg-black/20 border border-white/10 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Music className="w-4 h-4 text-sky-400" />
                      <p className="text-white text-sm truncate">{selectedFile2.name}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile2.size)}</p>
                  </div>

                  <div ref={waveformRef2} className="w-full h-[100px] bg-black/20 rounded-lg" />

                  <div className="flex items-center justify-center gap-4">
                    <button onClick={skipBack2} className="hover:text-sky-400 text-white/70">
                      <SkipBack className="w-5 h-5" />
                    </button>

                    <button
                      onClick={togglePlay2}
                      className="w-12 h-12 rounded-full bg-sky-500 hover:bg-sky-600 flex items-center justify-center text-white shadow"
                    >
                      {isPlaying2 ? <Pause /> : <Play className="ml-1" />}
                    </button>

                    <button onClick={skipForward2} className="hover:text-sky-400 text-white/70">
                      <SkipForward className="w-5 h-5" />
                    </button>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full border-white/10 bg-white/5 hover:bg-white/10"
                    onClick={() => inputRef2.current?.click()}
                  >
                    <UploadIcon className="w-4 h-4 mr-2" />
                    파일 변경
                  </Button>

                  <input
                    ref={inputRef2}
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={handleFileUpload2}
                  />
                </>
              ) : (
                <div
                  className="border-2 border-dashed border-sky-500/30 p-8 rounded-lg text-center cursor-pointer"
                  onClick={() => inputRef2.current?.click()}
                >
                  <UploadIcon className="w-8 h-8 text-sky-400 mx-auto mb-2" />
                  <p className="text-muted-foreground">파일을 드래그하거나 클릭</p>
                  <input
                    ref={inputRef2}
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={handleFileUpload2}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* PITCH COMPARISON GRAPH */}
        {analysis1 && analysis2 && (
          <Card className="glass-panel border-white/10">
            <CardHeader>
              <CardTitle className="text-xl text-white">
                피치 비교 그래프 (Pitch Comparison)
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="h-[400px] w-full">
                <Line options={chartOptions} data={chartData!} />
              </div>

              <Button
                size="lg"
                className="mt-6 bg-primary hover:bg-primary/90 text-white"
                onClick={() => downloadComparisonHTML(analysis1, analysis2)}
              >
                비교 결과 HTML 저장
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
