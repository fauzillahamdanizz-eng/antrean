'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Copy, Download, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const templates = [
  {
    id: 'queueJoined',
    name: 'Queue Joined',
    description: 'Email saat user ambil nomor antrian',
    color: 'from-purple-500 to-indigo-600',
  },
  {
    id: 'queueServingSoon',
    name: 'Queue Serving Soon',
    description: 'Email ketika antrian akan segera dipanggil',
    color: 'from-orange-500 to-red-600',
  },
  {
    id: 'queueNowServing',
    name: 'Queue Now Serving',
    description: 'Email saat antrian sedang dilayani',
    color: 'from-green-500 to-emerald-600',
  },
  {
    id: 'queueCompleted',
    name: 'Queue Completed',
    description: 'Email saat pelayanan selesai',
    color: 'from-blue-500 to-cyan-600',
  },
  {
    id: 'queueCancelled',
    name: 'Queue Cancelled',
    description: 'Email saat antrian dibatalkan',
    color: 'from-red-500 to-rose-600',
  },
  {
    id: 'queuePositionUpdate',
    name: 'Position Update',
    description: 'Email update posisi antrian',
    color: 'from-violet-500 to-purple-600',
  },
  {
    id: 'systemAnnouncement',
    name: 'System Announcement',
    description: 'Email pengumuman sistem',
    color: 'from-slate-500 to-gray-600',
  },
  {
    id: 'testEmail',
    name: 'Test Email',
    description: 'Email untuk testing',
    color: 'from-indigo-500 to-purple-600',
  },
];

export default function EmailTemplatesPage() {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [iframeKey, setIframeKey] = useState(0);
  const [testEmail, setTestEmail] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handlePreview = (templateId: string) => {
    setSelectedTemplate(templateId);
    setIframeKey((prev) => prev + 1);
  };

  const handleCopyHTML = async () => {
    if (!selectedTemplate) return;
    const response = await fetch(`/api/email-templates/preview?template=${selectedTemplate}`);
    const html = await response.text();
    await navigator.clipboard.writeText(html);
    toast({ title: '✓ Berhasil', description: 'HTML disalin ke clipboard' });
  };

  const handleDownloadHTML = async () => {
    if (!selectedTemplate) return;
    const response = await fetch(`/api/email-templates/preview?template=${selectedTemplate}`);
    const html = await response.text();
    const blob = new Blob([html], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTemplate}.html`;
    a.click();
  };

  const handleSendTest = async () => {
    if (!testEmail) {
      toast({ title: 'Error', description: 'Masukkan alamat email terlebih dahulu', variant: 'destructive' });
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch('/api/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          userName: 'Test User',
        }),
      });

      if (response.ok) {
        toast({ title: '✓ Berhasil', description: 'Email uji berhasil dikirim' });
        setTestEmail('');
      } else {
        const error = await response.json();
        toast({ title: 'Error', description: error.error || 'Gagal mengirim email', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Gagal mengirim email uji', variant: 'destructive' });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Email Templates</h1>
          </div>
          <p className="text-gray-600">Preview dan test semua email template notifikasi antrian</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Templates List */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Templates
                </CardTitle>
                <CardDescription>Pilih template untuk di-preview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handlePreview(template.id)}
                    className={`w-full text-left p-3 rounded-lg transition ${
                      selectedTemplate === template.id
                        ? 'bg-gradient-to-r ' + template.color + ' text-white shadow-lg'
                        : 'bg-slate-50 hover:bg-slate-100 text-gray-900'
                    }`}
                  >
                    <div className="font-semibold text-sm">{template.name}</div>
                    <div className={`text-xs ${selectedTemplate === template.id ? 'text-white/80' : 'text-gray-500'}`}>
                      {template.description}
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Test Email Section */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Test Email</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label htmlFor="test-email">Email Address</Label>
                  <Input
                    id="test-email"
                    type="email"
                    placeholder="your@email.com"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <Button
                  onClick={handleSendTest}
                  disabled={isSending || !testEmail}
                  className="w-full"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isSending ? 'Sending...' : 'Send Test Email'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Preview */}
          <div className="lg:col-span-2">
            {selectedTemplate ? (
              <Card className="overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <div>
                    <CardTitle>Preview</CardTitle>
                    <CardDescription>
                      Template: {templates.find((t) => t.id === selectedTemplate)?.name}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyHTML}
                      className="gap-2 bg-transparent"
                    >
                      <Copy className="w-4 h-4" />
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadHTML}
                      className="gap-2 bg-transparent"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-slate-100 rounded-lg overflow-hidden border">
                    <iframe
                      key={iframeKey}
                      src={`/api/email-templates/preview?template=${selectedTemplate}`}
                      className="w-full border-0"
                      style={{ height: '600px' }}
                      title="Email Preview"
                    />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="h-96 flex items-center justify-center">
                <div className="text-center">
                  <Mail className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Pilih template untuk di-preview</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
