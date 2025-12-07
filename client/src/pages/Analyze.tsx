import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Upload as UploadIcon,
  Music,
  ArrowRight,
  Download,
  Loader,
  FileText,
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
import { downloadHTMLReport } from "@/lib/reportGenerator";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface AnalysisResult {
  fileName: string;
  duration: number;
  sampleRate: number;
  channels: number;
  pitchData: number[];
  timeLabels: string[];
  timestamp: string;
}

export default function Analyze() {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const [, navigate] = useLocation();
  const { uploadedFiles, selectedFileForAnalysis, setSelectedFileForAnalysis } = useFiles();
  const inputRef = useRef<HTMLInputElement>(null);

  /* -----------------------------------
        W A V E S U R F E R 초기화
  ------------------------------------ */
  useEffect(() => {
    if (waveformRef.current) {
      wavesurfer.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: "rgba(168, 85, 247, 0.4)",
        progressColor: "#a855f7",
        cursorColor: "#ffffff",
        barWidth: 2,
        barGap: 3,
        height: 120,
        normalize: true,
      });
    }

    return () => wavesurfer.current?.destroy();
  }, []);

  /* -----------------------------------
          파일 선택 시 로드
  ------------------------------------ */
  useEffect(() => {
    if (selectedFileForAnalysis && wavesurfer.current) {
      const url = URL.createObjectURL(selectedFileForAnalysis.file);
      wavesurfer.current.load(url);
      setIsPlaying(false);
      setAnalysisResult(null);
    }
  }, [selectedFileForAnalysis]);

  /* -----------------------------------
          재생 & 일시정지
  ------------------------------------ */
  const togglePlay = () => {
    if (!wavesurfer.current) return;
    wavesurfer.current.playPause();
    setIsPlaying((p) => !p);
  };

  /* -----------------------------------
        ⭐ 되감기 / 빨리감기
        (Wavesurfer v7: setTime())
  ------------------------------------ */
  const skipBackward = () => {
    if (!wavesurfer.current) return;
    const t = wavesurfer.current.getCurrentTime();
    wavesurfer.current.setTime(Math.max(0, t - 3));
  };

  const skipForward = () => {
    if (!wavesurfer.current) return;
    const t = wavesurfer.current.getCurrentTime();
    const d = wavesurfer.current.getDuration();
    wavesurfer.current.setTime(Math.min(d, t + 3));
  };

  /* -----------------------------------
          파일 업로드
  ------------------------------------ */
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;

    const file = e.target.files[0];
    if (!file.type.startsWith("audio/")) return;

    const tempFile = {
      id: `${Date.now()}-${Math.random()}`,
      file,
      name: file.name,
      size: file.size,
      uploadedAt: new Date(),
    };

    setSelectedFileForAnalysis(tempFile);
  };

  const handleDragDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!e.dataTransfer.files[0]) return;

    const file = e.dataTransfer.files[0];
    if (!file.type.startsWith("audio/")) return;

    const tempFile = {
      id: `${Date.now()}-${Math.random()}`,
      file,
      name: file.name,
      size: file.size,
      uploadedAt: new Date(),
    };

    setSelectedFileForAnalysis(tempFile);
  };

  /* -----------------------------------
         ⭐ 피치 분석 (ACF)
  ------------------------------------ */
  const analyzeAudioFile = async () => {
    if (!selectedFileForAnalysis) return;

    setIsAnalyzing(true);

    try {
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();

      const arrayBuffer = await selectedFileForAnalysis.file.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      const duration = audioBuffer.duration;
      const sampleRate = audioBuffer.sampleRate;
      const channels = audioBuffer.numberOfChannels;

      const channelData = audioBuffer.getChannelData(0);
      const hopSize = Math.floor(sampleRate * 0.02); // 20ms
      const numFrames = Math.floor(channelData.length / hopSize);

      const pitchData: number[] = [];
      const timeLabels: string[] = [];

      for (let i = 0; i < numFrames; i++) {
        const start = i * hopSize;
        const frame = channelData.slice(start, start + hopSize);

        const pitch = estimatePitch(frame, sampleRate);
        pitchData.push(pitch);

        timeLabels.push(`${(start / sampleRate).toFixed(1)}s`);
      }

      setAnalysisResult({
        fileName: selectedFileForAnalysis.name,
        duration,
        sampleRate,
        channels,
        pitchData,
        timeLabels,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      alert("파일 분석 중 오류가 발생했습니다.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  /* -----------------------------------
     ACF 기반 피치 추정 함수
  ------------------------------------ */
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

  /* -----------------------------------
           통계 · 다운로드 준비
  ------------------------------------ */

  const chartData = analysisResult
    ? {
        labels: analysisResult.timeLabels,
        datasets: [
          {
            label: "피치 (Hz)",
            data: analysisResult.pitchData,
            borderColor: "#a855f7",
            backgroundColor: "rgba(168, 85, 247, 0.1)",
            tension: 0.2,
            pointRadius: 0,
            borderWidth: 2,
          },
        ],
      }
    : { labels: [], datasets: [] };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: "#ffffff" } },
    },
    scales: {
      x: {
        ticks: { color: "#aaa" },
        grid: { color: "rgba(255,255,255,0.1)" },
      },
      y: {
        ticks: { color: "#aaa" },
        grid: { color: "rgba(255,255,255,0.1)" },
      },
    },
  };

  const formatFileSize = (b: number) => {
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(b) / Math.log(1024));
    return (b / Math.pow(1024, i)).toFixed(2) + " " + sizes[i];
  };

  /* -----------------------------------
                UI 렌더링
  ------------------------------------ */
  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white">파일 분석</h1>
          <p className="text-muted-foreground">오디오 파일의 파형과 피치를 분석합니다.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* -------------------------------
                좌측: 파일 선택 영역
          ------------------------------- */}
          <Card className="glass-panel border-white/10 h-fit">
            <CardHeader>
              <CardTitle className="text-white text-lg">파일 선택</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">

              <div
                className="border-2 border-dashed border-white/10 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDragDrop}
                onClick={() => inputRef.current?.click()}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />

                <UploadIcon className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">파일을 드래그하거나 클릭</p>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground uppercase">업로드된 파일</p>

                  <div className="max-h-[400px] overflow-y-auto space-y-2">
                    {uploadedFiles.map((file) => (
                      <button
                        key={file.id}
                        onClick={() => setSelectedFileForAnalysis(file)}
                        className={cn(
                          "w-full p-3 rounded-lg text-left text-sm border transition",
                          selectedFileForAnalysis?.id === file.id
                            ? "bg-primary/20 border-primary text-white"
                            : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10"
                        )}
                      >
                        <div className="flex items-start gap-2">
                          <Music className="w-4 h-4 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* -------------------------------
                우측: 파형 + 컨트롤 + 분석
          ------------------------------- */}
          <div className="lg:col-span-2 space-y-6">
            {selectedFileForAnalysis ? (
              <>
                <Card className="glass-panel border-primary/30 bg-primary/5">
                  <CardHeader>
                    <CardTitle className="text-lg text-white">
                      {selectedFileForAnalysis.name}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div
                      ref={waveformRef}
                      className="w-full bg-black/20 rounded-lg overflow-hidden"
                    />

                    {/* ⭐ 컨트롤 버튼 */}
                    <div className="flex items-center justify-center gap-6 mt-2">
                      {/* ⏪ 되감기 */}
                      <button
                        onClick={skipBackward}
                        className="p-3 rounded-full bg-[#1a1a2e] hover:bg-[#292949] transition"
                      >
                        <SkipBack className="w-6 h-6 text-purple-400" />
                      </button>

                      {/* ▶ 재생/정지 */}
                      <button
                        onClick={togglePlay}
                        className="p-4 rounded-full bg-purple-500 hover:bg-purple-600 shadow-lg"
                      >
                        {isPlaying ? (
                          <Pause className="w-7 h-7 text-white" />
                        ) : (
                          <Play className="w-7 h-7 text-white ml-1" />
                        )}
                      </button>

                      {/* ⏩ 빨리감기 */}
                      <button
                        onClick={skipForward}
                        className="p-3 rounded-full bg-[#1a1a2e] hover:bg-[#292949] transition"
                      >
                        <SkipForward className="w-6 h-6 text-purple-400" />
                      </button>
                    </div>
                  </CardContent>
                </Card>

                {/* ------------------- 분석 결과 ------------------- */}
                {analysisResult && (
                  <>
                    <Card className="glass-panel border-white/10">
                      <CardHeader>
                        <CardTitle className="text-lg text-white">
                          피치 분석 (Pitch Analysis)
                        </CardTitle>
                      </CardHeader>

                      <CardContent>
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                            <p className="text-xs text-muted-foreground">평균 피치</p>
                            <p className="text-lg font-bold text-primary">
                              {(
                                analysisResult.pitchData.reduce((a, b) => a + b, 0) /
                                analysisResult.pitchData.length
                              ).toFixed(1)}
                              Hz
                            </p>
                          </div>

                          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                            <p className="text-xs text-muted-foreground">최대 피치</p>
                            <p className="text-lg font-bold text-primary">
                              {Math.max(...analysisResult.pitchData).toFixed(1)} Hz
                            </p>
                          </div>

                          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                            <p className="text-xs text-muted-foreground">최소 피치</p>
                            <p className="text-lg font-bold text-primary">
                              {Math.min(...analysisResult.pitchData).toFixed(1)} Hz
                            </p>
                          </div>
                        </div>

                        <div className="h-[400px]">
                          <Line data={chartData} options={chartOptions} />
                        </div>
                      </CardContent>
                    </Card>

                    <div className="flex gap-3 flex-wrap">
                      <Button
                        size="lg"
                        className="flex-1 min-w-[120px] bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                        onClick={() => {
                          const avg =
                            analysisResult.pitchData.reduce((a, b) => a + b, 0) /
                            analysisResult.pitchData.length;
                          const out = {
                            ...analysisResult,
                            averagePitch: avg.toFixed(2),
                          };
                          const blob = new Blob([JSON.stringify(out, null, 2)], {
                            type: "application/json",
                          });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = "analysis.json";
                          a.click();
                          URL.revokeObjectURL(url);
                        }}
                      >
                        <Download className="mr-2 h-5 w-5" />
                        JSON 저장
                      </Button>

                      <Button
                        size="lg"
                        variant="outline"
                        className="flex-1 min-w-[120px] border-white/20 bg-white/5 hover:bg-white/10"
                        onClick={() => {
                          let csv = "time,pitch\n";
                          analysisResult.timeLabels.forEach((t, i) => {
                            csv += `${t},${analysisResult.pitchData[i]}\n`;
                          });
                          const blob = new Blob([csv], {
                            type: "text/csv",
                          });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = "analysis.csv";
                          a.click();
                          URL.revokeObjectURL(url);
                        }}
                      >
                        <Download className="mr-2 h-5 w-5" />
                        CSV 저장
                      </Button>

                      <Button
                        size="lg"
                        variant="outline"
                        className="flex-1 min-w-[120px] border-white/20 bg-white/5 hover:bg-white/10"
                        onClick={() => {
                          analysisResult && downloadHTMLReport(analysisResult);
                        }}
                      >
                        <FileText className="mr-2 h-5 w-5" />
                        보고서 저장
                      </Button>
                    </div>
                  </>
                )}

                {!analysisResult && (
                  <Button
                    onClick={analyzeAudioFile}
                    size="lg"
                    className="w-full bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader className="mr-2 h-5 w-5 animate-spin" />
                        분석 중...
                      </>
                    ) : (
                      "전체 파일 분석"
                    )}
                  </Button>
                )}

                <Button
                  size="lg"
                  variant="outline"
                  className="w-full border-white/20 bg-white/5 hover:bg-white/10"
                  onClick={() => navigate("/compare")}
                >
                  <ArrowRight className="mr-2 h-5 w-5" />
                  비교 분석
                </Button>
              </>
            ) : (
              <Card className="glass-panel border-white/10 flex items-center justify-center min-h-[400px]">
                <CardContent className="text-center space-y-4">
                  <Music className="w-16 h-16 text-muted-foreground mx-auto opacity-50" />
                  <div>
                    <p className="text-lg text-muted-foreground">파일을 선택해주세요</p>
                    <p className="text-sm text-muted-foreground">
                      왼쪽에서 파일을 선택하거나 새로운 파일을 업로드하세요.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
