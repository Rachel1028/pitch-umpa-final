import { useEffect, useRef, useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, Square, RotateCcw, AlertCircle } from "lucide-react";
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Realtime() {
  const [isRecording, setIsRecording] = useState(false);
  const [micPermission, setMicPermission] = useState<boolean | null>(null);
  const [pitchData, setPitchData] = useState<number[]>([]);
  const [currentPitch, setCurrentPitch] = useState<number | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const requestMicPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      setMicPermission(true);
      
      // Initialize Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;
      
      const analyser = audioContext.createAnalyser();
      analyserRef.current = analyser;
      
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      
      analyser.fftSize = 2048;
    } catch (error) {
      console.error("Microphone permission denied:", error);
      setMicPermission(false);
    }
  };

  const startRecording = async () => {
    if (!mediaStreamRef.current) {
      await requestMicPermission();
    }
    
    if (mediaStreamRef.current) {
      setIsRecording(true);
      setPitchData([]);
      
      // Simulate pitch detection (in real implementation, use pitchfinder algorithm)
      const interval = setInterval(() => {
        const pitch = Math.random() * 200 + 100; // Random pitch between 100-300 Hz
        setCurrentPitch(Math.round(pitch * 10) / 10);
        setPitchData(prev => [...prev.slice(-59), pitch]); // Keep last 60 data points
      }, 100);
      
      return () => clearInterval(interval);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
  };

  const resetData = () => {
    setPitchData([]);
    setCurrentPitch(null);
  };

  const chartData = {
    labels: Array.from({ length: pitchData.length }, (_, i) => `${i * 0.1}s`),
    datasets: [
      {
        label: '실시간 피치 (Hz)',
        data: pitchData,
        borderColor: '#a855f7',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { color: '#ffffff' }
      },
    },
    scales: {
      y: {
        min: 50,
        max: 400,
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        ticks: { color: '#a1a1aa' }
      },
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        ticks: { color: '#a1a1aa' }
      }
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white">실시간 측정</h1>
          <p className="text-muted-foreground">마이크를 통해 실시간으로 피치를 측정합니다.</p>
        </div>

        {/* Permission Alert */}
        {micPermission === false && (
          <Card className="glass-panel border-red-500/30 bg-red-500/5">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <div>
                <p className="text-white font-medium">마이크 권한이 필요합니다</p>
                <p className="text-sm text-muted-foreground">브라우저 설정에서 마이크 접근을 허용해주세요.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Current Pitch Display */}
        <Card className="glass-panel border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg text-white">현재 피치</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl font-bold text-primary drop-shadow-[0_0_20px_rgba(168,85,247,0.5)]">
                  {currentPitch ? `${currentPitch} Hz` : '—'}
                </div>
                <p className="text-muted-foreground mt-2">
                  {isRecording ? '측정 중...' : '측정 대기 중'}
                </p>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex gap-4">
              {!isRecording ? (
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] border-0 flex-1"
                  onClick={startRecording}
                >
                  <Mic className="mr-2 h-5 w-5" />
                  측정 시작
                </Button>
              ) : (
                <Button 
                  size="lg" 
                  className="bg-red-600 hover:bg-red-700 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)] border-0 flex-1"
                  onClick={stopRecording}
                >
                  <Square className="mr-2 h-5 w-5" />
                  측정 중지
                </Button>
              )}
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white/20 bg-white/5 hover:bg-white/10 hover:text-white backdrop-blur-sm"
                onClick={resetData}
              >
                <RotateCcw className="mr-2 h-5 w-5" />
                초기화
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Real-time Chart */}
        <Card className="glass-panel border-white/10">
          <CardHeader>
            <CardTitle className="text-lg text-white">피치 변화 그래프</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full">
              {pitchData.length > 0 ? (
                <Line options={chartOptions} data={chartData} />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p>측정을 시작하면 실시간 그래프가 표시됩니다.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="glass-panel border-white/10">
          <CardHeader>
            <CardTitle className="text-lg text-white">사용 팁</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>• 조용한 환경에서 측정하면 더 정확한 결과를 얻을 수 있습니다.</p>
            <p>• 마이크를 입에서 15-20cm 정도 떨어진 거리에 유지하세요.</p>
            <p>• 일정한 음량으로 발성하면 안정적인 피치 측정이 가능합니다.</p>
            <p>• 음악 교육, 발음 교정, 악기 튜닝 등 다양한 용도로 활용할 수 있습니다.</p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
