import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, Upload, Activity, ArrowRight, PlayCircle } from "lucide-react";
import { Link } from "wouter";
import Layout from "@/components/Layout";

export default function Home() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center py-20 md:py-32 space-y-8 relative overflow-hidden">
        {/* Background Glow Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] -z-10 animate-pulse duration-[5000ms]" />
        
        <div className="space-y-4 max-w-3xl mx-auto px-4">
          <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary backdrop-blur-md mb-4">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-ping" />
            실시간 피치 분석 v1.0
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 pb-2">
            소리의 파동을 <br />
            <span className="text-primary drop-shadow-[0_0_20px_rgba(168,85,247,0.5)]">UMPA로 경험하세요</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            당신의 목소리와 음악을 실시간으로 분석하고 시각화합니다. <br className="hidden md:block" />
            전문적인 피치 측정 도구를 누구나 쉽게 웹에서 만나보세요.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center pt-4">
          <Link href="/upload">
            <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] border-0">
              <Upload className="mr-2 h-5 w-5" />
              파일 업로드
            </Button>
          </Link>
          <Link href="/compare">
            <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/20 bg-white/5 hover:bg-white/10 hover:text-white backdrop-blur-sm">
              <Activity className="mr-2 h-5 w-5" />
              실시간 측정
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 py-12">
        <Card className="glass-panel border-white/5 bg-white/5 hover:bg-white/10 transition-all duration-300 group">
          <CardHeader>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 border border-white/10">
              <Upload className="w-6 h-6 text-cyan-400" />
            </div>
            <CardTitle className="text-xl text-white">파일 관리 및 분석</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-gray-400 text-base">
              WAV, MP3 등 다양한 오디오 파일을 업로드하고 파형을 정밀하게 분석하세요. 클라우드 저장소로 언제든 다시 확인할 수 있습니다.
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="glass-panel border-white/5 bg-white/5 hover:bg-white/10 transition-all duration-300 group">
          <CardHeader>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 border border-white/10">
              <Activity className="w-6 h-6 text-pink-400" />
            </div>
            <CardTitle className="text-xl text-white">정밀 피치 측정</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-gray-400 text-base">
              Web Audio API 기반의 고성능 알고리즘으로 Hz 단위의 정확한 피치를 검출하고 시각화된 그래프로 확인하세요.
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="glass-panel border-white/5 bg-white/5 hover:bg-white/10 transition-all duration-300 group">
          <CardHeader>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 border border-white/10">
              <Mic className="w-6 h-6 text-emerald-400" />
            </div>
            <CardTitle className="text-xl text-white">실시간 마이크 입력</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-gray-400 text-base">
              마이크를 통해 실시간으로 입력되는 소리를 즉시 분석합니다. 발음 교정이나 악기 튜닝에 활용해보세요.
            </CardDescription>
          </CardContent>
        </Card>
      </section>

      {/* Call to Action */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-purple-500/5 to-blue-500/10 rounded-3xl blur-3xl -z-10" />
        <div className="glass-panel rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 border border-white/10">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-white">지금 바로 시작하세요</h2>
            <p className="text-muted-foreground text-lg max-w-xl">
              복잡한 설치 없이 웹 브라우저에서 바로 전문적인 오디오 분석을 경험할 수 있습니다.
            </p>
          </div>
          <Link href="/upload">
            <Button size="lg" className="bg-white text-black hover:bg-gray-200 border-0 shadow-lg shadow-white/10">
              분석 시작하기 <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
}
