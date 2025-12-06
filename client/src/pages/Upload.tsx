import { useState, useRef } from "react";
import { useLocation } from "wouter";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Upload as UploadIcon, FileAudio, X, Music, Play, Trash2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFiles } from "@/contexts/FileContext";

export default function Upload() {
  const [dragActive, setDragActive] = useState(false);
  const [, navigate] = useLocation();
  const { uploadedFiles, addFile, removeFile } = useFiles();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (fileList: FileList) => {
    const newFiles = Array.from(fileList).filter(file => file.type.startsWith('audio/'));
    newFiles.forEach(file => addFile(file));
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
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white">파일 업로드</h1>
          <p className="text-muted-foreground">분석할 오디오 파일을 업로드하고 관리하세요.</p>
        </div>

        {/* Upload Area */}
        <Card className={cn(
          "glass-panel border-2 border-dashed transition-all duration-300",
          dragActive ? "border-primary bg-primary/5" : "border-white/10 bg-white/5"
        )}>
          <CardContent 
            className="flex flex-col items-center justify-center py-16 cursor-pointer"
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              multiple
              accept="audio/*"
              onChange={handleChange}
            />
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
              <UploadIcon className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">오디오 파일을 드래그하거나 클릭하세요</h3>
            <p className="text-muted-foreground">WAV, MP3, OGG 지원 (최대 50MB)</p>
          </CardContent>
        </Card>

        {/* File List */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <FileAudio className="w-5 h-5 text-primary" />
              업로드된 파일 ({uploadedFiles.length})
            </h2>
            <div className="grid gap-4">
              {uploadedFiles.map((audioFile) => (
                <Card key={audioFile.id} className="glass-panel border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center border border-white/10">
                        <Music className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{audioFile.name}</h4>
                        <p className="text-sm text-muted-foreground">{formatFileSize(audioFile.size)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="icon" variant="ghost" className="hover:bg-white/10 hover:text-primary">
                        <Play className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="hover:bg-red-500/10 hover:text-red-500"
                        onClick={() => removeFile(audioFile.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] border-0 flex-1"
                onClick={() => navigate("/analyze")}
              >
                <ArrowRight className="mr-2 h-5 w-5" />
                파일 분석으로 이동
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white/20 bg-white/5 hover:bg-white/10 hover:text-white backdrop-blur-sm flex-1"
                onClick={() => navigate("/compare")}
              >
                <ArrowRight className="mr-2 h-5 w-5" />
                비교 분석으로 이동
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
