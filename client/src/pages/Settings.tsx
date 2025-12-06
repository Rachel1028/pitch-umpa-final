import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mic, Volume2, Monitor, Bell } from "lucide-react";

export default function Settings() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white">설정</h1>
          <p className="text-muted-foreground">오디오 입력 및 분석 환경을 설정합니다.</p>
        </div>

        {/* Audio Input Settings */}
        <Card className="glass-panel border-white/10">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mic className="w-5 h-5 text-primary" />
              <CardTitle className="text-xl text-white">오디오 입력 설정</CardTitle>
            </div>
            <CardDescription>마이크 및 입력 장치를 선택하고 테스트합니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="text-white">입력 장치 (Microphone)</Label>
              <Select defaultValue="default">
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="마이크 선택" />
                </SelectTrigger>
                <SelectContent className="bg-card border-white/10 text-white">
                  <SelectItem value="default">기본 마이크 (Default)</SelectItem>
                  <SelectItem value="mic1">MacBook Pro Microphone</SelectItem>
                  <SelectItem value="mic2">External USB Microphone</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-white">노이즈 캔슬링</Label>
                <p className="text-sm text-muted-foreground">배경 소음을 줄여 분석 정확도를 높입니다.</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-white">자동 게인 제어 (AGC)</Label>
                <p className="text-sm text-muted-foreground">입력 볼륨을 자동으로 조절합니다.</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Analysis Settings */}
        <Card className="glass-panel border-white/10">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Monitor className="w-5 h-5 text-cyan-400" />
              <CardTitle className="text-xl text-white">분석 설정</CardTitle>
            </div>
            <CardDescription>피치 검출 알고리즘 및 시각화 옵션을 조정합니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="text-white">피치 검출 알고리즘</Label>
              <Select defaultValue="yin">
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="알고리즘 선택" />
                </SelectTrigger>
                <SelectContent className="bg-card border-white/10 text-white">
                  <SelectItem value="yin">YIN (권장)</SelectItem>
                  <SelectItem value="amdf">AMDF</SelectItem>
                  <SelectItem value="macleod">Macleod</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground pt-1">
                * YIN 알고리즘은 음성 및 음악 분석에 가장 높은 정확도를 제공합니다.
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-white">실시간 그래프 스무딩</Label>
                <p className="text-sm text-muted-foreground">그래프 움직임을 부드럽게 처리합니다.</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="glass-panel border-white/10">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-pink-400" />
              <CardTitle className="text-xl text-white">알림 설정</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-white">분석 완료 알림</Label>
                <p className="text-sm text-muted-foreground">대용량 파일 분석이 완료되면 알림을 받습니다.</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button variant="outline" className="border-white/10 hover:bg-white/5 text-white">초기화</Button>
          <Button className="bg-primary hover:bg-primary/90 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]">설정 저장</Button>
        </div>
      </div>
    </Layout>
  );
}
