import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Github, Linkedin, Mail } from "lucide-react";

interface TeamMember {
  name: string;
  role: string;
  description?: string;
  icon: React.ReactNode;
}

export default function Team() {
  const teamMembers: TeamMember[] = [
    {
      name: "허윤서",
      role: "UI/UX Designer",
      description: "사용자 경험과 인터페이스 디자인을 담당합니다.",
      icon: <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white font-bold text-lg">허</div>,
    },
    {
      name: "김형준",
      role: "Backend Engineer",
      description: "서버 아키텍처와 API 개발을 담당합니다.",
      icon: <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg">김</div>,
    },
    {
      name: "이상진",
      role: "Frontend Engineer",
      description: "프론트엔드 개발과 UI 구현을 담당합니다.",
      icon: <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold text-lg">이</div>,
    },
    {
      name: "이찬혁",
      role: "Frontend Engineer",
      description: "프론트엔드 개발과 성능 최적화를 담당합니다.",
      icon: <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold text-lg">이</div>,
    },
  ];

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Users className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold text-white">우리의 팀</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            UMPA는 다양한 분야의 전문가들로 구성된 팩이 함께 만들고 있습니다.
            각 팩원의 열정과 노력으로 최고의 오디오 분석 도구를 제공합니다.
          </p>
        </div>

        {/* Team Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {teamMembers.map((member, index) => (
            <Card key={index} className="glass-panel border-white/10 hover:border-primary/50 transition-all duration-300 group overflow-hidden">
              <CardContent className="p-6 space-y-4">
                {/* Avatar */}
                <div className="flex justify-center group-hover:scale-110 transition-transform duration-300">
                  {member.icon}
                </div>

                {/* Name & Role */}
                <div className="text-center space-y-1">
                  <h3 className="text-lg font-bold text-white">{member.name}</h3>
                  <p className="text-sm font-semibold text-primary drop-shadow-[0_0_8px_rgba(168,85,247,0.3)]">
                    {member.role}
                  </p>
                </div>

                {/* Description */}
                {member.description && (
                  <p className="text-sm text-muted-foreground text-center leading-relaxed">
                    {member.description}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* About Section */}
        <Card className="glass-panel border-white/10">
          <CardHeader>
            <CardTitle className="text-2xl text-white">팀 소개</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Pitch Perfect 팀은 오디오 처리 기술과 웹 개발에 깊은 경험을 가진 전문가들로 구성되어 있습니다.
              우리는 사용자 중심의 설계 철학을 바탕으로 직관적이고 강력한 피치 측정 도구를 만들고 있습니다.
            </p>
            <p>
              각 팀원은 자신의 분야에서 최고의 기술과 창의성을 발휘하여, 음악 교육, 음성 분석, 악기 튜닝 등
              다양한 분야에서 활용할 수 있는 솔루션을 제공하고자 합니다.
            </p>
            <p>
              우리의 목표는 복잡한 오디오 분석을 누구나 쉽게 웹에서 접근할 수 있도록 하는 것입니다.
            </p>
          </CardContent>
        </Card>

        {/* Contact Section */}
        <Card className="glass-panel border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-2xl text-white">연락처</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              UMPA에 대한 문의나 피드백이 있으신가요?
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="mailto:umpa@example.com" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors">
                <Mail className="w-5 h-5" />
                이메일
              </a>
              <a href="https://github.com/Rachel1028/pitch-umpa.git" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors">
                <Github className="w-5 h-5" />
                Github
              </a>
              <a href="/proposal.pdf" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors">
                <Linkedin className="w-5 h-5" />
                Documentation
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
