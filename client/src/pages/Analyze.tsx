import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Pause, SkipBack, SkipForward, Upload as UploadIcon, Music, Trash2, ArrowRight, Download, Loader, FileText } from "lucide-react";
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
import { saveToHistory, getHistory, deleteHistoryItem, AnalysisHistory } from "@/lib/historyManager";

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

  useEffect(() => {
    if (waveformRef.current) {
      wavesurfer.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: 'rgba(168, 85, 247, 0.4)',
        progressColor: '#a855f7',
        cursorColor: '#ffffff',
        barWidth: 2,
        barGap: 3,
        height: 120,
        normalize: true,
      });
    }

    return () => {
      wavesurfer.current?.destroy();
    };
  }, []);

  // Load selected file into wavesurfer
  useEffect(() => {
    if (selectedFileForAnalysis && wavesurfer.current) {
      const url = URL.createObjectURL(selectedFileForAnalysis.file);
      wavesurfer.current.load(url);
      setIsPlaying(false);
      setAnalysisResult(null);
    }
  }, [selectedFileForAnalysis]);

  const togglePlay = () => {
    if (wavesurfer.current) {
      wavesurfer.current.playPause();
      setIsPlaying(!isPlaying);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('audio/')) {
        const tempFile: any = {
          id: `${Date.now()}-${Math.random()}`,
          file,
          name: file.name,
          size: file.size,
          uploadedAt: new Date(),
        };
        setSelectedFileForAnalysis(tempFile);
      }
    }
  };

  const handleDragDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('audio/')) {
        const tempFile: any = {
          id: `${Date.now()}-${Math.random()}`,
          file,
          name: file.name,
          size: file.size,
          uploadedAt: new Date(),
        };
        setSelectedFileForAnalysis(tempFile);
      }
    }
  };

  /**
   * 전체 오디오 파일 분석
   */
  const analyzeAudioFile = async () => {
    if (!selectedFileForAnalysis) return;

    setIsAnalyzing(true);
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const arrayBuffer = await selectedFileForAnalysis.file.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      const duration = audioBuffer.duration;
      const sampleRate = audioBuffer.sampleRate;
      const channels = audioBuffer.numberOfChannels;
      const channelData = audioBuffer.getChannelData(0);

      // 전체 파일을 분석하기 위해 hopSize를 동적으로 조정
      const hopSize = Math.floor(sampleRate * 0.02); // 20ms 홉
      const numFrames = Math.floor(channelData.length / hopSize);

      const pitchData: number[] = [];
      const timeLabels: string[] = [];

      // 전체 파일 분석
      for (let i = 0; i < numFrames; i++) {
        const frameStart = i * hopSize;
        const frameEnd = Math.min(frameStart + hopSize, channelData.length);
        const frame = channelData.slice(frameStart, frameEnd);

        // 피치 추정
        const pitch = estimatePitch(frame, sampleRate);
        pitchData.push(pitch);

        // 시간 레이블
        const timeInSeconds = (i * hopSize) / sampleRate;
        timeLabels.push(`${timeInSeconds.toFixed(1)}s`);
      }

      // 분석 결과 저장
      const result: AnalysisResult = {
        fileName: selectedFileForAnalysis.name,
        duration,
        sampleRate,
        channels,
        pitchData,
        timeLabels,
        timestamp: new Date().toISOString(),
      };

      setAnalysisResult(result);
    } catch (error) {
      console.error("분석 오류:", error);
      alert("파일 분석 중 오류가 발생했습니다.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  /**
   * 간단한 피치 추정 (ACF - Auto-Correlation Function)
   */
  function estimatePitch(frame: Float32Array, sampleRate: number): number {
    const minPitch = 50;
    const maxPitch = 400;
    const minLag = Math.floor(sampleRate / maxPitch);
    const maxLag = Math.floor(sampleRate / minPitch);

    let maxCorr = 0;
    let bestLag = minLag;

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
    return pitch > 50 && pitch < 400 ? pitch : 0;
  }

  /**
   * 분석 결과를 JSON 파일로 다운로드
   */
  const downloadAnalysisResult = () => {
    if (!analysisResult) return;

    const dataToDownload = {
      fileName: analysisResult.fileName,
      duration: analysisResult.duration,
      sampleRate: analysisResult.sampleRate,
      channels: analysisResult.channels,
      pitchData: analysisResult.pitchData,
      timeLabels: analysisResult.timeLabels,
      timestamp: analysisResult.timestamp,
      averagePitch: (analysisResult.pitchData.reduce((a, b) => a + b, 0) / analysisResult.pitchData.length).toFixed(2),
      maxPitch: Math.max(...analysisResult.pitchData).toFixed(2),
      minPitch: Math.min(...analysisResult.pitchData).toFixed(2),
    };

    const jsonString = JSON.stringify(dataToDownload, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${analysisResult.fileName.replace(/\.[^/.]+$/, "")}_analysis_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  /**
   * 분석 결과를 CSV 파일로 다운로드
   */
  const downloadAnalysisResultCSV = () => {
    if (!analysisResult) return;

    let csvContent = "시간,피치(Hz)\n";
    analysisResult.timeLabels.forEach((time, index) => {
      csvContent += `${time},${analysisResult.pitchData[index].toFixed(2)}\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${analysisResult.fileName.replace(/\.[^/.]+$/, "")}_analysis_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  /**
   * 분석 결과를 HTML 보고서로 다운로드
   */
  const downloadAnalysisResultHTML = () => {
    if (!analysisResult) return;
    downloadHTMLReport(analysisResult);
  };

  // 차트 데이터 생성
  const chartData = analysisResult ? {
    labels: analysisResult.timeLabels,
    datasets: [
      {
        label: '피치 (Hz)',
        data: analysisResult.pitchData,
        borderColor: '#a855f7',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        tension: 0.2,
        pointRadius: 0,
        borderWidth: 2,
      },
    ],
  } : {
    labels: [],
    datasets: [],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { color: '#ffffff' }
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        ticks: { color: '#a1a1aa' }
      },
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        ticks: { color: '#a1a1aa' }
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">파일 분석</h1>
            <p className="text-muted-foreground">오디오 파일의 파형과 피치를 분석합니다.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* File Selection Panel */}
          <Card className="glass-panel border-white/10 lg:col-span-1 h-fit">
            <CardHeader>
              <CardTitle className="text-lg text-white">파일 선택</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Upload Area */}
              <div
                className="border-2 border-dashed border-white/10 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={handleDragDrop}
                onClick={() => inputRef.current?.click()}
              >
                <input
                  ref={inputRef}
                  type="file"
                  className="hidden"
                  accept="audio/*"
                  onChange={handleFileUpload}
                />
                <UploadIcon className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">파일을 드래그하거나 클릭</p>
              </div>

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">업로드된 파일</p>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {uploadedFiles.map((file) => (
                      <button
                        key={file.id}
                        onClick={() => setSelectedFileForAnalysis(file)}
                        className={cn(
                          "w-full p-3 rounded-lg text-left text-sm transition-all border",
                          selectedFileForAnalysis?.id === file.id
                            ? "bg-primary/20 border-primary text-white"
                            : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10"
                        )}
                      >
                        <div className="flex items-start gap-2">
                          <Music className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{file.name}</p>
                            <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Analysis Panel */}
          <div className="lg:col-span-2 space-y-6">
            {selectedFileForAnalysis ? (
              <>
                {/* Waveform */}
                <Card className="glass-panel border-primary/30 bg-primary/5">
                  <CardHeader>
                    <CardTitle className="text-lg text-white">{selectedFileForAnalysis.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div ref={waveformRef} className="w-full bg-black/20 rounded-lg overflow-hidden" />
                    <div className="flex items-center justify-center gap-4">
                      <Button size="icon" variant="ghost" className="hover:text-primary"><SkipBack className="w-5 h-5" /></Button>
                      <Button size="icon" className="rounded-full w-12 h-12 bg-primary hover:bg-primary/90 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]" onClick={togglePlay}>
                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
                      </Button>
                      <Button size="icon" variant="ghost" className="hover:text-primary"><SkipForward className="w-5 h-5" /></Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Pitch Analysis Chart */}
                {analysisResult && (
                  <>
                    <Card className="glass-panel border-white/10" id="pdf-content">
                      <CardHeader>
                        <CardTitle className="text-lg text-white">피치 분석 (Pitch Analysis)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* 분석 통계 */}
                          <div className="grid grid-cols-3 gap-4">
                            <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                              <p className="text-xs text-muted-foreground">평균 피치</p>
                              <p className="text-lg font-bold text-primary">
                                {(analysisResult.pitchData.reduce((a, b) => a + b, 0) / analysisResult.pitchData.length).toFixed(1)} Hz
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

                          {/* 그래프 */}
                          <div className="h-[400px] w-full">
                            <Line options={chartOptions} data={chartData} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Download Buttons */}
                    <div className="flex gap-3 flex-wrap">
                      <Button 
                        size="lg" 
                        className="bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] border-0 flex-1 min-w-[100px]"
                        onClick={downloadAnalysisResult}
                      >
                        <Download className="mr-2 h-5 w-5" />
                        JSON 저장
                      </Button>
                      <Button 
                        size="lg" 
                        variant="outline"
                        className="border-white/20 bg-white/5 hover:bg-white/10 hover:text-white backdrop-blur-sm flex-1 min-w-[100px]"
                        onClick={downloadAnalysisResultCSV}
                      >
                        <Download className="mr-2 h-5 w-5" />
                        CSV 저장
                      </Button>
                      <Button 
                        size="lg" 
                        variant="outline"
                        className="border-white/20 bg-white/5 hover:bg-white/10 hover:text-white backdrop-blur-sm flex-1 min-w-[100px]"
                        onClick={downloadAnalysisResultHTML}
                      >
                        <FileText className="mr-2 h-5 w-5" />
                        보고서 저장
                      </Button>
                    </div>
                  </>
                )}

                {/* Analyze Button */}
                {!analysisResult && (
                  <Button 
                    size="lg" 
                    className="w-full bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] border-0"
                    onClick={analyzeAudioFile}
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

                {/* Compare Button */}
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full border-white/20 bg-white/5 hover:bg-white/10 hover:text-white backdrop-blur-sm"
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
                    <p className="text-lg font-semibold text-muted-foreground">파일을 선택해주세요</p>
                    <p className="text-sm text-muted-foreground">왼쪽에서 파일을 선택하거나 새로운 파일을 업로드하세요.</p>
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
