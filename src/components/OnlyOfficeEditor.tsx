import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, X, RefreshCw } from 'lucide-react';
import apiClient from '@/services/apiClient';

interface OnlyOfficeEditorProps {
  templateId: number;
  templateName: string;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

interface EditorConfig {
  document: {
    fileType: string;
    key: string;
    title: string;
    url: string;
    permissions: Record<string, boolean>;
  };
  editorConfig: {
    callbackUrl: string;
    lang: string;
    mode: string;
    user: {
      id: string;
      name: string;
    };
    customization: Record<string, unknown>;
  };
  documentType: string;
  token?: string;
}

declare global {
  interface Window {
    DocsAPI?: {
      DocEditor: new (containerId: string, config: EditorConfig) => {
        destroyEditor: () => void;
      };
    };
  }
}

export function OnlyOfficeEditor({ 
  templateId, 
  templateName, 
  isOpen, 
  onClose,
  onSaved 
}: OnlyOfficeEditorProps) {
  const editorRef = useRef<{ destroyEditor: () => void } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);

  const loadScript = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const existingScript = document.querySelector(`script[src="${src}"]`);
      if (existingScript) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      document.head.appendChild(script);
    });
  };

  const initEditor = async () => {
    if (!isOpen) return;
    
    setLoading(true);
    setError(null);

    try {
      console.log('Fetching OnlyOffice editor config for template:', templateId);
      
      let response;
      try {
        response = await apiClient.get(`/onlyoffice/editor/${templateId}`);
      } catch (apiError: unknown) {
        console.error('API Error:', apiError);
        const errorMessage = apiError instanceof Error ? apiError.message : 'API request failed';
        throw new Error(errorMessage);
      }
      
      console.log('OnlyOffice editor config response:', response);
      
      if (!response?.success) {
        throw new Error(response?.message || response?.error || 'Failed to get editor config');
      }

      const { config, serverUrl } = response.data;

      if (!scriptLoadedRef.current) {
        console.log('Loading OnlyOffice API script from:', serverUrl);
        await loadScript(`${serverUrl}/web-apps/apps/api/documents/api.js`);
        scriptLoadedRef.current = true;
        console.log('OnlyOffice API script loaded');
      }

      console.log('Waiting for DocsAPI...');
      let retries = 0;
      while (!window.DocsAPI && retries < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        retries++;
      }
      console.log('DocsAPI available after', retries, 'retries');

      if (!window.DocsAPI) {
        throw new Error('OnlyOffice API not loaded');
      }

      if (editorRef.current) {
        editorRef.current.destroyEditor();
        editorRef.current = null;
      }

      if (containerRef.current) {
        containerRef.current.innerHTML = '';
        const placeholder = document.createElement('div');
        placeholder.id = 'onlyoffice-editor-container';
        containerRef.current.appendChild(placeholder);
      }

      console.log('Initializing OnlyOffice editor with config:', config);
      
      // Set loading false after a short delay to ensure editor renders
      const loadingTimeout = setTimeout(() => {
        setLoading(false);
      }, 3000);
      
      const enhancedConfig = {
        ...config,
        width: '100%',
        height: '100%',
        events: {
          onReady: () => {
            console.log('OnlyOffice Editor Ready');
            clearTimeout(loadingTimeout);
            setLoading(false);
          },
          onError: (event: { data: { errorCode?: number; errorDescription?: string } | string }) => {
            console.error('OnlyOffice Error:', event);
            clearTimeout(loadingTimeout);
            let errorMsg = 'Editor error occurred';
            if (event.data && typeof event.data === 'object') {
              errorMsg = `Error ${event.data.errorCode || 'unknown'}: ${event.data.errorDescription || 'Unknown error'}`;
            } else if (typeof event.data === 'string') {
              errorMsg = event.data;
            }
            setError(errorMsg);
            setLoading(false);
          },
          onDocumentStateChange: (event: { data: boolean }) => {
            console.log('Document state changed:', event.data ? 'modified' : 'saved');
          },
          onSave: () => {
            console.log('Document saved');
            onSaved?.();
          },
        },
      };

      editorRef.current = new window.DocsAPI.DocEditor(
        'onlyoffice-editor-container',
        enhancedConfig
      );

    } catch (err) {
      console.error('Error initializing OnlyOffice editor:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize editor');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(initEditor, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, templateId]);

  useEffect(() => {
    return () => {
      if (editorRef.current) {
        editorRef.current.destroyEditor();
        editorRef.current = null;
      }
    };
  }, []);

  const handleClose = () => {
    if (editorRef.current) {
      editorRef.current.destroyEditor();
      editorRef.current = null;
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && handleClose()}>
      <DialogContent 
        className="overflow-hidden flex flex-col p-0 gap-0"
        style={{ maxWidth: '95vw', width: '95vw', height: '95vh' }}
      >
        <DialogHeader className="px-4 py-2 border-b flex-row items-center justify-between shrink-0">
          <DialogTitle className="flex items-center gap-2">
            Edit Template: {templateName}
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="flex-1 relative" style={{ height: 'calc(95vh - 60px)' }}>
          {loading && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-background z-10 pointer-events-none">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="text-sm text-muted-foreground">
                  Memuat editor dokumen...
                </span>
              </div>
            </div>
          )}
          
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
              <div className="flex flex-col items-center gap-4 max-w-md text-center">
                <div className="text-destructive font-medium">
                  Gagal memuat editor
                </div>
                <p className="text-sm text-muted-foreground">{error}</p>
                <div className="flex gap-2">
                  <Button onClick={initEditor} variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Coba Lagi
                  </Button>
                  <Button onClick={handleClose} variant="ghost" size="sm">
                    Tutup
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          <div 
            ref={containerRef} 
            className="w-full h-full"
            style={{ minHeight: '100%' }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
