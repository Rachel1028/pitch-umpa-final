import { useEffect, useRef, useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Pause, SkipBack, SkipForward, Music, Upload as UploadIcon, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";
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

export default function Compare() {
  const waveformRef1 = useRef<HTMLDivElement>(null);
  const waveformRef2 = useRef<HTMLDivElement>(null);
  const wavesurfer1 = useRef<WaveSurfer | null>(null);
  const wavesurfer2 = useRef<WaveSurfer | null>(null);
  const [isPlaying1, setIsPlaying1] = useState(false);
  const [isPlaying2, setIsPlaying2] = useState(false);
  const [, navigate] = useLocation();
  const { uploadedFiles } = useFiles();
  const [selectedFile1, setSelectedFile1] = useState<any>(null);
  const [selectedFile2, setSelectedFile2] = useState<any>(null);
  const inputRef1 = useRef<HTMLInputElement>(null);
  const inputRef2 = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (waveformRef1.current) {
      wavesurfer1.current = WaveSurfer.create({
        container: waveformRef1.current,
        waveColor: 'rgba(168, 85, 247, 0.4)',
        progressColor: '#a855f7',
        cursorColor: '#ffffff',
        barWidth: 2,
        barGap: 3,
        height: 100,
        normalize: true,
      });
    }

    if (waveformRef2.current) {
      wavesurfer2.current = WaveSurfer.create({
        container: waveformRef2.current,
        waveColor: 'rgba(56, 189, 248, 0.4)',
        progressColor: '#38bdf8',
        cursorColor: '#ffffff',
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

  // Load selected files
  useEffect(() => {
    if (selectedFile1 && wavesurfer1.current) {
      const url = URL.createObjectURL(selectedFile1.file);
      wavesurfer1.current.load(url);
      setIsPlaying1(false);
    }
  }, [selectedFile1]);

  useEffect(() => {
    if (selectedFile2 && wavesurfer2.current) {
      const url = URL.createObjectURL(selectedFile2.file);
      wavesurfer2.current.load(url);
      setIsPlaying2(false);
    }
  }, [selectedFile2]);

  const togglePlay1 = () => {
    if (wavesurfer1.current) {
      wavesurfer1.current.playPause();
      setIsPlaying1(!isPlaying1);
    }
  };

  const togglePlay2 = () => {
    if (wavesurfer2.current) {
      wavesurfer2.current.playPause();
      setIsPlaying2(!isPlaying2);
    }
  };

  const handleFileUpload1 = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('audio/')) {
        setSelectedFile1({
          id: `${Date.now()}-${Math.random()}`,
          file,
          name: file.name,
          size: file.size,
        });
      }
    }
  };

  const handleFileUpload2 = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('audio/')) {
        setSelectedFile2({
          id: `${Date.now()}-${Math.random()}`,
          file,
          name: file.name,
          size: file.size,
        });
      }
    }
  };

  const handleDragDrop1 = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer?.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('audio/')) {
        setSelectedFile1({
          id: `${Date.now()}-${Math.random()}`,
          file,
          name: file.name,
          size: file.size,
        });
      }
    }
  };

  const handleDragDrop2 = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer?.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('audio/')) {
        setSelectedFile2({
          id: `${Date.now()}-${Math.random()}`,
          file,
          name: file.name,
          size: file.size,
        });
      }
    }
  };

  // Mock Data for Pitch Chart
  const chartData = {
    labels: ['0s', '1s', '2s', '3s', '4s', '5s', '6s'],
    datasets: [
      {
        label: '파일 1 피치 (Hz)',
        data: [120, 125, 130, 128, 135, 140, 138],
        borderColor: '#a855f7',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        tension: 0.4,
      },
      {
        label: '파일 2 피치 (Hz)',
        data: [115, 120, 125, 122, 130, 135, 132],
        borderColor: '#38bdf8',
        backgroundColor: 'rgba(56, 189, 248, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { color: '#ffffff' }
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
            <h1 className="text-3xl font-bold text-white">비교 분석</h1>
            <p className="text-muted-foreground">두 오디오 파일의 파형과 피치를 비교 분석합니다.</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]">
            분석 시작
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* File 1 */}
          <Card className="glass-panel border-primary/30 bg-primary/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium text-primary">Audio Track 01</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedFile1 ? (
                <>
                  <div className="p-3 rounded-lg bg-black/20 border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Music className="w-4 h-4 text-primary" />
                      <p className="text-sm font-medium text-white truncate">{selectedFile1.name}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile1.size)}</p>
                  </div>
                  <div ref={waveformRef1} className="w-full bg-black/20 rounded-lg overflow-hidden" />
                  <div className="flex items-center justify-center gap-4">
                    <Button size="icon" variant="ghost" className="hover:text-primary"><SkipBack className="w-5 h-5" /></Button>
                    <Button size="icon" className="rounded-full w-12 h-12 bg-primary hover:bg-primary/90 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]" onClick={togglePlay1}>
                      {isPlaying1 ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
                    </Button>
                    <Button size="icon" variant="ghost" className="hover:text-primary"><SkipForward className="w-5 h-5" /></Button>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full border-white/10 bg-white/5 hover:bg-white/10 text-white"
                    onClick={() => inputRef1.current?.click()}
                  >
                    <UploadIcon className="w-4 h-4 mr-2" />
                    파일 변경
                  </Button>
                </>
              ) : (
                <div
                  className="border-2 border-dashed border-primary/30 rounded-lg p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={handleDragDrop1}
                  onClick={() => inputRef1.current?.click()}
                >
                  <input
                    ref={inputRef1}
                    type="file"
                    className="hidden"
                    accept="audio/*"
                    onChange={handleFileUpload1}
                  />
                  <UploadIcon className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">파일을 드래그하거나 클릭</p>
                </div>
              )}

              {/* File List */}
              {uploadedFiles.length > 0 && !selectedFile1 && (
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">업로드된 파일</p>
                  {uploadedFiles.map((file) => (
                    <button
                      key={file.id}
                      onClick={() => setSelectedFile1(file)}
                      className="w-full p-2 rounded-lg text-left text-sm bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                    >
                      <p className="font-medium text-white truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* File 2 */}
          <Card className="glass-panel border-sky-500/30 bg-sky-500/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium text-sky-400">Audio Track 02</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedFile2 ? (
                <>
                  <div className="p-3 rounded-lg bg-black/20 border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Music className="w-4 h-4 text-sky-400" />
                      <p className="text-sm font-medium text-white truncate">{selectedFile2.name}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile2.size)}</p>
                  </div>
                  <div ref={waveformRef2} className="w-full bg-black/20 rounded-lg overflow-hidden" />
                  <div className="flex items-center justify-center gap-4">
                    <Button size="icon" variant="ghost" className="hover:text-sky-400"><SkipBack className="w-5 h-5" /></Button>
                    <Button size="icon" className="rounded-full w-12 h-12 bg-sky-500 hover:bg-sky-600 text-white shadow-[0_0_15px_rgba(56,189,248,0.4)]" onClick={togglePlay2}>
                      {isPlaying2 ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
                    </Button>
                    <Button size="icon" variant="ghost" className="hover:text-sky-400"><SkipForward className="w-5 h-5" /></Button>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full border-white/10 bg-white/5 hover:bg-white/10 text-white"
                    onClick={() => inputRef2.current?.click()}
                  >
                    <UploadIcon className="w-4 h-4 mr-2" />
                    파일 변경
                  </Button>
                </>
              ) : (
                <div
                  className="border-2 border-dashed border-sky-500/30 rounded-lg p-8 text-center cursor-pointer hover:border-sky-500 hover:bg-sky-500/5 transition-all"
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={handleDragDrop2}
                  onClick={() => inputRef2.current?.click()}
                >
                  <input
                    ref={inputRef2}
                    type="file"
                    className="hidden"
                    accept="audio/*"
                    onChange={handleFileUpload2}
                  />
                  <UploadIcon className="w-8 h-8 text-sky-400 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">파일을 드래그하거나 클릭</p>
                </div>
              )}

              {/* File List */}
              {uploadedFiles.length > 0 && !selectedFile2 && (
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">업로드된 파일</p>
                  {uploadedFiles.map((file) => (
                    <button
                      key={file.id}
                      onClick={() => setSelectedFile2(file)}
                      className="w-full p-2 rounded-lg text-left text-sm bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                    >
                      <p className="font-medium text-white truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Pitch Comparison Chart */}
        {selectedFile1 && selectedFile2 && (
          <Card className="glass-panel border-white/10">
            <CardHeader>
              <CardTitle className="text-xl text-white">피치 비교 그래프 (Pitch Comparison)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <Line options={chartOptions} data={chartData} />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
